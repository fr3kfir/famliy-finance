'use client';

import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { deleteTransaction } from '@/lib/storage';
import { Trash2 } from 'lucide-react';

interface Props { transactions: Transaction[]; onChanged: () => void; limit?: number; }

function emoji(category: string) {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((c) => c.name === category)?.emoji ?? '📦';
}

function groupByDate(txs: Transaction[]) {
  const map: Record<string, Transaction[]> = {};
  [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach((t) => {
    const key = new Date(t.date).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });
  return Object.entries(map);
}

const MEMBER_COLOR: Record<string, string> = {
  כפיר: '#0071e3',
  אדר: '#bf5af2',
  משותף: '#6e6e73',
};

export default function TransactionList({ transactions, onChanged, limit }: Props) {
  const displayed = limit ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit) : transactions;
  const grouped = groupByDate(displayed);

  if (!transactions.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'var(--bg)' }}>💸</div>
      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>אין עסקאות עדיין</p>
      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>לחצו + להוספה</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {grouped.map(([date, txs]) => (
        <div key={date}>
          <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>{date}</p>
          <div className="surface overflow-hidden">
            {txs.map((tx, i) => (
              <div key={tx.id}
                className="flex items-center gap-3 px-4 py-3.5 group transition-colors hover:bg-gray-50"
                style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: tx.type === 'income' ? 'var(--income-light)' : 'var(--expense-light)' }}>
                  {emoji(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {tx.description || tx.category}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{tx.category}</span>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'var(--text-tertiary)' }} />
                    <span className="text-xs font-medium" style={{ color: MEMBER_COLOR[tx.member] ?? '#6e6e73' }}>{tx.member}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm tabular-nums"
                    style={{ color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('he-IL')} ₪
                  </span>
                  <button onClick={() => { deleteTransaction(tx.id); onChanged(); }}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: 'var(--text-tertiary)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

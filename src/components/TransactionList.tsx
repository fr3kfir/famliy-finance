'use client';

import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { deleteTransaction } from '@/lib/storage';
import { Trash2 } from 'lucide-react';

interface Props { transactions: Transaction[]; onChanged: () => void; limit?: number; }

function emoji(cat: string) {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.name === cat)?.emoji ?? '📦';
}

const MEMBER_COLOR: Record<string, string> = { כפיר: '#4F46E5', אדר: '#7C3AED', משותף: '#9CA3AF' };

function byDate(txs: Transaction[]) {
  const map: Record<string, Transaction[]> = {};
  [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(t => {
    const key = new Date(t.date).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });
    (map[key] ??= []).push(t);
  });
  return Object.entries(map);
}

export default function TransactionList({ transactions, onChanged, limit }: Props) {
  const src = limit
    ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
    : transactions;

  if (!transactions.length) return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🫙</div>
      <p style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>ריק לגמרי</p>
      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>לחצו + להוספת פעולה ראשונה</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {byDate(src).map(([date, txs]) => (
        <div key={date}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, paddingRight: 4 }}>{date}</p>
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            {txs.map((tx, i) => (
              <div key={tx.id} className="tx-row" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s'
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: tx.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>{emoji(tx.category)}</div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.description || tx.category}
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{tx.category}</span>
                    <span style={{ fontSize: 8, color: 'var(--text-3)' }}>●</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: MEMBER_COLOR[tx.member] ?? 'var(--text-3)' }}>{tx.member}</span>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('he-IL')} ₪
                  </span>
                  <button onClick={() => { deleteTransaction(tx.id); onChanged(); }}
                    style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-bg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}>
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

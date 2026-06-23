'use client';

import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { deleteTransaction } from '@/lib/storage';
import { Trash2 } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onChanged: () => void;
  limit?: number;
}

function getCategoryEmoji(category: string): string {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  return all.find((c) => c.name === category)?.emoji ?? '📦';
}

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((t) => {
    const d = new Date(t.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[d]) groups[d] = [];
    groups[d].push(t);
  });
  return Object.entries(groups);
}

export default function TransactionList({ transactions, onChanged, limit }: Props) {
  function handleDelete(id: string) {
    deleteTransaction(id);
    onChanged();
  }

  const displayed = limit ? transactions.slice(0, limit) : transactions;

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💸</div>
        <p className="text-gray-400 font-medium">אין עסקאות עדיין</p>
        <p className="text-gray-300 text-sm mt-1">לחץ על &quot;הוסף עסקה&quot; להתחלה</p>
      </div>
    );
  }

  const grouped = groupByDate(displayed);

  return (
    <div className="flex flex-col gap-4">
      {grouped.map(([date, txs]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-gray-400 mb-2 px-1">{date}</p>
          <div className="flex flex-col gap-2">
            {txs.map((tx) => (
              <div key={tx.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {getCategoryEmoji(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tx.category}
                    {tx.member && tx.member !== 'כולם' && ` · ${tx.member}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('he-IL')} ₪
                  </span>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="w-7 h-7 rounded-full text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors flex items-center justify-center"
                  >
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

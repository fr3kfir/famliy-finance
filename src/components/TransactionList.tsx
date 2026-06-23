'use client';

import { Transaction } from '@/lib/types';
import { deleteTransaction } from '@/lib/storage';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onChanged: () => void;
}

export default function TransactionList({ transactions, onChanged }: Props) {
  function handleDelete(id: string) {
    deleteTransaction(id);
    onChanged();
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        אין עסקאות עדיין — הוסף את הראשונה!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => (
        <div key={tx.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border">
          <div className={`rounded-full p-2 ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{tx.description || tx.category}</p>
            <p className="text-xs text-gray-400">{tx.category} · {new Date(tx.date).toLocaleDateString('he-IL')}</p>
          </div>
          <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('he-IL')} ₪
          </span>
          <button
            onClick={() => handleDelete(tx.id)}
            className="text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

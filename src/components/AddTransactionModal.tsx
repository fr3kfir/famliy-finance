'use client';

import { useState } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { addTransaction } from '@/lib/storage';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddTransactionModal({ onClose, onAdded }: Props) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !category) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    };
    addTransaction(tx);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">הוסף עסקה</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex rounded-xl overflow-hidden border">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-500'}`}
            >
              הוצאה
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'income' ? 'bg-green-500 text-white' : 'bg-white text-gray-500'}`}
            >
              הכנסה
            </button>
          </div>

          <input
            type="number"
            placeholder="סכום (₪)"
            required
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="">בחר קטגוריה</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="תיאור (אופציונלי)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl py-2.5 font-semibold hover:bg-blue-700 transition-colors"
          >
            הוסף
          </button>
        </form>
      </div>
    </div>
  );
}

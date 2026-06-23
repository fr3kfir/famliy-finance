'use client';

import { useState } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, FAMILY_MEMBERS } from '@/lib/types';
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
  const [member, setMember] = useState('כולם');

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
      member,
    };
    addTransaction(tx);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">הוסף עסקה</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Type toggle */}
          <div className="flex rounded-2xl overflow-hidden border border-gray-200 mt-4">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${type === 'expense' ? 'expense-gradient text-white shadow-sm' : 'bg-white text-gray-500'}`}
            >
              💸 הוצאה
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${type === 'income' ? 'income-gradient text-white shadow-sm' : 'bg-white text-gray-500'}`}
            >
              💵 הכנסה
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">סכום</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₪</span>
              <input
                type="number"
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-200 rounded-2xl pr-10 pl-4 py-3 w-full text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">קטגוריה</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${category === c.name ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-center leading-tight">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Member */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">בן/בת משפחה</label>
            <div className="flex gap-2 flex-wrap">
              {FAMILY_MEMBERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMember(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${member === m ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">תיאור (אופציונלי)</label>
            <input
              type="text"
              placeholder="למה שולם?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-200 rounded-2xl px-4 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">תאריך</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-200 rounded-2xl px-4 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
          </div>

          <button
            type="submit"
            className={`${type === 'expense' ? 'expense-gradient' : 'income-gradient'} text-white rounded-2xl py-4 font-bold text-base shadow-lg mt-2`}
          >
            {type === 'expense' ? '➕ הוסף הוצאה' : '➕ הוסף הכנסה'}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MEMBERS } from '@/lib/types';
import { addTransaction } from '@/lib/storage';
import { X } from 'lucide-react';

interface Props { onClose: () => void; onAdded: () => void; }

export default function AddTransactionModal({ onClose, onAdded }: Props) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [member, setMember] = useState<'כפיר' | 'אדר' | 'משותף'>('משותף');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !category) return;
    addTransaction({ id: Date.now().toString(), type, amount: parseFloat(amount), category, description, date, member });
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>עסקה חדשה</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-6 flex flex-col gap-5">
          {/* Type */}
          <div className="flex rounded-xl overflow-hidden p-1" style={{ background: 'var(--bg)' }}>
            <button type="button" onClick={() => { setType('expense'); setCategory(''); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={type === 'expense' ? { background: '#fff', color: 'var(--expense)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: 'var(--text-secondary)' }}>
              הוצאה
            </button>
            <button type="button" onClick={() => { setType('income'); setCategory(''); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={type === 'income' ? { background: '#fff', color: 'var(--income)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: 'var(--text-secondary)' }}>
              הכנסה
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>סכום</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-lg" style={{ color: 'var(--text-tertiary)' }}>₪</span>
              <input
                type="number" placeholder="0" required min="0" step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full border rounded-xl pr-10 pl-4 py-3 text-2xl font-bold focus:outline-none"
                style={{ borderColor: 'var(--border)', color: type === 'expense' ? 'var(--expense)' : 'var(--income)' }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>קטגוריה</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((c) => (
                <button key={c.name} type="button" onClick={() => setCategory(c.name)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all"
                  style={category === c.name
                    ? { borderColor: 'var(--accent)', background: 'var(--accent-light)', color: 'var(--accent)' }
                    : { borderColor: 'var(--border)', background: '#fff', color: 'var(--text-secondary)' }
                  }>
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-[10px] font-medium leading-tight">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Member */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>של מי?</label>
            <div className="flex gap-2">
              {MEMBERS.map((m) => (
                <button key={m} type="button" onClick={() => setMember(m as typeof member)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                  style={member === m
                    ? { borderColor: 'var(--accent)', background: 'var(--accent-light)', color: 'var(--accent)' }
                    : { borderColor: 'var(--border)', background: '#fff', color: 'var(--text-secondary)' }
                  }>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>תיאור (אופציונלי)</label>
            <input type="text" placeholder="למה שולם?" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>תאריך</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <button type="button" onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl font-semibold text-white mt-1 transition-opacity hover:opacity-90"
            style={{ background: type === 'expense' ? 'var(--expense)' : 'var(--income)' }}>
            הוסף {type === 'expense' ? 'הוצאה' : 'הכנסה'}
          </button>
        </div>
      </div>
    </div>
  );
}

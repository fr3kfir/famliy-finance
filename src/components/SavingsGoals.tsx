'use client';

import { useState } from 'react';
import { SavingsGoal } from '@/lib/types';
import { saveGoals } from '@/lib/storage';
import { Plus, Target, Pencil, Trash2 } from 'lucide-react';

interface Props {
  goals: SavingsGoal[];
  onChanged: () => void;
}

export default function SavingsGoals({ goals, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const newGoals = [...goals, { id: Date.now().toString(), name, target: parseFloat(target), current: 0 }];
    saveGoals(newGoals);
    setName(''); setTarget(''); setAdding(false);
    onChanged();
  }

  function handleContribute(id: string) {
    const amt = parseFloat(addAmount);
    if (!amt) return;
    const updated = goals.map((g) => g.id === id ? { ...g, current: Math.min(g.current + amt, g.target) } : g);
    saveGoals(updated);
    setEditingId(null); setAddAmount('');
    onChanged();
  }

  function handleDelete(id: string) {
    saveGoals(goals.filter((g) => g.id !== id));
    onChanged();
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2"><Target size={18} /> יעדי חיסכון</h3>
        <button onClick={() => setAdding(true)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
          <Plus size={16} /> הוסף יעד
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input required placeholder="שם היעד" value={name} onChange={(e) => setName(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input required type="number" placeholder="יעד (₪)" value={target} onChange={(e) => setTarget(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <button type="submit" className="bg-blue-600 text-white rounded-xl px-3 py-2 text-sm font-semibold">שמור</button>
          <button type="button" onClick={() => setAdding(false)} className="text-gray-400 text-sm px-2">ביטול</button>
        </form>
      )}

      {goals.length === 0 && !adding && (
        <p className="text-gray-400 text-sm text-center py-6">הוסף יעד חיסכון ראשון</p>
      )}

      <div className="flex flex-col gap-4">
        {goals.map((g) => {
          const pct = Math.min((g.current / g.target) * 100, 100);
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{g.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{g.current.toLocaleString('he-IL')} / {g.target.toLocaleString('he-IL')} ₪</span>
                  <button onClick={() => setEditingId(editingId === g.id ? null : g.id)} className="text-gray-300 hover:text-blue-400"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(g.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{pct.toFixed(0)}% הושלם</div>
              {editingId === g.id && (
                <div className="flex gap-2 mt-2">
                  <input type="number" placeholder="הוסף סכום (₪)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)}
                    className="border rounded-xl px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <button onClick={() => handleContribute(g.id)} className="bg-blue-600 text-white rounded-xl px-3 py-1.5 text-sm font-medium">הוסף</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

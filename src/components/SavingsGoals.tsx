'use client';

import { useState } from 'react';
import { SavingsGoal } from '@/lib/types';
import { saveGoals } from '@/lib/storage';
import { Plus, Trash2 } from 'lucide-react';

const GOAL_EMOJIS = ['🏖️', '🚗', '🏠', '📱', '✈️', '🎓', '💍', '🏋️', '🎮', '💰'];

interface Props {
  goals: SavingsGoal[];
  onChanged: () => void;
}

export default function SavingsGoals({ goals, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState('🏖️');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    saveGoals([...goals, { id: Date.now().toString(), name, target: parseFloat(target), current: 0, emoji }]);
    setName(''); setTarget(''); setEmoji('🏖️'); setAdding(false);
    onChanged();
  }

  function handleContribute(id: string) {
    const amt = parseFloat(addAmount);
    if (!amt) return;
    saveGoals(goals.map((g) => g.id === id ? { ...g, current: Math.min(g.current + amt, g.target) } : g));
    setEditingId(null); setAddAmount('');
    onChanged();
  }

  function handleDelete(id: string) {
    saveGoals(goals.filter((g) => g.id !== id));
    onChanged();
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">🎯 יעדי חיסכון</h3>
          <p className="text-xs text-gray-400 mt-0.5">עקוב אחר המטרות שלך</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 bg-blue-600 text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={13} /> יעד חדש
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-blue-50 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-blue-600 shadow-md scale-110' : 'bg-white hover:bg-blue-100'}`}
              >
                {e}
              </button>
            ))}
          </div>
          <input required placeholder="שם היעד (למשל: חופשה)" value={name} onChange={(e) => setName(e.target.value)}
            className="border border-blue-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
          <input required type="number" placeholder="סכום יעד (₪)" value={target} onChange={(e) => setTarget(e.target.value)}
            className="border border-blue-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold">שמור יעד</button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 text-gray-500 text-sm">ביטול</button>
          </div>
        </form>
      )}

      {goals.length === 0 && !adding && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-gray-400 text-sm">הוסף יעד חיסכון ראשון</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {goals.map((g) => {
          const pct = Math.min((g.current / g.target) * 100, 100);
          const remaining = g.target - g.current;
          return (
            <div key={g.id}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                  {g.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{g.name}</span>
                    <button onClick={() => handleDelete(g.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-gray-500">{g.current.toLocaleString('he-IL')} / {g.target.toLocaleString('he-IL')} ₪</span>
                    <span className="text-xs font-bold text-blue-600">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #4facfe)' }}
                />
              </div>
              {pct < 100 && (
                <p className="text-xs text-gray-400 mt-1">נותר {remaining.toLocaleString('he-IL')} ₪</p>
              )}
              {pct >= 100 && (
                <p className="text-xs text-green-600 font-semibold mt-1">🎉 היעד הושג!</p>
              )}

              {editingId === g.id ? (
                <div className="flex gap-2 mt-2">
                  <input type="number" placeholder="סכום להוסיף (₪)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <button onClick={() => handleContribute(g.id)} className="bg-blue-600 text-white rounded-xl px-3 py-1.5 text-sm font-medium">הוסף</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm px-1">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingId(g.id)}
                  className="text-xs text-blue-500 hover:text-blue-700 mt-1.5 font-medium"
                >
                  + הוסף חיסכון
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

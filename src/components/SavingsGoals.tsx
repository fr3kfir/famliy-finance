'use client';

import { useState } from 'react';
import { SavingsGoal } from '@/lib/types';
import { saveGoals } from '@/lib/storage';
import { Plus, Trash2 } from 'lucide-react';

const EMOJIS = ['🏖️', '🚗', '🏠', '📱', '✈️', '🎓', '💍', '👶', '🎮', '💰', '🛋️', '🐾'];

interface Props { goals: SavingsGoal[]; onChanged: () => void; }

export default function SavingsGoals({ goals, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState('🏖️');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !target) return;
    saveGoals([...goals, { id: Date.now().toString(), name, target: parseFloat(target), current: 0, emoji }]);
    setName(''); setTarget(''); setEmoji('🏖️'); setAdding(false);
    onChanged();
  }

  function contribute(id: string) {
    const amt = parseFloat(addAmount);
    if (!amt) return;
    saveGoals(goals.map((g) => g.id === id ? { ...g, current: Math.min(g.current + amt, g.target) } : g));
    setEditingId(null); setAddAmount('');
    onChanged();
  }

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>יעדי חיסכון</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{goals.length} יעדים פעילים</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          <Plus size={13} /> הוסף
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl p-4 mb-4 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all"
                style={emoji === e ? { background: 'var(--accent)', boxShadow: '0 2px 8px rgba(0,113,227,0.3)' } : { background: '#fff', border: '1px solid var(--border)' }}>
                {e}
              </button>
            ))}
          </div>
          <input required placeholder="שם היעד" value={name} onChange={(e) => setName(e.target.value)}
            className="border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none" style={{ borderColor: 'var(--border)' }} />
          <input required type="number" placeholder="סכום יעד (₪)" value={target} onChange={(e) => setTarget(e.target.value)}
            className="border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none" style={{ borderColor: 'var(--border)' }} />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>שמור</button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>ביטול</button>
          </div>
        </form>
      )}

      {goals.length === 0 && !adding && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>הגדירו יעד חיסכון ראשון</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {goals.map((g) => {
          const pct = Math.min((g.current / g.target) * 100, 100);
          return (
            <div key={g.id}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{g.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>{pct.toFixed(0)}%</span>
                      <button onClick={() => { saveGoals(goals.filter((x) => x.id !== g.id)); onChanged(); }}
                        className="opacity-40 hover:opacity-100 transition-opacity" style={{ color: 'var(--expense)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    <span>{g.current.toLocaleString('he-IL')} ₪</span>
                    <span>{g.target.toLocaleString('he-IL')} ₪</span>
                  </div>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--income)' : 'var(--accent)' }} />
              </div>
              {pct >= 100
                ? <p className="text-xs mt-1 font-medium" style={{ color: 'var(--income)' }}>🎉 הושג!</p>
                : editingId === g.id
                  ? (
                    <div className="flex gap-2 mt-2">
                      <input type="number" placeholder="סכום (₪)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }} />
                      <button onClick={() => contribute(g.id)} className="px-3 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>הוסף</button>
                      <button onClick={() => setEditingId(null)} className="text-sm px-1" style={{ color: 'var(--text-tertiary)' }}>✕</button>
                    </div>
                  )
                  : (
                    <button onClick={() => setEditingId(g.id)} className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>
                      + הוסף חיסכון
                    </button>
                  )
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

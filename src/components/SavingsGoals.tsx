'use client';

import { useState } from 'react';
import { SavingsGoal } from '@/lib/types';
import { saveGoals } from '@/lib/storage';
import { Plus, Trash2 } from 'lucide-react';

const EMOJIS = ['🏖️', '🚗', '🏠', '📱', '✈️', '🎓', '💍', '👶', '🛋️', '💰', '🐾', '🎮'];

interface Props { goals: SavingsGoal[]; onChanged: () => void; }

export default function SavingsGoals({ goals, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState('🏖️');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amt, setAmt] = useState('');

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !target) return;
    saveGoals([...goals, { id: Date.now().toString(), name, target: parseFloat(target), current: 0, emoji }]);
    setName(''); setTarget(''); setEmoji('🏖️'); setAdding(false); onChanged();
  }

  function contribute(id: string) {
    const a = parseFloat(amt);
    if (!a) return;
    saveGoals(goals.map(g => g.id === id ? { ...g, current: Math.min(g.current + a, g.target) } : g));
    setEditingId(null); setAmt(''); onChanged();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Add button */}
      <button onClick={() => setAdding(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, border: '1.5px dashed var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
        <Plus size={16} /> הוסף יעד חיסכון
      </button>

      {/* Add form */}
      {adding && (
        <form onSubmit={add} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>יעד חדש</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                style={{ width: 40, height: 40, borderRadius: 10, fontSize: 20, border: `2px solid ${emoji === e ? 'var(--accent)' : 'var(--border)'}`, background: emoji === e ? 'var(--accent-bg)' : 'var(--white)', cursor: 'pointer' }}>
                {e}
              </button>
            ))}
          </div>
          <input required placeholder="שם היעד" value={name} onChange={e => setName(e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 14, width: '100%', outline: 'none' }} />
          <input required type="number" placeholder="סכום יעד (₪)" value={target} onChange={e => setTarget(e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 14, width: '100%', outline: 'none' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>שמור</button>
            <button type="button" onClick={() => setAdding(false)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--white)', fontSize: 14, color: 'var(--text-2)', cursor: 'pointer' }}>ביטול</button>
          </div>
        </form>
      )}

      {/* Goals list */}
      {goals.map(g => {
        const pct = Math.min((g.current / g.target) * 100, 100);
        const done = pct >= 100;
        return (
          <div key={g.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {g.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{g.name}</p>
                  <button onClick={() => { saveGoals(goals.filter(x => x.id !== g.id)); onChanged(); }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
                  {g.current.toLocaleString('he-IL')} מתוך {g.target.toLocaleString('he-IL')} ₪
                </p>
              </div>
            </div>

            <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: done ? 'var(--green)' : 'var(--accent)', transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, color: done ? 'var(--green)' : 'var(--text-3)', fontWeight: done ? 600 : 400 }}>
                {done ? '🎉 הושג!' : `נותר ${(g.target - g.current).toLocaleString('he-IL')} ₪`}
              </p>
              <span style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--green)' : 'var(--accent)' }}>{pct.toFixed(0)}%</span>
            </div>

            {!done && (editingId === g.id
              ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <input type="number" placeholder="הוסף סכום (₪)" value={amt} onChange={e => setAmt(e.target.value)}
                    style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none' }} />
                  <button onClick={() => contribute(g.id)} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>הוסף</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', color: 'var(--text-2)', fontSize: 14 }}>✕</button>
                </div>
              )
              : (
                <button onClick={() => setEditingId(g.id)} style={{ marginTop: 14, padding: '10px', width: '100%', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                  + הוסף חיסכון
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

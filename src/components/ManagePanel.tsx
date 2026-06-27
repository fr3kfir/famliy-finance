'use client';

import { useState } from 'react';
import { BudgetSettings, RecurringTransaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MEMBERS } from '@/lib/types';
import { saveBudget, saveRecurring } from '@/lib/storage';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

interface Props {
  budget:    BudgetSettings;
  recurring: RecurringTransaction[];
  onChanged: () => void;
}

export default function ManagePanel({ budget, recurring, onChanged }: Props) {
  const [view, setView] = useState<'budget' | 'recurring'>('budget');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Sub-tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--white)', borderRadius: 16, padding: 4, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        {([['budget', 'תקציב חודשי'], ['recurring', 'הוצאות קבועות']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            style={{ padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: view === id ? 'var(--accent)' : 'transparent',
              color: view === id ? '#fff' : 'var(--text-3)' }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'budget'    && <BudgetEditor    budget={budget}       onChanged={onChanged} />}
      {view === 'recurring' && <RecurringEditor recurring={recurring} onChanged={onChanged} />}
    </div>
  );
}

// ─── Budget editor ────────────────────────────────────────────────────────────
function BudgetEditor({ budget, onChanged }: { budget: BudgetSettings; onChanged: () => void }) {
  const [local, setLocal] = useState<BudgetSettings>({ ...budget });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await saveBudget(local);
    onChanged();
    setSaving(false);
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>קבע תקציב חודשי לכל קטגוריה</p>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>השאר ריק = ללא תקציב לקטגוריה</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {EXPENSE_CATEGORIES.map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{c.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-1)' }}>{c.name}</span>
            <div style={{ position: 'relative', width: 110 }}>
              <input type="number" min="0" step="100" placeholder="—"
                value={local[c.name] ?? ''}
                onChange={e => setLocal(prev => {
                  const v = parseFloat(e.target.value);
                  if (!e.target.value || isNaN(v)) { const n = { ...prev }; delete n[c.name]; return n; }
                  return { ...prev, [c.name]: v };
                })}
                style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 30px 8px 10px', fontSize: 13, outline: 'none', textAlign: 'right', color: 'var(--text-1)' }} />
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-3)' }}>₪</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving}
        style={{ marginTop: 20, width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'שומר...' : 'שמור תקציב'}
      </button>
    </div>
  );
}

// ─── Recurring editor ─────────────────────────────────────────────────────────
function RecurringEditor({ recurring, onChanged }: { recurring: RecurringTransaction[]; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [type,   setType]   = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [cat,    setCat]    = useState('');
  const [desc,   setDesc]   = useState('');
  const [member, setMember] = useState<'כפיר' | 'אדר' | 'משותף'>('משותף');
  const [day,    setDay]    = useState('1');
  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !cat) return;
    const updated = [...recurring, {
      id: Date.now().toString(), type, amount: parseFloat(amount),
      category: cat, description: desc, member, dayOfMonth: parseInt(day), active: true,
    }];
    await saveRecurring(updated);
    setAdding(false); setAmount(''); setCat(''); setDesc('');
    onChanged();
  }

  async function remove(id: string) {
    await saveRecurring(recurring.filter(r => r.id !== id));
    onChanged();
  }

  async function toggle(id: string) {
    await saveRecurring(recurring.map(r => r.id === id ? { ...r, active: !r.active } : r));
    onChanged();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={() => setAdding(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, border: '1.5px dashed var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
        <Plus size={16} /> הוסף הוצאה/הכנסה קבועה
      </button>

      {adding && (
        <form onSubmit={add} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700 }}>פעולה חוזרת חדשה</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--bg)', borderRadius: 12, padding: 4 }}>
            {(['expense', 'income'] as const).map(t => (
              <button key={t} type="button" onClick={() => { setType(t); setCat(''); }}
                style={{ padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: type === t ? 'var(--white)' : 'transparent',
                  color: type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text-3)',
                  boxShadow: type === t ? 'var(--shadow)' : 'none' }}>
                {t === 'expense' ? 'הוצאה' : 'הכנסה'}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>סכום (₪)</p>
              <input type="number" required min="1" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none' }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>יום בחודש</p>
              <select value={day} onChange={e => setDay(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: 'var(--white)' }}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d} לחודש</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>קטגוריה</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cats.map(c => (
                <button key={c.name} type="button" onClick={() => setCat(c.name)}
                  style={{ padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${cat === c.name ? 'var(--accent)' : 'var(--border)'}`,
                    background: cat === c.name ? 'var(--accent-bg)' : 'var(--white)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    color: cat === c.name ? 'var(--accent)' : 'var(--text-2)' }}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {MEMBERS.map(m => (
              <button key={m} type="button" onClick={() => setMember(m as typeof member)}
                style={{ padding: '8px', borderRadius: 10, border: `1.5px solid ${member === m ? 'var(--accent)' : 'var(--border)'}`,
                  background: member === m ? 'var(--accent-bg)' : 'var(--white)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600, color: member === m ? 'var(--accent)' : 'var(--text-2)' }}>
                {m}
              </button>
            ))}
          </div>

          <input type="text" placeholder="תיאור (ארנונה, חשמל...)" value={desc} onChange={e => setDesc(e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none' }} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit"
              style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              הוסף
            </button>
            <button type="button" onClick={() => setAdding(false)}
              style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--white)', fontSize: 14, color: 'var(--text-2)', cursor: 'pointer' }}>
              ביטול
            </button>
          </div>
        </form>
      )}

      {recurring.map(r => (
        <div key={r.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: r.active ? 1 : 0.5 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: r.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            <RefreshCw size={18} color={r.type === 'income' ? 'var(--green)' : 'var(--red)'} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{r.description || r.category}</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.category} · כל {r.dayOfMonth} לחודש · {r.member}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: r.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
              {r.type === 'income' ? '+' : '-'}{r.amount.toLocaleString('he-IL')} ₪
            </span>
            <button onClick={() => toggle(r.id)}
              style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                background: r.active ? 'var(--green-bg)' : 'var(--border)',
                color: r.active ? 'var(--green)' : 'var(--text-3)' }}>
              {r.active ? '✓' : '—'}
            </button>
            <button onClick={() => remove(r.id)}
              style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {!recurring.length && !adding && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: 13 }}>
          <p>אין עדיין פעולות קבועות.</p>
          <p style={{ marginTop: 4 }}>הוסיפו ארנונה, חשמל, ביטוח...</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MEMBERS } from '@/lib/types';
import { updateTransaction } from '@/lib/storage';
import { X } from 'lucide-react';

interface Props { tx: Transaction; onClose: () => void; onSaved: () => void; }

export default function EditTransactionModal({ tx, onClose, onSaved }: Props) {
  const [type,        setType]        = useState(tx.type);
  const [amount,      setAmount]      = useState(String(tx.amount));
  const [category,    setCategory]    = useState(tx.category);
  const [description, setDescription] = useState(tx.description);
  const [date,        setDate]        = useState(tx.date);
  const [member,      setMember]      = useState(tx.member);
  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const accentColor = type === 'expense' ? 'var(--red)' : 'var(--green)';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !category) return;
    await updateTransaction(tx.id, { type, amount: parseFloat(amount), category, description, date, member });
    onSaved(); onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--white)', width: '100%', maxWidth: 480, borderRadius: '28px 28px 0 0', maxHeight: '92svh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 16px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>עריכת פעולה</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--bg)', borderRadius: 14, padding: 4 }}>
            {(['expense', 'income'] as const).map(t => (
              <button key={t} type="button" onClick={() => { setType(t); setCategory(''); }}
                style={{ padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
                  background: type === t ? 'var(--white)' : 'transparent',
                  color: type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text-3)',
                  boxShadow: type === t ? 'var(--shadow)' : 'none' }}>
                {t === 'expense' ? 'הוצאה' : 'הכנסה'}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', marginBottom: 8 }}>סכום</p>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ fontSize: 36, fontWeight: 300, color: 'var(--text-3)', marginLeft: 4 }}>₪</span>
              <input type="number" required min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                style={{ fontSize: 48, fontWeight: 800, width: 200, border: 'none', background: 'transparent', textAlign: 'center', color: accentColor, outline: 'none' }} />
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 10 }}>קטגוריה</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {cats.map(c => (
                <button key={c.name} type="button" onClick={() => setCategory(c.name)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', borderRadius: 12,
                    border: `1.5px solid ${category === c.name ? accentColor : 'var(--border)'}`,
                    background: category === c.name ? (type === 'expense' ? 'var(--red-bg)' : 'var(--green-bg)') : 'var(--white)',
                    cursor: 'pointer', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 22 }}>{c.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: category === c.name ? accentColor : 'var(--text-2)', lineHeight: 1.2, textAlign: 'center' }}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 10 }}>של מי?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {MEMBERS.map(m => (
                <button key={m} type="button" onClick={() => setMember(m as typeof member)}
                  style={{ padding: '10px', borderRadius: 12, border: `1.5px solid ${member === m ? 'var(--accent)' : 'var(--border)'}`,
                    background: member === m ? 'var(--accent-bg)' : 'var(--white)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: member === m ? 'var(--accent)' : 'var(--text-2)', transition: 'all 0.15s' }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>תיאור</p>
            <input type="text" placeholder="תיאור קצר (אופציונלי)" value={description} onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text-1)', background: 'var(--white)', outline: 'none' }} />
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>תאריך</p>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)}
              style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text-1)', background: 'var(--white)', outline: 'none' }} />
          </div>

          <button type="submit"
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            שמור שינויים
          </button>
        </form>
      </div>
    </div>
  );
}

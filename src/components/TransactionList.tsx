'use client';

import { useState } from 'react';
import { Transaction, categoryEmoji } from '@/lib/types';
import { deleteTransaction } from '@/lib/storage';
import { Trash2, Pencil } from 'lucide-react';
import EditTransactionModal from './EditTransactionModal';

interface Props {
  transactions: Transaction[];
  onChanged: () => void;
  limit?: number;
  showSearch?: boolean;
}

const MEMBER_COLOR: Record<string, string> = { כפיר: '#4F46E5', אדר: '#7C3AED', משותף: '#9CA3AF' };

function byDate(txs: Transaction[]) {
  const map: Record<string, Transaction[]> = {};
  [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach(t => {
      const key = new Date(t.date).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });
      (map[key] ??= []).push(t);
    });
  return Object.entries(map);
}

export default function TransactionList({ transactions, onChanged, limit, showSearch }: Props) {
  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState<'all' | 'income' | 'expense'>('all');
  const [editTx,  setEditTx]  = useState<Transaction | null>(null);

  const filtered = transactions.filter(t => {
    if (filter === 'income'  && t.type !== 'income')  return false;
    if (filter === 'expense' && t.type !== 'expense') return false;
    if (query) {
      const q = query.toLowerCase();
      if (!t.description?.toLowerCase().includes(q) &&
          !t.category?.toLowerCase().includes(q) &&
          !t.member?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const src = limit
    ? [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
    : filtered;

  if (!transactions.length) return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🫙</div>
      <p style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>ריק לגמרי</p>
      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>לחצו + להוספת פעולה ראשונה</p>
    </div>
  );

  return (
    <>
      {showSearch && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
          <input type="text" placeholder="🔍  חיפוש..." value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'var(--white)', color: 'var(--text-1)' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'expense', 'income'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                  background: filter === f ? 'var(--accent)' : 'var(--border)',
                  color: filter === f ? '#fff' : 'var(--text-2)' }}>
                {f === 'all' ? 'הכל' : f === 'expense' ? 'הוצאות' : 'הכנסות'}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-3)', alignSelf: 'center', marginRight: 'auto' }}>
              {src.length} פעולות
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {byDate(src).map(([date, txs]) => (
          <div key={date}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingRight: 4 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>{date}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) > 0 &&
                  `-${txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toLocaleString('he-IL')} ₪`}
              </p>
            </div>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              {txs.map((tx, i) => (
                <div key={tx.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: tx.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {categoryEmoji(tx.category)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || tx.category}
                    </p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{tx.category}</span>
                      <span style={{ fontSize: 8, color: 'var(--text-3)' }}>●</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: MEMBER_COLOR[tx.member] ?? 'var(--text-3)' }}>{tx.member}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('he-IL')} ₪
                    </span>
                    <button onClick={() => setEditTx(tx)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={async () => { await deleteTransaction(tx.id); onChanged(); }}
                      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-bg)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {src.length === 0 && transactions.length > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>אין תוצאות לחיפוש</p>
        )}
      </div>

      {editTx && (
        <EditTransactionModal tx={editTx} onClose={() => setEditTx(null)} onSaved={() => { setEditTx(null); onChanged(); }} />
      )}
    </>
  );
}

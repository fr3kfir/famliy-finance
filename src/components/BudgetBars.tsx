'use client';

import { Transaction, BudgetSettings, EXPENSE_CATEGORIES, categoryEmoji } from '@/lib/types';
import { getCategoryBreakdown } from '@/lib/analytics';

interface Props {
  transactions: Transaction[];
  budget: BudgetSettings;
  onManage: () => void;
}

export default function BudgetBars({ transactions, budget, onManage }: Props) {
  const breakdown = getCategoryBreakdown(transactions);
  const hasBudget = Object.keys(budget).length > 0;

  if (!hasBudget) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>תקציב חודשי</p>
          <button onClick={onManage}
            style={{ fontSize: 12, color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
            הגדר תקציב ›
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
          הגדירו תקציב לכל קטגוריה כדי לעקוב כמה נשאר
        </p>
      </div>
    );
  }

  const categories = EXPENSE_CATEGORIES.map(c => ({
    name:    c.name,
    emoji:   c.emoji,
    spent:   breakdown.find(b => b.name === c.name)?.value ?? 0,
    limit:   budget[c.name] ?? 0,
  })).filter(c => c.limit > 0 || c.spent > 0);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>תקציב החודש</p>
        <button onClick={onManage}
          style={{ fontSize: 12, color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
          ערוך ›
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {categories.map(c => {
          const hasLimit = c.limit > 0;
          const pct      = hasLimit ? Math.min((c.spent / c.limit) * 100, 100) : 0;
          const over     = hasLimit && c.spent > c.limit;
          const warn     = hasLimit && pct >= 80 && !over;
          const color    = over ? 'var(--red)' : warn ? 'var(--yellow)' : 'var(--green)';
          const remaining = hasLimit ? c.limit - c.spent : null;

          return (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{c.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{c.name}</span>
                  {over && <span style={{ fontSize: 10, background: 'var(--red-bg)', color: 'var(--red)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>חריגה!</span>}
                  {warn && <span style={{ fontSize: 10, background: 'var(--yellow-bg)', color: 'var(--yellow)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>כמעט</span>}
                </div>
                <div style={{ textAlign: 'left', fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: over ? 'var(--red)' : 'var(--text-1)' }}>
                    {c.spent.toLocaleString('he-IL')}
                  </span>
                  {hasLimit && (
                    <span style={{ color: 'var(--text-3)' }}> / {c.limit.toLocaleString('he-IL')} ₪</span>
                  )}
                </div>
              </div>

              {hasLimit && (
                <>
                  <div style={{ height: 7, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>
                  {remaining !== null && remaining > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                      נשאר {remaining.toLocaleString('he-IL')} ₪
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

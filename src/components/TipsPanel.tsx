'use client';

import { Transaction } from '@/lib/types';
import { getSavingsTips } from '@/lib/analytics';

export default function TipsPanel({ transactions }: { transactions: Transaction[] }) {
  const tips = getSavingsTips(transactions);
  return (
    <div className="surface p-5">
      <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>המלצות</p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>על בסיס ההרגלים שלכם</p>
      <div className="flex flex-col gap-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-3 items-start rounded-xl p-3" style={{ background: 'var(--warning-light)' }}>
            <span className="text-base flex-shrink-0">💡</span>
            <p className="text-sm leading-relaxed" style={{ color: '#7c4700' }}>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

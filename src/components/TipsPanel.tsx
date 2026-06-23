'use client';

import { Transaction } from '@/lib/types';
import { getSavingsTips } from '@/lib/analytics';

export default function TipsPanel({ transactions }: { transactions: Transaction[] }) {
  const tips = getSavingsTips(transactions);
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 text-sm mb-1">💡 המלצות לחיסכון</h3>
      <p className="text-xs text-gray-400 mb-4">על בסיס ההוצאות שלכם</p>
      <ul className="flex flex-col gap-3">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3 items-start bg-amber-50 rounded-xl p-3">
            <span className="text-amber-400 text-lg flex-shrink-0">💡</span>
            <p className="text-sm text-amber-800 leading-relaxed">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

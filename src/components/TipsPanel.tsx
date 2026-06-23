'use client';

import { Transaction } from '@/lib/types';
import { getSavingsTips } from '@/lib/analytics';
import { Lightbulb } from 'lucide-react';

export default function TipsPanel({ transactions }: { transactions: Transaction[] }) {
  const tips = getSavingsTips(transactions);
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
        <Lightbulb size={18} /> טיפים לייעול הוצאות
      </h3>
      <ul className="flex flex-col gap-2">
        {tips.map((tip, i) => (
          <li key={i} className="text-sm text-amber-800 flex gap-2">
            <span className="mt-0.5 text-amber-400">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

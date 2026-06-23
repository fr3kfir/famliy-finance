'use client';

interface Props {
  label: string;
  amount: number;
  color: string;
  bg: string;
  note?: string;
}

export default function StatCard({ label, amount, color, bg, note }: Props) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: bg }}>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
      <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {amount.toLocaleString('he-IL')} <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>₪</span>
      </span>
      {note && <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{note}</span>}
    </div>
  );
}

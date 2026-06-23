'use client';

interface StatCardProps {
  title: string;
  amount: number;
  color: 'green' | 'red' | 'blue';
  icon: React.ReactNode;
}

const colors = {
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
};

const amountColors = {
  green: 'text-green-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
};

export default function StatCard({ title, amount, color, icon }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]} flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm font-medium opacity-70">{title}</p>
        <p className={`text-2xl font-bold ${amountColors[color]}`}>
          {amount.toLocaleString('he-IL')} ₪
        </p>
      </div>
    </div>
  );
}

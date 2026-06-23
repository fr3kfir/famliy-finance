'use client';

interface StatCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  gradient: string;
  icon: string;
  trend?: number;
}

export default function StatCard({ title, amount, subtitle, gradient, icon, trend }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className={`${gradient} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white/10 -translate-x-8 -translate-y-8" />
      <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-white/10 translate-x-4 translate-y-4" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-sm font-medium">{title}</span>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-3xl font-bold mb-1">
          {amount.toLocaleString('he-IL')} <span className="text-xl font-medium">₪</span>
        </p>
        {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(trend).toLocaleString('he-IL')} ₪ מהחודש שעבר
          </p>
        )}
      </div>
    </div>
  );
}

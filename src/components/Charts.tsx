'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Transaction } from '@/lib/types';
import { getLast6MonthsData, getCategoryBreakdown } from '@/lib/analytics';

const PIE_COLORS = ['#0071e3', '#bf5af2', '#30d158', '#ff9500', '#ff3b30', '#5e5ce6', '#32ade6', '#ff6961'];

interface Props { transactions: Transaction[]; currentMonthTransactions: Transaction[]; }

export default function Charts({ transactions, currentMonthTransactions }: Props) {
  const areaData = getLast6MonthsData(transactions);
  const pieData = getCategoryBreakdown(currentMonthTransactions);
  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="surface p-5">
        <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>תזרים חצי שנתי</p>
        <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>הכנסות מול הוצאות</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={areaData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#30d158" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#30d158" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#aeaeb2' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#aeaeb2' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => `${Number(v).toLocaleString('he-IL')} ₪`}
              contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            />
            <Area type="monotone" dataKey="הכנסות" stroke="#30d158" strokeWidth={2} fill="url(#ig)" dot={false} />
            <Area type="monotone" dataKey="הוצאות" stroke="#ff3b30" strokeWidth={2} fill="url(#eg)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-3">
          {[['הכנסות', '#30d158'], ['הוצאות', '#ff3b30']].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="surface p-5">
        <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>הוצאות לפי קטגוריה</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>חודש נוכחי</p>
        {pieData.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: 'var(--text-tertiary)' }}>אין נתונים</p>
        ) : (
          <div className="flex gap-4 items-center">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {pieData.slice(0, 6).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {item.value.toLocaleString('he-IL')} ₪
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

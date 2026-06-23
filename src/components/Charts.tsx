'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Transaction } from '@/lib/types';
import { getLast6MonthsData, getCategoryBreakdown } from '@/lib/analytics';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16'];

interface Props {
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
}

export default function Charts({ transactions, currentMonthTransactions }: Props) {
  const areaData = getLast6MonthsData(transactions);
  const pieData = getCategoryBreakdown(currentMonthTransactions);

  return (
    <div className="flex flex-col gap-4">
      {/* Area chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-1 text-sm">תזרים 6 חודשים אחרונים</h3>
        <p className="text-xs text-gray-400 mb-4">הכנסות מול הוצאות</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => `${Number(v).toLocaleString('he-IL')} ₪`}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
            />
            <Area type="monotone" dataKey="הכנסות" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" />
            <Area type="monotone" dataKey="הוצאות" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-full bg-green-500" /> הכנסות
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-full bg-red-500" /> הוצאות
          </div>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-1 text-sm">פירוט הוצאות החודש</h3>
        <p className="text-xs text-gray-400 mb-4">לפי קטגוריה</p>
        {pieData.length === 0 ? (
          <div className="text-center text-gray-300 py-10 text-sm">אין הוצאות החודש</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${Number(v).toLocaleString('he-IL')} ₪`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-3">
              {pieData.slice(0, 5).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{item.value.toLocaleString('he-IL')} ₪</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

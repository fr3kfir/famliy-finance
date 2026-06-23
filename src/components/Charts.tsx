'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Transaction } from '@/lib/types';
import { getLast6MonthsData, getCategoryBreakdown } from '@/lib/analytics';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

interface Props {
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
}

export default function Charts({ transactions, currentMonthTransactions }: Props) {
  const barData = getLast6MonthsData(transactions);
  const pieData = getCategoryBreakdown(currentMonthTransactions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <h3 className="font-bold text-gray-700 mb-4">הכנסות vs הוצאות — 6 חודשים אחרונים</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${Number(v).toLocaleString('he-IL')} ₪`} />
            <Legend />
            <Bar dataKey="הכנסות" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="הוצאות" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <h3 className="font-bold text-gray-700 mb-4">התפלגות הוצאות — חודש נוכחי</h3>
        {pieData.length === 0 ? (
          <div className="text-center text-gray-400 py-16 text-sm">אין נתונים לחודש זה</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={11}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${Number(v).toLocaleString('he-IL')} ₪`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

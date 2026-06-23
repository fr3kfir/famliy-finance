'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, SavingsGoal } from '@/lib/types';
import { getTransactions, getGoals } from '@/lib/storage';
import { getMonthlyStats } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import AddTransactionModal from '@/components/AddTransactionModal';
import TransactionList from '@/components/TransactionList';
import Charts from '@/components/Charts';
import SavingsGoals from '@/components/SavingsGoals';
import TipsPanel from '@/components/TipsPanel';
import { Plus, LayoutDashboard, List, TrendingUp, Lightbulb } from 'lucide-react';

type Tab = 'dashboard' | 'transactions' | 'analytics' | 'tips';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'בית', icon: <LayoutDashboard size={18} /> },
  { id: 'transactions', label: 'עסקאות', icon: <List size={18} /> },
  { id: 'analytics', label: 'גרפים', icon: <TrendingUp size={18} /> },
  { id: 'tips', label: 'טיפים', icon: <Lightbulb size={18} /> },
];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const reload = useCallback(() => {
    setTransactions(getTransactions());
    setGoals(getGoals());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const { income, expenses, savings } = getMonthlyStats(transactions, now.getFullYear(), now.getMonth());
  const prev = getMonthlyStats(transactions, prevMonth.getFullYear(), prevMonth.getMonth());

  const currentMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const monthLabel = now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top header */}
      <div className="gradient-card text-white px-4 pt-10 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">ניהול פיננסי משפחתי</p>
              <h1 className="text-2xl font-bold mt-0.5">שלום משפחה 👋</h1>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              🏡
            </div>
          </div>
          <p className="text-white/60 text-xs mt-2">{monthLabel}</p>
        </div>
      </div>

      {/* Stat cards — overlapping header */}
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            title="הכנסות"
            amount={income}
            gradient="income-gradient"
            icon="💵"
            trend={income - prev.income}
          />
          <StatCard
            title="הוצאות"
            amount={expenses}
            gradient="expense-gradient"
            icon="💸"
            trend={expenses - prev.expenses}
          />
          <StatCard
            title="חיסכון"
            amount={savings}
            gradient="savings-gradient"
            icon="🐷"
            trend={savings - prev.savings}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        {tab === 'dashboard' && (
          <div className="flex flex-col gap-5">
            {/* Quick summary bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">אחוז חיסכון החודש</p>
                  <p className="text-2xl font-bold text-gray-800 mt-0.5">
                    {income > 0 ? Math.round((savings / income) * 100) : 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">עסקאות החודש</p>
                  <p className="text-2xl font-bold text-gray-800 mt-0.5">{currentMonthTxs.length}</p>
                </div>
              </div>
              {income > 0 && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((expenses / income) * 100, 100)}%`,
                        background: expenses / income > 0.9 ? '#ef4444' : expenses / income > 0.7 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>הוצאות {income > 0 ? Math.round((expenses / income) * 100) : 0}% מהכנסות</span>
                    <span className={savings >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                      {savings >= 0 ? '✓ חיובי' : '⚠ גירעון'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800 text-sm">עסקאות אחרונות</h2>
                <button onClick={() => setTab('transactions')} className="text-xs text-blue-500 font-medium">
                  הצג הכל ›
                </button>
              </div>
              <TransactionList transactions={transactions} onChanged={reload} limit={5} />
            </div>

            {/* Savings goals */}
            <SavingsGoals goals={goals} onChanged={reload} />
          </div>
        )}

        {tab === 'transactions' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800">כל העסקאות</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                {transactions.length} פעולות
              </span>
            </div>
            <TransactionList transactions={transactions} onChanged={reload} />
          </div>
        )}

        {tab === 'analytics' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-gray-800">ניתוח פיננסי</h2>
            <Charts transactions={transactions} currentMonthTransactions={currentMonthTxs} />
          </div>
        )}

        {tab === 'tips' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-gray-800">טיפים לחיסכון</h2>
            <TipsPanel transactions={transactions} />
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white z-30 transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-20">
        <div className="max-w-lg mx-auto flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${tab === t.id ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {t.icon}
              <span className="text-[10px] font-medium">{t.label}</span>
              {tab === t.id && <div className="w-1 h-1 rounded-full bg-blue-600" />}
            </button>
          ))}
        </div>
      </nav>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={reload} />}
    </div>
  );
}

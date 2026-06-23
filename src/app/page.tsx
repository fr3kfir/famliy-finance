'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, SavingsGoal } from '@/lib/types';
import { getTransactions, getGoals } from '@/lib/storage';
import { getMonthlyStats, getMemberSplit } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import AddTransactionModal from '@/components/AddTransactionModal';
import TransactionList from '@/components/TransactionList';
import Charts from '@/components/Charts';
import SavingsGoals from '@/components/SavingsGoals';
import TipsPanel from '@/components/TipsPanel';
import { LayoutDashboard, List, BarChart2, Lightbulb, Plus } from 'lucide-react';

type Tab = 'home' | 'transactions' | 'charts' | 'tips';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<Tab>('home');

  const now = new Date();
  const reload = useCallback(() => { setTransactions(getTransactions()); setGoals(getGoals()); }, []);
  useEffect(() => { reload(); }, [reload]);

  const { income, expenses, savings } = getMonthlyStats(transactions, now.getFullYear(), now.getMonth());
  const split = getMemberSplit(transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }));
  const currentMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const savingPct = income > 0 ? Math.round((savings / income) * 100) : 0;
  const spendingPct = income > 0 ? Math.min(Math.round((expenses / income) * 100), 100) : 0;
  const barColor = spendingPct > 90 ? 'var(--expense)' : spendingPct > 70 ? 'var(--warning)' : 'var(--income)';

  const monthLabel = now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 px-4 pt-5 pb-4 bg-transparent">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>משק הבית</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{monthLabel}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'var(--accent)' }}>
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 flex flex-col gap-4">
        {tab === 'home' && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="הכנסות" amount={income} color="var(--income)" bg="var(--income-light)" />
              <StatCard label="הוצאות" amount={expenses} color="var(--expense)" bg="var(--expense-light)" />
              <StatCard label="חיסכון" amount={savings} color="var(--accent)" bg="var(--accent-light)" />
            </div>

            {/* Spending bar */}
            <div className="surface p-4">
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>ניצול תקציב</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: barColor }}>{spendingPct}%</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${spendingPct}%`, background: barColor }} />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {spendingPct > 90 ? '⚠️ מעל התקציב' : spendingPct > 70 ? 'בקצה הגבול' : `חוסכים ${savingPct}% מההכנסה`}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{currentMonthTxs.length} פעולות החודש</p>
              </div>
            </div>

            {/* Member split */}
            <div className="surface p-4">
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>הוצאות לפי בן זוג</p>
              <div className="grid grid-cols-3 gap-3">
                {(['כפיר', 'אדר', 'משותף'] as const).map((m) => (
                  <div key={m} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: 'var(--bg)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{m}</span>
                    <span className="text-base font-bold tabular-nums" style={{ color: m === 'כפיר' ? '#0071e3' : m === 'אדר' ? '#bf5af2' : 'var(--text-secondary)' }}>
                      {(split[m] ?? 0).toLocaleString('he-IL')} ₪
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>עסקאות אחרונות</p>
                <button onClick={() => setTab('transactions')} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  הכל ›
                </button>
              </div>
              <TransactionList transactions={transactions} onChanged={reload} limit={8} />
            </div>

            <SavingsGoals goals={goals} onChanged={reload} />
          </>
        )}

        {tab === 'transactions' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>כל העסקאות</p>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                {transactions.length}
              </span>
            </div>
            <TransactionList transactions={transactions} onChanged={reload} />
          </>
        )}

        {tab === 'charts' && (
          <>
            <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>ניתוח</p>
            <Charts transactions={transactions} currentMonthTransactions={currentMonthTxs} />
          </>
        )}

        {tab === 'tips' && (
          <>
            <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>המלצות</p>
            <TipsPanel transactions={transactions} />
          </>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-lg mx-auto flex">
          {([
            { id: 'home', label: 'בית', icon: LayoutDashboard },
            { id: 'transactions', label: 'עסקאות', icon: List },
            { id: 'charts', label: 'ניתוח', icon: BarChart2 },
            { id: 'tips', label: 'טיפים', icon: Lightbulb },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                <t.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={reload} />}
    </div>
  );
}

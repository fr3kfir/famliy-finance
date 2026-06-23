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
import { Plus, Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'dashboard' | 'transactions'>('dashboard');

  const now = new Date();

  const reload = useCallback(() => {
    setTransactions(getTransactions());
    setGoals(getGoals());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const { income, expenses, savings } = getMonthlyStats(transactions, now.getFullYear(), now.getMonth());
  const currentMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">משפחה פיננסית</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow"
          >
            <Plus size={16} />
            הוסף עסקה
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-1">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            לוח בקרה
          </button>
          <button
            onClick={() => setTab('transactions')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'transactions' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            עסקאות
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-gray-500 font-medium">
              {now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="הכנסות החודש" amount={income} color="green" icon={<TrendingUp size={28} />} />
              <StatCard title="הוצאות החודש" amount={expenses} color="red" icon={<TrendingDown size={28} />} />
              <StatCard title="חיסכון החודש" amount={savings} color="blue" icon={<PiggyBank size={28} />} />
            </div>

            <Charts transactions={transactions} currentMonthTransactions={currentMonthTxs} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SavingsGoals goals={goals} onChanged={reload} />
              <TipsPanel transactions={transactions} />
            </div>
          </div>
        )}

        {tab === 'transactions' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-gray-700">כל העסקאות ({transactions.length})</h2>
            <TransactionList transactions={transactions} onChanged={reload} />
          </div>
        )}
      </main>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={reload} />}
    </div>
  );
}

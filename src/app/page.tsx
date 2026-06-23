'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, SavingsGoal } from '@/lib/types';
import { getTransactions, getGoals } from '@/lib/storage';
import { getMonthlyStats, getMemberSplit, getCategoryBreakdown, getLast6MonthsData } from '@/lib/analytics';
import AddTransactionModal from '@/components/AddTransactionModal';
import TransactionList from '@/components/TransactionList';
import SavingsGoals from '@/components/SavingsGoals';
import { Plus, Home, List, PieChart, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell } from 'recharts';

type Tab = 'home' | 'transactions' | 'stats' | 'goals';

const PIE_COLORS = ['#4F46E5', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#BE185D', '#65A30D'];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [tab, setTab] = useState<Tab>('home');
  const [showAdd, setShowAdd] = useState(false);

  const now = new Date();
  const reload = useCallback(() => { setTransactions(getTransactions()); setGoals(getGoals()); }, []);
  useEffect(() => { reload(); }, [reload]);

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const { income, expenses, savings } = getMonthlyStats(transactions, now.getFullYear(), now.getMonth());
  const split = getMemberSplit(thisMonth);
  const pieData = getCategoryBreakdown(thisMonth);
  const chartData = getLast6MonthsData(transactions);
  const savePct = income > 0 ? Math.round((savings / income) * 100) : 0;
  const spendPct = income > 0 ? Math.min(Math.round((expenses / income) * 100), 100) : 0;
  const barColor = spendPct > 90 ? 'var(--red)' : spendPct > 70 ? 'var(--yellow)' : 'var(--green)';

  const monthName = now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  const TABS = [
    { id: 'home' as Tab, icon: Home, label: 'בית' },
    { id: 'transactions' as Tab, icon: List, label: 'עסקאות' },
    { id: 'stats' as Tab, icon: PieChart, label: 'סטטיסטיקה' },
    { id: 'goals' as Tab, icon: Target, label: 'יעדים' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100svh', paddingBottom: 88 }}>

      {/* ── HEADER ── */}
      <header style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '20px 20px 0' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 500 }}>{monthName}</p>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>משק הבית</h1>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(79,70,229,0.4)' }}
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, padding: '8px 0', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: tab === t.id ? 'var(--accent)' : 'var(--text-3)', borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── HOME ── */}
        {tab === 'home' && <>

          {/* Balance hero */}
          <div className="card" style={{ padding: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', marginBottom: 4 }}>יתרה נטו החודש</p>
            <p style={{ fontSize: 40, fontWeight: 800, color: savings >= 0 ? 'var(--text-1)' : 'var(--red)', letterSpacing: -1, lineHeight: 1 }}>
              {savings.toLocaleString('he-IL')} <span style={{ fontSize: 20, fontWeight: 500 }}>₪</span>
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)' }}>הכנסות</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>+{income.toLocaleString('he-IL')} ₪</p>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)' }}>הוצאות</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>-{expenses.toLocaleString('he-IL')} ₪</p>
              </div>
              {income > 0 && <>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)' }}>חיסכון</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{savePct}%</p>
                </div>
              </>}
            </div>
          </div>

          {/* Spending bar */}
          {income > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'baseline' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>ניצול הכנסה</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{spendPct}%</p>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${spendPct}%`, background: barColor, borderRadius: 99, transition: 'width 0.5s' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                {spendPct > 90 ? '⚠️ מעל 90% מההכנסה הוצאה' : spendPct > 70 ? 'קרוב לגבול — שמרו על עצמכם' : `נשאר לחיסכון: ${savings.toLocaleString('he-IL')} ₪`}
              </p>
            </div>
          )}

          {/* כפיר / אדר split */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>הוצאות לפי בן/בת זוג</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {(['כפיר', 'אדר', 'משותף'] as const).map((m, i) => (
                <div key={m} style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{m}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: i === 0 ? 'var(--accent)' : i === 1 ? '#7C3AED' : 'var(--text-2)' }}>
                    {(split[m] ?? 0).toLocaleString('he-IL')} ₪
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>פעולות אחרונות</p>
              <button onClick={() => setTab('transactions')} style={{ fontSize: 12, color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}>הכל ›</button>
            </div>
            <TransactionList transactions={transactions} onChanged={reload} limit={6} />
          </div>
        </>}

        {/* ── TRANSACTIONS ── */}
        {tab === 'transactions' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700 }}>כל הפעולות</p>
            <span style={{ fontSize: 12, background: 'var(--border)', padding: '3px 10px', borderRadius: 99, color: 'var(--text-2)', fontWeight: 500 }}>{transactions.length}</span>
          </div>
          <TransactionList transactions={transactions} onChanged={reload} />
        </>}

        {/* ── STATS ── */}
        {tab === 'stats' && <>
          <p style={{ fontSize: 16, fontWeight: 700 }}>סטטיסטיקה</p>

          {/* Area chart */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>תזרים — 6 חודשים</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>הכנסות מול הוצאות</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${Number(v).toLocaleString('he-IL')} ₪`}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, boxShadow: 'var(--shadow-md)' }} />
                <Area type="monotone" dataKey="הכנסות" stroke="#059669" strokeWidth={2} fill="url(#gIncome)" dot={false} />
                <Area type="monotone" dataKey="הוצאות" stroke="#DC2626" strokeWidth={2} fill="url(#gExpense)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
              {[['הכנסות', '#059669'], ['הוצאות', '#DC2626']].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>הוצאות לפי קטגוריה</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>חודש נוכחי</p>
            {pieData.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>אין הוצאות החודש</p>
              : <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ResponsiveContainer width={120} height={120}>
                    <RePie>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3} strokeWidth={0}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                    </RePie>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pieData.slice(0, 5).map((item, i) => {
                      const total = pieData.reduce((s, d) => s + d.value, 0);
                      return (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{item.value.toLocaleString('he-IL')} ₪</span>
                            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{Math.round((item.value / total) * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            }
          </div>

          {/* Member stats */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>התפלגות לפי בן/בת זוג</p>
            {(['כפיר', 'אדר', 'משותף'] as const).map((m, i) => {
              const val = split[m] ?? 0;
              const total = (split.כפיר ?? 0) + (split.אדר ?? 0) + (split.משותף ?? 0);
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              const color = i === 0 ? 'var(--accent)' : i === 1 ? '#7C3AED' : 'var(--text-3)';
              return (
                <div key={m} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{m}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{val.toLocaleString('he-IL')} ₪</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ── GOALS ── */}
        {tab === 'goals' && <>
          <p style={{ fontSize: 16, fontWeight: 700 }}>יעדי חיסכון</p>
          <SavingsGoals goals={goals} onChanged={reload} />
        </>}

      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex' }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
                color: active ? 'var(--accent)' : 'var(--text-3)', transition: 'color 0.15s'
              }}>
                <t.icon size={21} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onAdded={reload} />}
    </div>
  );
}

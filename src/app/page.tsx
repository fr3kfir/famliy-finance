'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, SavingsGoal, BudgetSettings, RecurringTransaction } from '@/lib/types';
import { loadAllData, getTransactions, getGoals, getBudget, getRecurring, applyRecurring } from '@/lib/storage';
import { getMonthlyStats, getMemberSplit, getCategoryBreakdown, getLast6MonthsData, getTodayStats, getProjection } from '@/lib/analytics';
import AddTransactionModal from '@/components/AddTransactionModal';
import TransactionList from '@/components/TransactionList';
import SavingsGoals from '@/components/SavingsGoals';
import BudgetBars from '@/components/BudgetBars';
import ManagePanel from '@/components/ManagePanel';
import { Plus, Home, List, PieChart, Settings, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell, ReferenceLine } from 'recharts';

type Tab = 'home' | 'transactions' | 'stats' | 'manage';

const PIE_COLORS = ['#4F46E5', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#BE185D', '#65A30D'];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals,        setGoals]        = useState<SavingsGoal[]>([]);
  const [budget,       setBudget]       = useState<BudgetSettings>({});
  const [recurring,    setRecurring]    = useState<RecurringTransaction[]>([]);
  const [tab,          setTab]          = useState<Tab>('home');
  const [showAdd,      setShowAdd]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [syncing,      setSyncing]      = useState(false);
  const [lastSync,     setLastSync]     = useState<Date | null>(null);

  const reload = useCallback(async () => {
    setSyncing(true);
    try {
      await loadAllData();
      setTransactions(getTransactions());
      setGoals(getGoals());
      setBudget(getBudget());
      setRecurring(getRecurring());
      setLastSync(new Date());
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAllData();
      await applyRecurring();
      setTransactions(getTransactions());
      setGoals(getGoals());
      setBudget(getBudget());
      setRecurring(getRecurring());
      setLastSync(new Date());
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const id = setInterval(reload, 30_000);
    return () => clearInterval(id);
  }, [reload]);

  const now      = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const { income, expenses, savings } = getMonthlyStats(transactions, now.getFullYear(), now.getMonth());
  const split     = getMemberSplit(thisMonth);
  const pieData   = getCategoryBreakdown(thisMonth);
  const chartData = getLast6MonthsData(transactions);
  const today     = getTodayStats(transactions);
  const projection = getProjection(transactions, now.getFullYear(), now.getMonth());

  const savePct  = income > 0 ? Math.round((savings / income) * 100) : 0;
  const spendPct = income > 0 ? Math.min(Math.round((expenses / income) * 100), 100) : 0;
  const barColor = spendPct > 90 ? 'var(--red)' : spendPct > 70 ? 'var(--yellow)' : 'var(--green)';

  const monthName = now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  const TABS = [
    { id: 'home'         as Tab, icon: Home,     label: 'בית' },
    { id: 'transactions' as Tab, icon: List,     label: 'עסקאות' },
    { id: 'stats'        as Tab, icon: PieChart, label: 'ניתוח' },
    { id: 'manage'       as Tab, icon: Settings, label: 'ניהול' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-3)', fontSize: 13 }}>טוען נתונים...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100svh', paddingBottom: 88 }}>

      {/* ── Header ── */}
      <header style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '20px 20px 0', position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 500 }}>{monthName}</p>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>משק הבית</h1>
              {lastSync && (
                <p style={{ color: 'var(--text-3)', fontSize: 10, marginTop: 2 }}>
                  עודכן {lastSync.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => reload()} disabled={syncing}
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', color: 'var(--text-3)', border: '1px solid var(--border)', cursor: syncing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={15} strokeWidth={2} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              </button>
              <button onClick={() => setShowAdd(true)}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}>
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, padding: '8px 0', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  color: tab === t.id ? 'var(--accent)' : 'var(--text-3)',
                  borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.15s' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ══════════════════ HOME ══════════════════ */}
        {tab === 'home' && <>

          {/* Balance hero */}
          <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', border: 'none' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>יתרה נטו — {monthName}</p>
            <p style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>
              {savings.toLocaleString('he-IL')} <span style={{ fontSize: 22, fontWeight: 400 }}>₪</span>
            </p>
            <div style={{ display: 'flex', gap: 20, marginTop: 18 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>הכנסות</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#86efac' }}>+{income.toLocaleString('he-IL')} ₪</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>הוצאות</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fca5a5' }}>-{expenses.toLocaleString('he-IL')} ₪</p>
              </div>
              {income > 0 && <>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
                <div>
                  <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>חיסכון</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{savePct}%</p>
                </div>
              </>}
            </div>
          </div>

          {/* Today + projection row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 6 }}>היום</p>
              {today.spent > 0 || today.earned > 0 ? (
                <>
                  {today.spent > 0 && <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--red)' }}>-{today.spent.toLocaleString('he-IL')} ₪</p>}
                  {today.earned > 0 && <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>+{today.earned.toLocaleString('he-IL')} ₪</p>}
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{today.count} פעולות</p>
                </>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 2 }}>אין פעולות</p>
              )}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 6 }}>תחזית חודש</p>
              {projection && projection.projected > 0 ? (
                <>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>{projection.projected.toLocaleString('he-IL')} ₪</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>נשארו {projection.daysLeft} ימים</p>
                </>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 2 }}>הוסיפו עסקאות</p>
              )}
            </div>
          </div>

          {/* Budget bars */}
          <BudgetBars transactions={thisMonth} budget={budget} onManage={() => setTab('manage')} />

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

          {/* Member split */}
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
              <button onClick={() => setTab('transactions')}
                style={{ fontSize: 12, color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}>הכל ›</button>
            </div>
            <TransactionList transactions={transactions} onChanged={reload} limit={6} />
          </div>
        </>}

        {/* ══════════════════ TRANSACTIONS ══════════════════ */}
        {tab === 'transactions' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700 }}>כל הפעולות</p>
            <span style={{ fontSize: 12, background: 'var(--border)', padding: '3px 10px', borderRadius: 99, color: 'var(--text-2)', fontWeight: 500 }}>
              {transactions.length}
            </span>
          </div>
          <TransactionList transactions={transactions} onChanged={reload} showSearch />
        </>}

        {/* ══════════════════ STATS ══════════════════ */}
        {tab === 'stats' && <>
          <p style={{ fontSize: 16, fontWeight: 700 }}>ניתוח פיננסי</p>

          {/* 6-month bar chart */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>תזרים — 6 חודשים</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>חיסכון נטו (חיובי = ירוק, שלילי = אדום)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <ReferenceLine y={0} stroke="#E5E7EB" strokeWidth={1.5} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString('he-IL')} ₪`, 'תזרים נטו']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }} />
                <Bar dataKey="חיסכון" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.חיסכון >= 0 ? '#059669' : '#DC2626'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>הוצאות לפי קטגוריה</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>חודש נוכחי</p>
            {pieData.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>אין הוצאות החודש</p>
              : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ResponsiveContainer width={120} height={120}>
                    <RePie>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3} strokeWidth={0}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                    </RePie>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pieData.slice(0, 6).map((item, i) => {
                      const total = pieData.reduce((s, d) => s + d.value, 0);
                      return (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{item.value.toLocaleString('he-IL')} ₪</span>
                            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{Math.round((item.value / total) * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            }
          </div>

          {/* Member stats */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>התפלגות לפי בן/בת זוג</p>
            {(['כפיר', 'אדר', 'משותף'] as const).map((m, i) => {
              const val   = split[m] ?? 0;
              const total = (split.כפיר ?? 0) + (split.אדר ?? 0) + (split.משותף ?? 0);
              const pct   = total > 0 ? Math.round((val / total) * 100) : 0;
              const color = i === 0 ? 'var(--accent)' : i === 1 ? '#7C3AED' : 'var(--text-3)';
              return (
                <div key={m} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{m}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{val.toLocaleString('he-IL')} ₪ ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Goals preview */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>יעדי חיסכון</p>
              <button onClick={() => setTab('manage')}
                style={{ fontSize: 12, color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}>ניהול ›</button>
            </div>
            {goals.length === 0
              ? <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>אין יעדים — הגדרו ב-ניהול</p>
              : goals.map(g => {
                  const pct = Math.min((g.current / g.target) * 100, 100);
                  return (
                    <div key={g.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13 }}>{g.emoji} {g.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{g.current.toLocaleString('he-IL')} / {g.target.toLocaleString('he-IL')} ₪</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </>}

        {/* ══════════════════ MANAGE ══════════════════ */}
        {tab === 'manage' && <>
          <p style={{ fontSize: 16, fontWeight: 700 }}>ניהול</p>
          <ManagePanel budget={budget} recurring={recurring} onChanged={reload} />
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>יעדי חיסכון</p>
            <SavingsGoals goals={goals} onChanged={reload} />
          </div>
        </>}

      </main>

      {/* ── Bottom nav ── */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex' }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
                  color: active ? 'var(--accent)' : 'var(--text-3)', transition: 'color 0.15s' }}>
                <t.icon size={21} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onAdded={reload} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

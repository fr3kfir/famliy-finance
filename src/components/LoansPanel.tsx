'use client';

import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Landmark, TrendingUp, ShieldAlert, Lightbulb } from 'lucide-react';
import { simulateLeverage, breakEvenReturn, LoanInput } from '@/lib/loans';

const LS_KEY = 'ff_loan';

const DEFAULT_LOAN: LoanInput = { principal: 40000, payment: 870, months: 48 };

const CHANNELS = [
  { id: 'mm',      name: 'קרן כספית / פיקדון',   ret: 4,   risk: 'נמוך',   riskColor: 'var(--green)',  note: 'כמעט ללא תנודות, נזיל תוך יום-יומיים' },
  { id: 'bonds',   name: 'אג"ח ממשלתיות',        ret: 4.5, risk: 'נמוך-בינוני', riskColor: 'var(--green)',  note: 'תנודות קטנות, מתאים לטווח של 4 שנים' },
  { id: 'mixed',   name: 'תיק מאוזן (מניות/אג"ח)', ret: 6, risk: 'בינוני',  riskColor: 'var(--yellow)', note: 'שילוב, ירידות של 10%-15% אפשריות' },
  { id: 'stocks',  name: 'מדד מניות (S&P 500 / עולמי)', ret: 8, risk: 'גבוה', riskColor: 'var(--red)', note: 'ממוצע היסטורי ארוך טווח, אבל שנה רעה יכולה להיות -30%' },
];

const SCENARIOS = [-10, -5, 0, 4, 8, 12];

const COLOR_INVEST = '#4F46E5';
const COLOR_PAID   = '#D97706';
const COLOR_BAL    = '#9CA3AF';

const inputStyle: React.CSSProperties = {
  border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 12px', fontSize: 15,
  width: '100%', outline: 'none', background: 'var(--white)', color: 'var(--text-1)',
};

const fmt = (n: number) => Math.round(n).toLocaleString('he-IL');
const signed = (n: number) => `${n >= 0 ? '+' : '-'}${fmt(Math.abs(n))} ₪`;
const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

interface Saved { loan?: LoanInput; channel?: string; annualRet?: number; withTax?: boolean; }

function loadSaved(): Saved {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') ?? {}; }
  catch { return {}; }
}

interface Props { monthlyIncome: number; }

export default function LoansPanel({ monthlyIncome }: Props) {
  const [saved] = useState(loadSaved);
  const [loan,      setLoan]      = useState<LoanInput>(saved.loan ?? DEFAULT_LOAN);
  const [channel,   setChannel]   = useState(saved.channel ?? 'bonds');
  const [annualRet, setAnnualRet] = useState(saved.annualRet ?? 4.5);
  const [withTax,   setWithTax]   = useState(saved.withTax ?? true);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ loan, channel, annualRet, withTax })); }
    catch { /* ignore */ }
  }, [loan, channel, annualRet, withTax]);

  const valid   = loan.principal > 0 && loan.payment > 0 && loan.months > 0;
  const taxRate = withTax ? 0.25 : 0;

  const result    = useMemo(() => valid ? simulateLeverage(loan, annualRet / 100, taxRate) : null, [loan, annualRet, taxRate, valid]);
  const breakEven = useMemo(() => valid ? breakEvenReturn(loan, taxRate) : 0, [loan, taxRate, valid]);
  const scenarios = useMemo(() => valid
    ? SCENARIOS.map(s => ({ ret: s, profit: simulateLeverage(loan, s / 100, taxRate).profit }))
    : [], [loan, taxRate, valid]);

  const incomeShare = monthlyIncome > 0 ? loan.payment / monthlyIncome : 0;

  function setField(key: keyof LoanInput, v: string) {
    setLoan(l => ({ ...l, [key]: parseFloat(v) || 0 }));
  }

  function pickChannel(id: string) {
    const c = CHANNELS.find(x => x.id === id);
    setChannel(id);
    if (c) setAnnualRet(c.ret);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 16, fontWeight: 700 }}>הלוואות ומינוף</p>

      {/* ── Loan details ── */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Landmark size={18} color="var(--accent)" />
          <p style={{ fontSize: 13, fontWeight: 600 }}>פרטי ההלוואה</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>סכום (₪)</span>
            <input type="number" inputMode="numeric" value={loan.principal || ''} onChange={e => setField('principal', e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>החזר חודשי (₪)</span>
            <input type="number" inputMode="numeric" value={loan.payment || ''} onChange={e => setField('payment', e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>חודשים</span>
            <input type="number" inputMode="numeric" value={loan.months || ''} onChange={e => setField('months', e.target.value)} style={inputStyle} />
          </label>
        </div>

        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>ריבית שנתית בפועל</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>{pct(result.loanAnnualRate, 2)}</p>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>סה״כ תחזירו</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>{fmt(result.totalRepaid)} ₪</p>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>עלות הריבית</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--red)' }}>{fmt(result.totalInterest)} ₪</p>
            </div>
          </div>
        )}

        {incomeShare > 0 && (
          <p style={{ fontSize: 12, color: incomeShare > 0.3 ? 'var(--red)' : 'var(--text-2)', marginTop: 12 }}>
            ההחזר החודשי הוא {pct(incomeShare, 0)} מההכנסות של החודש הנוכחי.
            {incomeShare > 0.3 && ' זה נטל גבוה, ולכן כדאי להיזהר במיוחד מסיכון.'}
          </p>
        )}
      </div>

      {result && <>
        {/* ── Verdict ── */}
        <div className="card" style={{ padding: 20, background: result.loanAnnualRate < 0.04 ? 'var(--green-bg)' : 'var(--yellow-bg)', border: 'none' }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-1)' }}>
            {result.loanAnnualRate < 0.04 ? 'זו הלוואה זולה, ויש מקום למנף אותה' : 'ההלוואה לא זולה, והמינוף דורש תשואה גבוהה'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            ההלוואה עולה לכם {pct(result.loanAnnualRate, 2)} בשנה. כדי שהמינוף ישתלם צריך תשואה שנתית של
            לפחות <b style={{ color: 'var(--text-1)' }}>{pct(breakEven, 1)}</b>{withTax ? ' (אחרי מס רווחי הון)' : ''}.
            מתחת לזה עדיף לא להשקיע את הכסף, או להחזיר את ההלוואה מוקדם.
          </p>
        </div>

        {/* ── Investment channel ── */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={18} color="var(--accent)" />
            <p style={{ fontSize: 13, fontWeight: 600 }}>איפה להשקיע את ה-{fmt(loan.principal)} ₪?</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHANNELS.map(c => {
              const active = channel === c.id;
              return (
                <button key={c.id} onClick={() => pickChannel(c.id)}
                  style={{ textAlign: 'right', padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'var(--accent-bg)' : 'var(--white)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{c.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>~{c.ret}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.note}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: c.riskColor, whiteSpace: 'nowrap' }}>סיכון {c.risk}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>תשואה שנתית משוערת</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{annualRet}%</span>
            </div>
            <input type="range" min={-10} max={15} step={0.5} value={annualRet}
              onChange={e => { setAnnualRet(parseFloat(e.target.value)); setChannel(''); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={withTax} onChange={e => setWithTax(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            לחשב מס רווחי הון (25%)
          </label>
        </div>

        {/* ── Result ── */}
        <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', border: 'none' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
            רווח נקי מהמינוף אחרי {loan.months} חודשים
          </p>
          <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>{signed(result.profit)}</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>שווי ההשקעה בסוף</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fmt(result.finalValue)} ₪</p>
            </div>
            {withTax && result.tax > 0 && (
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>מס</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fca5a5' }}>-{fmt(result.tax)} ₪</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>החזרתם לבנק</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fmt(result.totalRepaid)} ₪</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 14, lineHeight: 1.5 }}>
            לשם השוואה: אם במקום לקחת הלוואה פשוט תשקיעו {fmt(loan.payment)} ₪ בכל חודש באותו אפיק,
            תרוויחו {signed(result.dcaProfit)}. היתרון של המינוף הוא {signed(result.profit - result.dcaProfit)}.
          </p>
        </div>

        {/* ── Chart ── */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>ההשקעה לעומת ההחזרים לאורך הזמן</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>לפני מס, לפי תשואה של {annualRet}% בשנה</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={result.series} margin={{ top: 8, right: 24, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#EAEDF0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                tickFormatter={m => m % 12 === 0 ? `שנה ${m / 12}` : ''} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={44}
                tickFormatter={v => `${Math.round(v / 1000)}K`} />
              <Tooltip labelFormatter={m => `חודש ${m}`}
                formatter={(v, name) => [`${Number(v).toLocaleString('he-IL')} ₪`, name]}
                contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 11, color: 'var(--text-2)' }} />
              <Line type="monotone" dataKey="שווי ההשקעה" stroke={COLOR_INVEST} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="שולם לבנק"   stroke={COLOR_PAID}   strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="יתרת הלוואה" stroke={COLOR_BAL}    strokeWidth={2} dot={false} strokeDasharray="4 3" activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Scenarios ── */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>מה אם? תרחישי תשואה</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>רווח או הפסד נקי בסוף ההלוואה</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scenarios.map(s => (
              <div key={s.ret} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'var(--bg)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {s.ret}% בשנה{s.ret < 0 ? ' (שוק יורד)' : s.ret === 0 ? ' (הכסף עומד)' : ''}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {signed(s.profit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>}

      {/* ── Tips ── */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Lightbulb size={18} color="var(--yellow)" />
          <p style={{ fontSize: 13, fontWeight: 600 }}>דרכים חכמות למנף את ההלוואה</p>
        </div>
        <ul style={{ margin: 0, paddingInlineStart: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>
          <li><b style={{ color: 'var(--text-1)' }}>לסגור קודם חובות יקרים.</b> מינוס בבנק, כרטיס אשראי בתשלומים או הלוואה אחרת בריבית של 8%-15%: סגירה שלהם היא תשואה בטוחה ומיידית.</li>
          <li><b style={{ color: 'var(--text-1)' }}>קרן כספית או אג״ח קצרות.</b> אם הריבית בהן גבוהה מריבית ההלוואה, זה רווח כמעט בלי סיכון, ואפשר למשוך את הכסף בכל רגע.</li>
          <li><b style={{ color: 'var(--text-1)' }}>לפצל.</b> למשל 60% באפיק סולידי ו-40% במדד מניות. ככה מקבלים חלק מהאפסייד בלי לסכן את כל הסכום.</li>
          <li><b style={{ color: 'var(--text-1)' }}>לבחור אפיק עם דמי ניהול נמוכים.</b> קרן מחקה או ETF, לא קרן אקטיבית. 1% דמי ניהול יכול למחוק את כל הרווח.</li>
          <li><b style={{ color: 'var(--text-1)' }}>השקעה שמייצרת הכנסה.</b> קורס או הסמכה שמעלים שכר, או ציוד לעסק. לפעמים זו התשואה הגבוהה ביותר.</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 20, background: 'var(--red-bg)', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldAlert size={18} color="var(--red)" />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>לפני שממנפים, כדאי לבדוק</p>
        </div>
        <ul style={{ margin: 0, paddingInlineStart: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
          <li>האם ההלוואה <b>צמודה למדד</b> או לפריים? אם כן, העלות האמיתית גבוהה ממה שמוצג כאן.</li>
          <li>האם יש <b>עמלת פירעון מוקדם</b>? אם לא, אפשר תמיד להחזיר את ההלוואה אם ההשקעה לא עובדת.</li>
          <li>ההחזר של {fmt(loan.payment)} ₪ יוצא מהמשכורת כל חודש, <b>גם כשהשוק יורד</b>. צריך לוודא שיש קרן חירום נפרדת.</li>
          <li>4 שנים זה טווח קצר למניות. ירידה בשנה האחרונה יכולה להשאיר אתכם בהפסד.</li>
          <li>המחשבון מבוסס על הנחות ואינו ייעוץ השקעות. לפני החלטה כדאי להתייעץ עם יועץ מורשה.</li>
        </ul>
      </div>
    </div>
  );
}

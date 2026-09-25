// ─── Loan & leverage math ────────────────────────────────────────────────────

export interface LoanInput {
  principal: number;     // ₪ received
  payment: number;       // ₪ monthly repayment
  months: number;        // loan term
}

export interface LeverageResult {
  loanMonthlyRate: number;
  loanAnnualRate: number;   // effective annual (APR-like)
  totalRepaid: number;
  totalInterest: number;
  finalValue: number;       // lump sum invested, before tax
  tax: number;
  netValue: number;         // after tax
  profit: number;           // netValue − totalRepaid
  dcaNet: number;           // investing the monthly payment instead of taking the loan
  dcaProfit: number;
  series: { month: number; 'שווי ההשקעה': number; 'שולם לבנק': number; 'יתרת הלוואה': number }[];
}

function annuityPayment(principal: number, r: number, n: number) {
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Monthly interest rate implied by principal, payment and term (bisection). */
export function impliedMonthlyRate({ principal, payment, months }: LoanInput): number {
  if (principal <= 0 || months <= 0 || payment * months <= principal) return 0;
  let lo = 0, hi = 0.2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (annuityPayment(principal, mid, months) > payment) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

export function toMonthly(annual: number) {
  return Math.pow(1 + annual, 1 / 12) - 1;
}

function afterTax(value: number, cost: number, taxRate: number) {
  const gain = value - cost;
  return value - Math.max(gain, 0) * taxRate;
}

export function simulateLeverage(loan: LoanInput, annualReturn: number, taxRate: number): LeverageResult {
  const { principal, payment, months } = loan;
  const r = impliedMonthlyRate(loan);
  const g = toMonthly(annualReturn);

  const series: LeverageResult['series'] = [];
  let balance = principal;
  for (let m = 0; m <= months; m++) {
    if (m > 0) balance = Math.max(balance * (1 + r) - payment, 0);
    if (m % 3 === 0 || m === months) {
      series.push({
        month: m,
        'שווי ההשקעה': Math.round(principal * Math.pow(1 + g, m)),
        'שולם לבנק':   Math.round(payment * m),
        'יתרת הלוואה': Math.round(balance),
      });
    }
  }

  const totalRepaid = payment * months;
  const finalValue  = principal * Math.pow(1 + g, months);
  const netValue    = afterTax(finalValue, principal, taxRate);

  const dcaValue = g === 0 ? totalRepaid : payment * (Math.pow(1 + g, months) - 1) / g;
  const dcaNet   = afterTax(dcaValue, totalRepaid, taxRate);

  return {
    loanMonthlyRate: r,
    loanAnnualRate:  Math.pow(1 + r, 12) - 1,
    totalRepaid,
    totalInterest:   totalRepaid - principal,
    finalValue,
    tax:             finalValue - netValue,
    netValue,
    profit:          netValue - totalRepaid,
    dcaNet,
    dcaProfit:       dcaNet - totalRepaid,
    series,
  };
}

/** Annual return at which investing the loan exactly covers all repayments (after tax). */
export function breakEvenReturn(loan: LoanInput, taxRate: number): number {
  let lo = -0.5, hi = 0.5;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (simulateLeverage(loan, mid, taxRate).profit < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

import { Transaction } from './types';

export function getMonthlyStats(transactions: Transaction[], year: number, month: number) {
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expenses, savings: income - expenses, transactions: filtered };
}

export function getCategoryBreakdown(transactions: Transaction[]) {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getLast6MonthsData(transactions: Transaction[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const { income, expenses } = getMonthlyStats(transactions, d.getFullYear(), d.getMonth());
    return {
      month: d.toLocaleDateString('he-IL', { month: 'short' }),
      הכנסות: income,
      הוצאות: expenses,
    };
  });
}

export function getSavingsTips(transactions: Transaction[]): string[] {
  const tips: string[] = [];
  const now = new Date();
  const { income, expenses } = getMonthlyStats(transactions, now.getFullYear(), now.getMonth());
  const breakdown = getCategoryBreakdown(
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
  );

  const ratio = income > 0 ? expenses / income : 0;
  if (ratio > 0.9) tips.push('ההוצאות שלך מהוות יותר מ-90% מההכנסות — שקול לצמצם הוצאות לא הכרחיות.');
  if (ratio > 0.7 && ratio <= 0.9) tips.push('כ-70-90% מהכנסתך הולכת להוצאות. שאיפה היא לחסוך לפחות 20%.');
  if (ratio <= 0.7) tips.push('מצוין! אתה חוסך יותר מ-30% מהכנסתך החודשית.');

  const entertainment = breakdown.find((b) => b.name === 'בילויים ופנאי');
  if (entertainment && income > 0 && entertainment.value / income > 0.15)
    tips.push(`הוצאות בילויים (${entertainment.value.toLocaleString('he-IL')} ₪) מהוות יותר מ-15% מהכנסתך — שקול להוריד קצת.`);

  const food = breakdown.find((b) => b.name === 'מזון וסופר');
  if (food && income > 0 && food.value / income > 0.25)
    tips.push('הוצאות מזון גבוהות יחסית. תכנון ארוחות מראש יכול לעזור לחסוך.');

  if (tips.length === 0) tips.push('אין נתוני עסקאות לחודש הנוכחי — התחל להוסיף עסקאות לקבל המלצות.');
  return tips;
}

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
    .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getMemberSplit(transactions: Transaction[]) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const kefer = expenses.filter((t) => t.member === 'כפיר').reduce((s, t) => s + t.amount, 0);
  const adar = expenses.filter((t) => t.member === 'אדר').reduce((s, t) => s + t.amount, 0);
  const joint = expenses.filter((t) => t.member === 'משותף').reduce((s, t) => s + t.amount, 0);
  return { כפיר: kefer, אדר: adar, משותף: joint };
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
      חיסכון: income - expenses,
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
  if (ratio > 0.9) tips.push('ההוצאות עולות על 90% מההכנסות — כדאי לבחון קיצוצים.');
  else if (ratio > 0.7) tips.push('חוסכים פחות מ-30% מההכנסה. שאיפה היא לפחות 20%.');
  else if (income > 0) tips.push(`מצוין! שיעור החיסכון שלכם עומד על ${Math.round((1 - ratio) * 100)}%.`);

  const food = breakdown.find((b) => b.name === 'מסעדות');
  if (food && income > 0 && food.value / income > 0.1)
    tips.push(`הוצאות מסעדות גבוהות (${food.value.toLocaleString('he-IL')} ₪) — בישול בבית יכול לחסוך אלפים בחודש.`);

  const entertain = breakdown.find((b) => b.name === 'בילויים');
  if (entertain && income > 0 && entertain.value / income > 0.15)
    tips.push('בילויים מעל 15% מהכנסה — שקלו תקציב חודשי קבוע לבידור.');

  if (tips.length === 0) tips.push('הוסיפו עסקאות לחודש הנוכחי כדי לקבל המלצות מותאמות אישית.');
  return tips;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  member: 'כפיר' | 'אדר' | 'משותף';
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  emoji: string;
}

export interface BudgetSettings {
  [category: string]: number; // category name → monthly limit in ₪
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  member: 'כפיר' | 'אדר' | 'משותף';
  dayOfMonth: number; // 1–28
  active: boolean;
  lastApplied?: string; // "YYYY-MM" — last month it was auto-added
}

export const MEMBERS = ['משותף', 'כפיר', 'אדר'] as const;

export const EXPENSE_CATEGORIES = [
  { name: 'מזון וסופר',  emoji: '🛒' },
  { name: 'דיור',       emoji: '🏠' },
  { name: 'רכב',        emoji: '🚗' },
  { name: 'חשבונות',    emoji: '⚡' },
  { name: 'בריאות',     emoji: '💊' },
  { name: 'חינוך',      emoji: '📚' },
  { name: 'בילויים',    emoji: '🎭' },
  { name: 'ביגוד',      emoji: '👗' },
  { name: 'מסעדות',     emoji: '🍽️' },
  { name: 'נסיעות',     emoji: '✈️' },
  { name: 'חיסכון',     emoji: '🐷' },
  { name: 'אחר',        emoji: '📦' },
];

export const INCOME_CATEGORIES = [
  { name: 'משכורת',     emoji: '💼' },
  { name: 'פרילנס',     emoji: '💻' },
  { name: 'השקעות',     emoji: '📈' },
  { name: 'שכ"ד',       emoji: '🏘️' },
  { name: 'בונוס',      emoji: '🎁' },
  { name: 'אחר',        emoji: '📦' },
];

export function categoryEmoji(cat: string): string {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.name === cat)?.emoji ?? '📦';
}

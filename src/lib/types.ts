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

export const MEMBERS = ['משותף', 'כפיר', 'אדר'] as const;

export const EXPENSE_CATEGORIES = [
  { name: 'מזון וסופר', emoji: '🛒' },
  { name: 'דיור', emoji: '🏠' },
  { name: 'רכב', emoji: '🚗' },
  { name: 'חשבונות', emoji: '⚡' },
  { name: 'בריאות', emoji: '💊' },
  { name: 'חינוך', emoji: '📚' },
  { name: 'בילויים', emoji: '🎭' },
  { name: 'ביגוד', emoji: '👗' },
  { name: 'מסעדות', emoji: '🍽️' },
  { name: 'נסיעות', emoji: '✈️' },
  { name: 'חיסכון', emoji: '🐷' },
  { name: 'אחר', emoji: '📦' },
];

export const INCOME_CATEGORIES = [
  { name: 'משכורת', emoji: '💼' },
  { name: 'פרילנס', emoji: '💻' },
  { name: 'השקעות', emoji: '📈' },
  { name: 'שכ"ד', emoji: '🏘️' },
  { name: 'בונוס', emoji: '🎁' },
  { name: 'אחר', emoji: '📦' },
];

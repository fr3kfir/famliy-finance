export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  member?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  emoji: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export const FAMILY_MEMBERS = ['כולם', 'אבא', 'אמא', 'ילד/ה 1', 'ילד/ה 2'];

export const EXPENSE_CATEGORIES = [
  { name: 'מזון וסופר', emoji: '🛒' },
  { name: 'דיור ושכירות', emoji: '🏠' },
  { name: 'רכב ותחבורה', emoji: '🚗' },
  { name: 'חשבונות ואנרגיה', emoji: '⚡' },
  { name: 'בריאות', emoji: '🏥' },
  { name: 'חינוך', emoji: '📚' },
  { name: 'בילויים ופנאי', emoji: '🎭' },
  { name: 'ביגוד', emoji: '👗' },
  { name: 'מסעדות וקפה', emoji: '☕' },
  { name: 'חסכון והשקעות', emoji: '💰' },
  { name: 'אחר', emoji: '📦' },
];

export const INCOME_CATEGORIES = [
  { name: 'משכורת', emoji: '💼' },
  { name: 'עבודה עצמאית', emoji: '🧑‍💻' },
  { name: 'השקעות', emoji: '📈' },
  { name: 'שכ"ד', emoji: '🏘️' },
  { name: 'מתנה/ירושה', emoji: '🎁' },
  { name: 'אחר', emoji: '📦' },
];

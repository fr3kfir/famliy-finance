export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
}

export const EXPENSE_CATEGORIES = [
  'מזון וסופר',
  'דיור ושכירות',
  'רכב ותחבורה',
  'חשבונות ואנרגיה',
  'בריאות',
  'חינוך',
  'בילויים ופנאי',
  'ביגוד',
  'חסכון',
  'אחר',
];

export const INCOME_CATEGORIES = [
  'משכורת',
  'עבודה עצמאית',
  'השקעות',
  'מתנה/ירושה',
  'אחר',
];

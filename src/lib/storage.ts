import { Transaction, SavingsGoal } from './types';

const TRANSACTIONS_KEY = 'ff_transactions';
const GOALS_KEY = 'ff_goals';

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function addTransaction(tx: Transaction): void {
  const all = getTransactions();
  saveTransactions([tx, ...all]);
}

export function deleteTransaction(id: string): void {
  const all = getTransactions().filter((t) => t.id !== id);
  saveTransactions(all);
}

export function getGoals(): SavingsGoal[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(GOALS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveGoals(goals: SavingsGoal[]): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

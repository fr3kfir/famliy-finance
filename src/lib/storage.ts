import { Transaction, SavingsGoal, BudgetSettings, RecurringTransaction } from './types';

// ─── localStorage cache keys ───────────────────────────────────────────────
const LS = {
  tx:        'ff_transactions',
  goals:     'ff_goals',
  budget:    'ff_budget',
  recurring: 'ff_recurring',
};

// ─── API helpers ────────────────────────────────────────────────────────────
async function apiGet(): Promise<{
  transactions: Transaction[];
  goals: SavingsGoal[];
  budget: BudgetSettings;
  recurring: RecurringTransaction[];
}> {
  const r = await fetch('/api/data', { cache: 'no-store' });
  if (!r.ok) throw new Error('API error');
  return r.json();
}

async function apiPost(body: Record<string, unknown>) {
  await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── localStorage helpers ────────────────────────────────────────────────────
function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function lsSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Load all data (API → fallback to localStorage) ─────────────────────────
export async function loadAllData() {
  const localTx        = lsGet<Transaction[]>(LS.tx, []);
  const localGoals     = lsGet<SavingsGoal[]>(LS.goals, []);
  const localBudget    = lsGet<BudgetSettings>(LS.budget, {});
  const localRecurring = lsGet<RecurringTransaction[]>(LS.recurring, []);

  try {
    const remote = await apiGet();

    // Cloud is empty but device has data → first-sync: upload local data to cloud
    if (!remote.transactions.length && localTx.length) {
      await Promise.all([
        apiPost({ type: 'transactions', data: localTx }),
        apiPost({ type: 'goals',        data: localGoals }),
        apiPost({ type: 'budget',       data: localBudget }),
        apiPost({ type: 'recurring',    data: localRecurring }),
      ]).catch(() => {});
      return { transactions: localTx, goals: localGoals, budget: localBudget, recurring: localRecurring };
    }

    lsSet(LS.tx,        remote.transactions);
    lsSet(LS.goals,     remote.goals);
    lsSet(LS.budget,    remote.budget);
    lsSet(LS.recurring, remote.recurring);
    return remote;
  } catch {
    return { transactions: localTx, goals: localGoals, budget: localBudget, recurring: localRecurring };
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export function getTransactions(): Transaction[] {
  return lsGet<Transaction[]>(LS.tx, []);
}

export async function addTransaction(tx: Transaction) {
  const all = [tx, ...getTransactions()];
  lsSet(LS.tx, all);
  await apiPost({ type: 'transactions', action: 'add', data: [tx] }).catch(() => {});
}

export async function updateTransaction(id: string, fields: Partial<Transaction>) {
  const all = getTransactions().map(t => t.id === id ? { ...t, ...fields } : t);
  lsSet(LS.tx, all);
  const updated = all.find(t => t.id === id);
  if (updated) await apiPost({ type: 'transactions', action: 'update', data: updated }).catch(() => {});
}

export async function deleteTransaction(id: string) {
  lsSet(LS.tx, getTransactions().filter(t => t.id !== id));
  await apiPost({ type: 'transactions', action: 'delete', id }).catch(() => {});
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export function getGoals(): SavingsGoal[] {
  return lsGet<SavingsGoal[]>(LS.goals, []);
}

export async function saveGoals(goals: SavingsGoal[]) {
  lsSet(LS.goals, goals);
  await apiPost({ type: 'goals', data: goals }).catch(() => {});
}

// ─── Budget ──────────────────────────────────────────────────────────────────
export function getBudget(): BudgetSettings {
  return lsGet<BudgetSettings>(LS.budget, {});
}

export async function saveBudget(budget: BudgetSettings) {
  lsSet(LS.budget, budget);
  await apiPost({ type: 'budget', data: budget }).catch(() => {});
}

// ─── Recurring ────────────────────────────────────────────────────────────────
export function getRecurring(): RecurringTransaction[] {
  return lsGet<RecurringTransaction[]>(LS.recurring, []);
}

export async function saveRecurring(recurring: RecurringTransaction[]) {
  lsSet(LS.recurring, recurring);
  await apiPost({ type: 'recurring', data: recurring }).catch(() => {});
}

// ─── Apply recurring transactions for this month ─────────────────────────────
export async function applyRecurring() {
  const recurring = getRecurring();
  if (!recurring.length) return;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const today = now.getDate();

  const toAdd: Transaction[] = [];
  const updated = recurring.map(r => {
    if (!r.active) return r;
    if (r.lastApplied === monthKey) return r;
    if (today < r.dayOfMonth) return r;

    const date = new Date(now.getFullYear(), now.getMonth(), r.dayOfMonth);
    toAdd.push({
      id:          `rec-${r.id}-${monthKey}`,
      type:        r.type,
      amount:      r.amount,
      category:    r.category,
      description: r.description || `${r.description} (אוטומטי)`,
      date:        date.toISOString().split('T')[0],
      member:      r.member,
    });
    return { ...r, lastApplied: monthKey };
  });

  if (!toAdd.length) return;
  const existingIds = new Set(getTransactions().map(t => t.id));
  const fresh = toAdd.filter(t => !existingIds.has(t.id));
  if (!fresh.length) return;

  const all = [...fresh, ...getTransactions()];
  lsSet(LS.tx, all);
  await apiPost({ type: 'transactions', action: 'add', data: fresh }).catch(() => {});
  await saveRecurring(updated);
}

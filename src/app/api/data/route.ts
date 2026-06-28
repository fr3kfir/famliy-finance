import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const K = {
  tx:        'ff:transactions',
  goals:     'ff:goals',
  budget:    'ff:budget',
  recurring: 'ff:recurring',
};

export async function GET() {
  const [transactions, goals, budget, recurring] = await Promise.all([
    redis.get(K.tx),
    redis.get(K.goals),
    redis.get(K.budget),
    redis.get(K.recurring),
  ]);
  return NextResponse.json({
    transactions: transactions ?? [],
    goals:        goals        ?? [],
    budget:       budget       ?? {},
    recurring:    recurring    ?? [],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, data } = body as { type: 'transactions' | 'goals' | 'budget' | 'recurring'; data: unknown };

  const keyMap = { transactions: K.tx, goals: K.goals, budget: K.budget, recurring: K.recurring };
  const key = keyMap[type];
  if (!key) return NextResponse.json({ error: 'unknown type' }, { status: 400 });

  await Promise.all([
    redis.set(key, data),
    redis.set('ff:version', Date.now()),
  ]);
  return NextResponse.json({ ok: true });
}

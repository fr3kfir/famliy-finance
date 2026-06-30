import { put, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const BLOB_PATH = 'ff/data.json';

interface AppData {
  transactions: Array<{ id: string; [key: string]: unknown }>;
  goals: unknown[];
  budget: unknown;
  recurring: unknown[];
}

const DEFAULT_DATA: AppData = {
  transactions: [],
  goals: [],
  budget: {},
  recurring: [],
};

async function readData(): Promise<AppData> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (!blobs.length) return DEFAULT_DATA;
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return DEFAULT_DATA;
    return await res.json();
  } catch {
    return DEFAULT_DATA;
  }
}

async function writeData(data: AppData): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, type, data, id, ids } = body as {
    action?: 'add' | 'delete' | 'update' | 'replace';
    type: keyof AppData;
    data?: unknown;
    id?: string;
    ids?: string[];
  };

  const validTypes: (keyof AppData)[] = ['transactions', 'goals', 'budget', 'recurring'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'unknown type' }, { status: 400 });
  }

  const current = await readData();

  if (type === 'transactions') {
    const txs = current.transactions;

    if (action === 'add') {
      const incoming = (Array.isArray(data) ? data : [data]) as Array<{ id: string }>;
      const existingIds = new Set(txs.map(t => t.id));
      const fresh = incoming.filter(t => !existingIds.has(t.id));
      current.transactions = [...fresh, ...txs];
    } else if (action === 'delete') {
      const toDelete = new Set(ids ?? (id ? [id] : []));
      current.transactions = txs.filter(t => !toDelete.has(t.id));
    } else if (action === 'update') {
      const patch = data as { id: string; [key: string]: unknown };
      current.transactions = txs.map(t => t.id === patch.id ? { ...t, ...patch } : t);
    } else {
      // legacy replace (used by first-sync only)
      current.transactions = data as AppData['transactions'];
    }
  } else {
    current[type] = data as never;
  }

  await writeData(current);
  return NextResponse.json({ ok: true });
}

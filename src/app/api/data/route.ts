import { put, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const BLOB_PATH = 'ff/data.json';
const MAX_TOMBSTONES = 500;

interface Tx {
  id: string;
  date: string;
  [key: string]: unknown;
}

interface AppData {
  transactions: Tx[];
  goals: unknown[];
  budget: unknown;
  recurring: unknown[];
  deletedTxIds: string[];
}

const DEFAULT_DATA: AppData = {
  transactions: [],
  goals: [],
  budget: {},
  recurring: [],
  deletedTxIds: [],
};

async function readData(): Promise<AppData> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (!blobs.length) return DEFAULT_DATA;
    // Cache-busting query param — blob URLs are CDN-cached, so a plain
    // fetch of the stable URL returns stale data long after writes.
    const res = await fetch(`${blobs[0].url}?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return DEFAULT_DATA;
    const data = await res.json();
    return { ...DEFAULT_DATA, ...data };
  } catch {
    return DEFAULT_DATA;
  }
}

async function writeData(data: AppData): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true, // without this, every write after the first throws
    cacheControlMaxAge: 60, // minimum allowed; readData busts it anyway
  });
}

function byDateDesc(a: Tx, b: Tx) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, op, data } = body as { type: string; op?: string; data: unknown };

  const current = await readData();

  if (type === 'transactions') {
    const deleted = new Set(current.deletedTxIds);

    if (op === 'update') {
      // Replace a single transaction by id (add it if this device is ahead of the cloud)
      const tx = data as Tx;
      const idx = current.transactions.findIndex(t => t.id === tx.id);
      if (idx >= 0) current.transactions[idx] = tx;
      else if (!deleted.has(tx.id)) current.transactions = [tx, ...current.transactions].sort(byDateDesc);
    } else if (op === 'delete') {
      const id = String(data);
      current.transactions = current.transactions.filter(t => t.id !== id);
      current.deletedTxIds = [id, ...current.deletedTxIds].slice(0, MAX_TOMBSTONES);
    } else {
      // 'add' (single or bulk) — merge into the cloud list instead of overwriting it,
      // so a device with a stale local copy can never erase the other device's entries.
      const incoming = Array.isArray(data) ? (data as Tx[]) : [data as Tx];
      const existing = new Set(current.transactions.map(t => t.id));
      const fresh = incoming.filter(t => t?.id && !existing.has(t.id) && !deleted.has(t.id));
      if (fresh.length) {
        current.transactions = [...fresh, ...current.transactions].sort(byDateDesc);
      }
    }
  } else if (type === 'goals' || type === 'recurring' || type === 'budget') {
    (current as unknown as Record<string, unknown>)[type] = data;
  } else {
    return NextResponse.json({ error: 'unknown type' }, { status: 400 });
  }

  await writeData(current);
  return NextResponse.json({ ok: true, transactions: current.transactions });
}

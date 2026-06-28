import { put, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const BLOB_PATH = 'ff/data.json';

interface AppData {
  transactions: unknown[];
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
  const { type, data } = body as { type: keyof AppData; data: unknown };

  const validTypes: (keyof AppData)[] = ['transactions', 'goals', 'budget', 'recurring'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'unknown type' }, { status: 400 });
  }

  const current = await readData();
  current[type] = data as never;
  await writeData(current);

  return NextResponse.json({ ok: true });
}

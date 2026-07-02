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
    // Cache-bust the CDN edge: the blob URL is served through Vercel's CDN,
    // and `cache: 'no-store'` alone does NOT bypass that upstream cache.
    // A unique query string forces a fresh fetch from origin every time,
    // so every device sees the latest write instead of a stale cached copy.
    const url = `${blobs[0].url}?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
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
    // Keep the CDN cache as short as allowed (minimum is 60s) so the data
    // blob reflects fresh writes quickly. The default is one month, which is
    // why other devices kept reading stale data and never synced. Immediate
    // freshness is guaranteed by the cache-busting query string in readData.
    cacheControlMaxAge: 60,
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

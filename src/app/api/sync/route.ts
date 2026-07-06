import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Lightweight version check for polling: returns the last-write timestamp of
// the data blob without downloading it. The client reloads full data only
// when this value changes.
export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'ff/data.json' });
    const version = blobs.length ? new Date(blobs[0].uploadedAt).getTime() : 0;
    return NextResponse.json({ version }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ version: 0 }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

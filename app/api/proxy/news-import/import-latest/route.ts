import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const maxTotal = body?.maxTotal;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
    const cronKey = process.env.CRON_SECRET;

    const resp = await fetch(`${apiBase}/news-import/import-latest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cronKey ? { 'x-cron-key': cronKey } : {}),
      },
      body: JSON.stringify({ maxTotal }),
      // Don't forward cookies; server-to-server
      cache: 'no-store'
    });

    const data = await resp.json().catch(() => ({ success: false, message: 'Invalid JSON' }));
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Proxy error' }, { status: 500 });
  }
}

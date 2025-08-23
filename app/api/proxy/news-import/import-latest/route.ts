import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
  const apiBase = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
  const cronKey = (globalThis as any)?.process?.env?.CRON_SECRET;

    // Verify admin via backend before forwarding
    try {
      const verifyResp = await fetch(`${apiBase}/api/auth/verify`, {
        method: 'GET',
        headers: {
          cookie: req.headers.get('cookie') || '',
          authorization: req.headers.get('authorization') || '',
        },
        cache: 'no-store',
      });
      if (!verifyResp.ok) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
      const vr = await verifyResp.json().catch(() => ({}));
      const roles: string[] = vr?.user?.roles || [];
      if (!Array.isArray(roles) || !roles.includes('admin')) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const maxTotal = body?.maxTotal;

    const resp = await fetch(`${apiBase}/news-import/import-latest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cronKey ? { 'x-cron-key': cronKey } : {}),
      },
      body: JSON.stringify({ maxTotal }),
  // Server-to-server; do not forward client cookies
      cache: 'no-store'
    });

    const data = await resp.json().catch(() => ({ success: false, message: 'Invalid JSON' }));
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Proxy error' }, { status: 500 });
  }
}

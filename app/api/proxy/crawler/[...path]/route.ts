import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: any) {
  return handle(req, context?.params, 'GET');
}
export async function POST(req: NextRequest, context: any) {
  return handle(req, context?.params, 'POST');
}
export async function PUT(req: NextRequest, context: any) {
  return handle(req, context?.params, 'PUT');
}

async function handle(req: NextRequest, params: any, method: 'GET'|'POST'|'PUT') {
  try {
    const apiBase = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
    const cronKey = (globalThis as any)?.process?.env?.CRON_SECRET;
  const sub = params?.path?.join('/') || '';

    // Verify admin via backend before forwarding
    try {
      const verifyResp = await fetch(`${apiBase}/api/auth/verify`, {
        method: 'GET',
        headers: {
          // Forward the cookie for session token if present
          cookie: req.headers.get('cookie') || '',
          // Also forward Authorization if present
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

    // Forward body if present
    const hasBody = method !== 'GET';
    const body = hasBody ? await req.text() : undefined;

    const headers: Record<string, string> = {
      'Content-Type': req.headers.get('content-type') || 'application/json'
    };
    if (cronKey) headers['x-cron-key'] = cronKey;

    const resp = await fetch(`${apiBase}/api/crawler/${sub}`, {
      method,
      headers,
      body,
      cache: 'no-store'
    });

    const text = await resp.text();
    let json: any;
    try { json = JSON.parse(text); } catch {
      json = { success: resp.ok, message: text };
    }
    return NextResponse.json(json, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Proxy error' }, { status: 500 });
  }
}

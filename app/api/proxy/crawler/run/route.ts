import fetchWithAuth from '@/lib/apiClient';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const apiBase = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
  const cronKey = (globalThis as any)?.process?.env?.CRON_SECRET;

  // Verify admin via backend
  const verifyResp = await fetchWithAuth(`${apiBase}/api/auth/verify`, {
    method: 'GET',
    headers: { cookie: req.headers.get('cookie') || '', authorization: req.headers.get('authorization') || '' },
    cache: 'no-store',
  });
  if (!verifyResp.ok) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const vr = await verifyResp.json().catch(() => ({}));
  const roles: string[] = vr?.user?.roles || [];
  if (!Array.isArray(roles) || !roles.includes('admin')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cronKey) headers['x-cron-key'] = cronKey;

  const resp = await fetch(`${apiBase}/api/crawler/run`, { method: 'POST', headers, cache: 'no-store' });
  const text = await resp.text();
  let json: any; try { json = JSON.parse(text); } catch { json = { success: resp.ok, message: text }; }
  return NextResponse.json(json, { status: resp.status });
}

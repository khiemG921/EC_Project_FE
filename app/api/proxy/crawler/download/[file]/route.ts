import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: any) {
  const apiBase = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
  const cronKey = (globalThis as any)?.process?.env?.CRON_SECRET;
  const file = encodeURIComponent(context?.params?.file || '');

  const headers: Record<string, string> = {};
  if (cronKey) headers['x-cron-key'] = cronKey;

  const resp = await fetch(`${apiBase}/api/crawler/download/${file}`, { method: 'GET', headers, cache: 'no-store' });
  const blob = await resp.arrayBuffer();
  return new Response(blob, {
    status: resp.status,
    headers: {
      'Content-Type': resp.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': resp.headers.get('content-disposition') || `attachment; filename="${context?.params?.file || 'file'}`,
    },
  });
}

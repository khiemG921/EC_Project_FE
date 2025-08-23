import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params, 'GET');
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params, 'POST');
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params, 'PUT');
}

async function handle(req: NextRequest, params: { path: string[] }, method: 'GET'|'POST'|'PUT') {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
    const cronKey = process.env.CRON_SECRET;
    const sub = params.path?.join('/') || '';

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

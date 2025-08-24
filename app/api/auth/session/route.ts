import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';

function extractTokenFromSetCookie(setCookie: string | null) {
	if (!setCookie) return undefined;
	const m = setCookie.match(/token=([^;\s]+)/);
	return m ? decodeURIComponent(m[1]) : undefined;
}

function isHttps(req: Request) {
	try {
		const url = new URL(req.url);
		return url.protocol === 'https:';
	} catch {
		return true; 
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}));
		const idToken = body?.idToken;
		if (!idToken) return NextResponse.json({ error: 'missing idToken' }, { status: 400 });

		console.log('[FE session] Incoming POST with idToken prefix:', String(idToken).slice(0, 20) + '...');

		// Forward to backend to create session
		const backendRes = await fetch(`${API_BASE}/api/auth/session`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${idToken}`,
			},
			body: JSON.stringify({ idToken }),
			credentials: 'include',
		});

		const raw = await backendRes.text();
		let data: any = null;
		try { data = JSON.parse(raw); } catch { data = { raw }; }
		console.log('[FE session] Backend response status/body:', backendRes.status, data);

		const res = NextResponse.json(data, { status: backendRes.status });

		// Mirror token from backend Set-Cookie if present
		const setCookie = backendRes.headers.get('set-cookie');
		const cookieToken = extractTokenFromSetCookie(setCookie) || data?.token || data?.sessionToken;
		const https = isHttps(req);
		const cookieOptions = {
			httpOnly: true,
			secure: https,
			sameSite: (https ? 'none' : 'lax') as 'lax' | 'none',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		};

		if (cookieToken) {
	res.cookies.set('token', cookieToken, cookieOptions);
			return res;
		}

		// Fallback: set short marker so middleware sees something while full session propagates
		console.warn('[FE session] No token in backend response; setting short-lived marker cookie');
		res.cookies.set('token', '1', { path: '/', maxAge: 60 * 5, sameSite: cookieOptions.sameSite, secure: cookieOptions.secure });
		return res;
	} catch (err: any) {
		console.error('[FE session] POST error:', err?.message || err);
		return NextResponse.json({ error: 'internal' }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		try {
			const be = await fetch(`${API_BASE}/api/auth/session`, { method: 'DELETE', credentials: 'include' });
			console.log('[FE session] Backend DELETE status:', be.status);
		} catch (e) {
			console.warn('[FE session] Backend DELETE failed:', e);
		}
		const https = isHttps(req);
		const res = NextResponse.json({ ok: true });
		res.cookies.set('token', '', { maxAge: 0, path: '/', sameSite: (https ? 'none' : 'lax') as any, secure: https });
		return res;
	} catch (err: any) {
		console.error('[FE session] DELETE error:', err?.message || err);
		return NextResponse.json({ error: 'internal' }, { status: 500 });
	}
}

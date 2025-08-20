import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';

function extractTokenFromSetCookie(setCookie: string | null) {
	if (!setCookie) return undefined;
	const m = setCookie.match(/token=([^;\s]+)/);
	return m ? decodeURIComponent(m[1]) : undefined;
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const idToken = body?.idToken;
		if (!idToken) return NextResponse.json({ error: 'missing idToken' }, { status: 400 });

		// Forward to backend to create session
		const backendRes = await fetch(`${API_BASE}/api/auth/session`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${idToken}`,
			},
			body: JSON.stringify({ idToken }),
		});

		const text = await backendRes.text();
		let data: any = null;
		try { data = JSON.parse(text); } catch { data = { raw: text }; }

		const res = NextResponse.json(data, { status: backendRes.status });

		// Mirror token from backend Set-Cookie if present
		const setCookie = backendRes.headers.get('set-cookie');
		const cookieToken = extractTokenFromSetCookie(setCookie) || data?.token || data?.sessionToken;
		if (cookieToken) {
			res.cookies.set('token', cookieToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 7,
			});
			return res;
		}

		// Fallback: set short marker so middleware sees something while full session propagates
		res.cookies.set('token', '1', { path: '/', maxAge: 60 * 5 });
		return res;
	} catch (err) {
		return NextResponse.json({ error: 'internal' }, { status: 500 });
	}
}

export async function DELETE() {
	try {
		// Attempt to notify backend to clear session, ignore errors
		try {
			await fetch(`${API_BASE}/api/auth/session`, { method: 'DELETE', credentials: 'include' });
		} catch (e) {}

		const res = NextResponse.json({ ok: true });
		// Clear FE cookie
		res.cookies.set('token', '', { maxAge: 0, path: '/' });
		return res;
	} catch (err) {
		return NextResponse.json({ error: 'internal' }, { status: 500 });
	}
}

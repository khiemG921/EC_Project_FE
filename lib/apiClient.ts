// Resolve API base URL safely in browser without Node typings
const API_BASE_URL: string = ((globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app');

import { auth } from './firebase';

async function getIdTokenMaybe(refresh = false): Promise<string | undefined> {
  try {
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken(refresh);
    }
  } catch {}
  return undefined;
}

function joinApi(base: string, path: string): string {
  const b = (base || '').replace(/\/$/, '');
  if (path.startsWith('/api')) {
    if (b.endsWith('/api')) return `${b}${path.substring(4)}`; // avoid double /api
    return `${b}${path}`;
  }
  return path;
}

export async function fetchWithAuth(pathOrUrl: string, init: RequestInit = {}) {
  const isInternal = pathOrUrl.startsWith('/api/admin/trigger-github');
  const url = isInternal ? pathOrUrl : (pathOrUrl.startsWith('/api') ? joinApi(API_BASE_URL, pathOrUrl) : pathOrUrl);

  const headers = new Headers(init.headers || {});
  const token = await getIdTokenMaybe(false);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Set JSON content-type by default when body present and not FormData
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });

  // If unauthorized, try refresh token once and retry
  if (res.status === 401) {
    try {
      const refreshed = await getIdTokenMaybe(true);
      if (refreshed) {
        headers.set('Authorization', `Bearer ${refreshed}`);
        res = await fetch(url, { ...init, headers, credentials: init.credentials ?? 'include' });
      }
    } catch {}
  }

  return res;
}

export default fetchWithAuth;

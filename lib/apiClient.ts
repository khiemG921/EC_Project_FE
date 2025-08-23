// const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || ''); // No change here, just keeping context

import { auth } from './firebase';

async function getIdTokenMaybe(): Promise<string | undefined> {
  try {
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch (e) {
    // ignore
  }

  return undefined;
}

export async function fetchWithAuth(pathOrUrl: string, init: RequestInit = {}) {
  // If path is relative and API_BASE_URL is set, prefix it. Otherwise keep relative so Next.js edge routes work.
  const url = pathOrUrl.startsWith('/api') ? (API_BASE_URL ? `${API_BASE_URL}${pathOrUrl}` : pathOrUrl) : pathOrUrl;

  const headers = new Headers(init.headers || {});
  const token = await getIdTokenMaybe();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Set JSON content-type by default when body present and not FormData
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });
  return res;
}

export default fetchWithAuth;

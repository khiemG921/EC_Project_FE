// Utility functions for auth cleanup
export function clearAuthTokens() {
  if (typeof window !== 'undefined') {
    // Clear HTTP-only cookie by setting it to expire
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    
    // Clear any localStorage tokens (fallback)
    localStorage.removeItem('token');
    localStorage.removeItem('customerId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userRoles');
  }
}

export function hasValidAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const token = cookies['token'];
  return !!(token && token.trim() !== '' && token !== 'undefined' && token !== 'null');
}

'use client';

import { AuthProvider } from '@/providers/auth_provider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}

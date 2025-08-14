// app/booking/periodic-cleaning/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PeriodicCleaningRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/booking/periodic-cleaning/service'); // Redirect to first step
    }, [router]);
    return null;
}

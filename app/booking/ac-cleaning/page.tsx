'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ACBookingPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first step
    router.replace('/booking/ac-cleaning/service');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <p>Đang chuyển hướng...</p>
        </div>
      </div>
    </div>
  );
};

export default ACBookingPage;

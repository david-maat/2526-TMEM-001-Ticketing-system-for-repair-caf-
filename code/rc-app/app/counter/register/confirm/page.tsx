'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '../../../components/BackButton';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function RegisterConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const volgnummer = searchParams.get('volgnummer') || 'XXXX';

  useEffect(() => {
    // Wait 5 seconds then redirect back
    const timer = setTimeout(() => {
      router.push('/counter');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Balie']}>
      <div className="min-h-screen bg-[#03091C] flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center p-5">
          <BackButton />
          <h1 className="flex-1 text-white font-open-sans text-2xl lg:text-3xl font-normal text-center pr-[100px]">
            Ticket wordt geprint. Even geduld...
          </h1>
        </div>

        {/* Centered volgnummer */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white font-open-sans text-4xl lg:text-5xl font-normal">
            Volgnummer is {volgnummer}
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { deliverVoorwerp } from '@/lib/actions/voorwerpen';

export default function DeliverItemPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await deliverVoorwerp(trackingNumber);

      if (!result.success) {
        setError(result.error || 'Er is een fout opgetreden');
        setIsLoading(false);
        return;
      }

      // Success - redirect with the item data
      localStorage.setItem('deliveredItem', JSON.stringify(result.voorwerp));
      router.push('/counter/deliver/confirm');
    } catch (err) {
      console.error('Deliver error:', err);
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Balie']}>
      <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 mb-5">
          <BackButton />
          <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
            Voorwerp uitleveren
          </h1>
          <div className="w-[100px]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col items-center justify-center gap-9 px-2.5">
          {/* Error Message */}
          {error && (
            <div className="w-full max-w-sm bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-center">
              {error}
            </div>
          )}

          <div className="w-full max-w-sm">
            <Input
              label="Volgnummer"
              placeholder="RC-..."
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button variant="primary" type="submit" className="px-8 py-8 text-4xl" disabled={isLoading}>
            {isLoading ? 'Bezig...' : 'Voorwerp uitleveren'}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}

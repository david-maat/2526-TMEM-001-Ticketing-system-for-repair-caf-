'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function DeliverItemPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Delivering item:', trackingNumber);
    router.push('/counter/deliver/confirm');
  };

  return (
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
        <div className="w-full max-w-sm">
          <Input
            label="Volgnummer"
            placeholder="R78H"
            required
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>

        <Button variant="primary" type="submit" className="px-8 py-8 text-4xl">
          Voorwerp uitleveren
        </Button>
      </form>
    </div>
  );
}

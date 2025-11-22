'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../../components/BackButton';
import Button from '../../../components/Button';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { sendDeliveryPrintJob, confirmDelivery } from '@/lib/actions/voorwerpen';

interface VoorwerpData {
  voorwerpId: number;
  volgnummer: string;
  klachtBeschrijving?: string;
  voorwerpBeschrijving?: string;
  advies?: string;
  gebruikteMaterialen?: Array<{
    aantal: number;
    materiaal: {
      naam: string;
    };
  }>;
}

export default function DeliverConfirmPage() {
  const router = useRouter();
  const [voorwerp, setVoorwerp] = useState<VoorwerpData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [printSent, setPrintSent] = useState(false);

  useEffect(() => {
    // Retrieve the item data from localStorage
    const storedData = localStorage.getItem('deliveredItem');
    if (storedData) {
      setVoorwerp(JSON.parse(storedData));
    } else {
      // If no data found, redirect back to deliver page
      router.push('/counter/deliver');
    }
  }, [router]);

  // Send print job when component mounts
  useEffect(() => {
    if (voorwerp && !printSent) {
      handlePrint();
      setPrintSent(true);
    }
  }, [voorwerp, printSent]);

  const handlePrint = async () => {
    if (!voorwerp) return;

    try {
      // Send print job without changing status
      const result = await sendDeliveryPrintJob(voorwerp.volgnummer);

      if (!result.success) {
        console.error('Error sending print job:', result.error);
      }
    } catch (error) {
      console.error('Error in handlePrint:', error);
    }
  };

  const handleBetaald = async () => {
    if (!voorwerp) return;

    setIsLoading(true);

    try {
      // Update status to "Afgeleverd"
      const result = await confirmDelivery(voorwerp.volgnummer);

      if (!result.success) {
        console.error('Error confirming delivery:', result.error);
        setIsLoading(false);
        return;
      }

      // Clear localStorage before redirecting
      localStorage.removeItem('deliveredItem');

      // Redirect back to counter dashboard
      router.push('/counter');
    } catch (error) {
      console.error('Error in handleBetaald:', error);
      // Clear localStorage and still redirect even if there's an error
      localStorage.removeItem('deliveredItem');
      router.push('/counter');
    }
  };

  if (!voorwerp) {
    return (
      <ProtectedRoute allowedRoles={['Balie']}>
        <div className="min-h-screen bg-[#03091C] flex items-center justify-center">
          <div className="text-white text-xl">Laden...</div>
        </div>
      </ProtectedRoute>
    );
  }

  // Calculate total price
  const totalPrice = voorwerp.gebruikteMaterialen?.reduce((sum, gm) => sum + gm.aantal, 0) || 0;

  return (
    <ProtectedRoute allowedRoles={['Balie']}>
      <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 mb-5">
          <BackButton />
          <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
            Ticket wordt geprint. Even geduld...
          </h1>
          <div className="w-[100px]" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-9 px-2.5">
          <h2 className="text-white text-2xl lg:text-3xl font-normal">
            Geselecteerd volgnummer is {voorwerp.volgnummer}
          </h2>

          {/* Cards Container */}
          <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl">
            {/* Advies Card */}
            <div className="flex-1 bg-white rounded-lg p-6 min-h-[200px]">
              <h3 className="text-xl font-semibold mb-4 text-black">Advies</h3>
              <div className="text-black whitespace-pre-wrap">
                {voorwerp.advies || 'Geen advies beschikbaar'}
              </div>
            </div>

            {/* Gebruikte Materialen Card */}
            <div className="flex-1 bg-white rounded-lg p-6 min-h-[200px]">
              <h3 className="text-xl font-semibold mb-4 text-black">Gebruikte Materialen</h3>
              {voorwerp.gebruikteMaterialen && voorwerp.gebruikteMaterialen.length > 0 ? (
                <div className="space-y-2">
                  <table className="w-full text-black">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left pb-2">Naam</th>
                        <th className="text-center pb-2">Aantal</th>
                        <th className="text-right pb-2">Prijs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voorwerp.gebruikteMaterialen.map((gm, index) => (
                        <tr key={`${gm.materiaal.naam}-${index}`} className="border-b border-gray-200">
                          <td className="py-2">{gm.materiaal.naam}</td>
                          <td className="text-center py-2">{gm.aantal}</td>
                          <td className="text-right py-2">€{gm.aantal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pt-4 border-t-2 border-gray-400">
                    <div className="flex justify-between text-black font-semibold text-lg">
                      <span>Totaal</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Geen materialen gebruikt
                </div>
              )}
            </div>
          </div>

          {/* Betaald Button */}
          <Button
            variant="primary"
            onClick={handleBetaald}
            className="px-12 py-6 text-3xl"
            disabled={isLoading}
          >
            {isLoading ? 'Bezig...' : 'Betaald'}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

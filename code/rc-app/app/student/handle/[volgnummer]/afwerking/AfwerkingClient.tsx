'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/app/components/BackButton';
import Button from '@/app/components/Button';
import Dropdown from '@/app/components/Dropdown';
import { completeVoorwerpWithAdvice } from '@/lib/actions/voorwerpen';
import { VoorwerpFull } from '@/lib/types';

interface AfwerkingClientProps {
  voorwerp: VoorwerpFull;
  volgnummer: string;
}

const REPAIR_STATUS_OPTIONS = [
  { value: 'volledig_gerepareerd', label: 'Volledig gerepareerd' },
  { value: 'gedeeltelijk_gerepareerd', label: 'Gedeeltelijk gerepareerd' },
  { value: 'niet_gerepareerd', label: 'Niet gerepareerd' },
];

export default function AfwerkingClient({ voorwerp, volgnummer }: AfwerkingClientProps) {
  const router = useRouter();
  const [advies, setAdvies] = useState('');
  const [reparatieStatus, setReparatieStatus] = useState('volledig_gerepareerd');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!advies.trim()) {
      setError('Advies is verplicht');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await completeVoorwerpWithAdvice({
        volgnummer,
        advies: advies.trim(),
        reparatieStatus,
      });

      if (result.success) {
        router.push('/student');
      } else {
        setError(result.error || 'Er is een fout opgetreden');
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
      console.error('Error completing voorwerp:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03091C] text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h1 className="text-2xl font-normal">Afwerking - Voorwerp {volgnummer}</h1>
      </div>

      {/* Content Container */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Repair Status Dropdown */}
        <div>
          <label className="block text-lg mb-2">Reparatiestatus</label>
          <Dropdown
            value={reparatieStatus}
            onChange={(value) => setReparatieStatus(value)}
            options={REPAIR_STATUS_OPTIONS}
            placeholder="Selecteer reparatiestatus"
          />
        </div>

        {/* Advies Textarea */}
        <div>
          <label className="block text-lg mb-2">Advies voor de klant</label>
          <textarea
            value={advies}
            onChange={(e) => setAdvies(e.target.value)}
            placeholder="Geef advies over de reparatie, aanbevelingen voor gebruik, of andere belangrijke informatie voor de klant..."
            className="w-full h-48 bg-white text-black p-4 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#ED5028]"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-12 py-3"
          >
            {isSubmitting ? 'Bezig met opslaan...' : 'Voltooien'}
          </Button>
        </div>
      </div>
    </div>
  );
}

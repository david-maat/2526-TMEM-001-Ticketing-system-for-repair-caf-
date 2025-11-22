'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/app/components/BackButton';
import Button from '@/app/components/Button';
import { updateVoorwerp } from '@/lib/actions/voorwerpen';
import { VoorwerpFull } from '@/lib/types';

interface HandleVoorwerpClientProps {
  voorwerp: VoorwerpFull;
  volgnummer: string;
}

export default function HandleVoorwerpClient({ voorwerp, volgnummer }: HandleVoorwerpClientProps) {
  const router = useRouter();
  const [klachtBeschrijving, setKlachtBeschrijving] = useState(voorwerp.klachtBeschrijving || '');
  const [voorwerpBeschrijving, setVoorwerpBeschrijving] = useState(voorwerp.voorwerpBeschrijving || '');

  // Auto-update status to "In behandeling" on mount if needed
  useEffect(() => {
    if (voorwerp.voorwerpStatusId !== 2 && voorwerp.voorwerpStatusId !== 3) {
      updateVoorwerp(volgnummer, {
        voorwerpStatusId: 2,
      });
    }
  }, [voorwerp.voorwerpStatusId, volgnummer]);

  const handleUseMaterial = () => {
    router.push(`/student/handle/${volgnummer}/materialen`);
  };

  const handleReturn = () => {
    // TODO: Handle return logic
    console.log('Return item');
  };

  const handleComplete = async () => {
    // Redirect to advice/repair status page
    router.push(`/student/handle/${volgnummer}/afwerking`);
  };

  return (
    <div className="min-h-screen bg-[#03091C] text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h1 className="text-2xl font-normal">Voorwerp {volgnummer}</h1>
      </div>

      {/* Content Container */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Klacht Beschrijving */}
        <div>
          <label className="block text-lg mb-2">Beschrijving Probleem</label>
          <textarea
            value={klachtBeschrijving}
            onChange={(e) => setKlachtBeschrijving(e.target.value)}
            placeholder="Het apparaat is kapot"
            className="w-full h-32 bg-white text-black p-4 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#ED5028]"
            disabled
          />
        </div>

        {/* Voorwerp Beschrijving */}
        <div>
          <label className="block text-lg mb-2">Beschrijving Voorwerp</label>
          <textarea
            value={voorwerpBeschrijving}
            onChange={(e) => setVoorwerpBeschrijving(e.target.value)}
            placeholder="Omschrijving van de voorwerpreparaten"
            className="w-full h-32 bg-white text-black p-4 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#ED5028]"
            disabled
          />
        </div>

        {/* Gebruikte Materialen Section */}
        <div className="bg-[#0A1532] p-6 rounded-md">
          <div className="flex justify-center gap-5 items-center mb-4">
            <h1>Gebruikte Materialen</h1>
            <Button variant="primary" onClick={handleUseMaterial}>
              Toevoegen
            </Button>
          </div>

          {/* Materials List */}
          {voorwerp.gebruikteMaterialen && voorwerp.gebruikteMaterialen.length > 0 ? (
            <ul className="space-y-2 text-white">
              {voorwerp.gebruikteMaterialen.map((gm: any, index: number) => (
                <li key={index} className="flex justify-between">
                  <span>• {gm.materiaal.naam}</span>
                  <span>{gm.aantal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">Geen materialen gebruikt</p>
          )}
        </div>

        {/* Klaar Button */}
        <div className="flex justify-center pt-8">
          <Button 
            variant="primary" 
            onClick={handleComplete}
            className="px-12 py-3"
          >
            Klaar
          </Button>
        </div>
      </div>
    </div>
  );
}

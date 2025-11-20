'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackButton from '@/app/components/BackButton';
import Button from '@/app/components/Button';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { VoorwerpFull } from '@/lib/types';

export default function HandleVoorwerpPage() {
  const params = useParams();
  const router = useRouter();
  const voorwerpNummer = params?.voorwerpNummer as string;

  const [voorwerp, setVoorwerp] = useState<VoorwerpFull | null>(null);
  const [beschrijvingProbleem, setBeschrijvingProbleem] = useState('');
  const [beschrijvingVoorwerp, setBeschrijvingVoorwerp] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVoorwerp();
  }, [voorwerpNummer]);

  const fetchVoorwerp = async () => {
    try {
      const response = await fetch(`/api/voorwerpen/${voorwerpNummer}`);
      
      if (!response.ok) {
        setError('Voorwerp niet gevonden');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setVoorwerp(data);
      setBeschrijvingVoorwerp(data.beschrijving || '');
      setIsLoading(false);

      // Update status to "In behandeling" (status ID 2) if not already
      if (data.voorwerpStatusId !== 2 && data.voorwerpStatusId !== 3) {
        await updateStatus(2);
      }
    } catch (err) {
      setError('Er is een fout opgetreden');
      setIsLoading(false);
    }
  };

  const updateStatus = async (statusId: number) => {
    try {
      const response = await fetch(`/api/voorwerpen/${voorwerpNummer}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voorwerpStatusId: statusId,
          ...(statusId === 2 && { startingDuur: new Date() }),
          ...(statusId === 3 && { klaarDuur: new Date() }),
        }),
      });

      if (response.ok) {
        const updatedVoorwerp = await response.json();
        setVoorwerp(updatedVoorwerp);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleUseMaterial = () => {
    // TODO: Navigate to material selection page
    console.log('Navigate to material selection');
  };

  const handleReturn = () => {
    // TODO: Handle return logic
    console.log('Return item');
  };

  const handleComplete = async () => {
    // Update status to "Klaar" (status ID 3)
    await updateStatus(3);
    router.push('/student');
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['Admin', 'Student']}>
        <div className="min-h-screen bg-[#03091C] flex items-center justify-center">
          <div className="text-white text-xl">Laden...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !voorwerp) {
    return (
      <ProtectedRoute allowedRoles={['Admin', 'Student']}>
        <div className="min-h-screen bg-[#03091C] flex items-center justify-center">
          <div className="text-red-500 text-xl">{error || 'Voorwerp niet gevonden'}</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Student']}>
      <div className="min-h-screen bg-[#03091C] text-white p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <h1 className="text-2xl font-normal">Voorwerp {voorwerpNummer}</h1>
        </div>

        {/* Content Container */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Beschrijving Probleem */}
          <div>
            <label className="block text-lg mb-2">Beschrijving Probleem</label>
            <textarea
              value={beschrijvingProbleem}
              onChange={(e) => setBeschrijvingProbleem(e.target.value)}
              placeholder="Het apparaat is kapot"
              className="w-full h-32 bg-white text-black p-4 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#ED5028]"
            />
          </div>

          {/* Beschrijving Voorwerp */}
          <div>
            <label className="block text-lg mb-2">Beschrijving Voorwerp</label>
            <textarea
              value={beschrijvingVoorwerp}
              onChange={(e) => setBeschrijvingVoorwerp(e.target.value)}
              placeholder="Omschrijving van de voorwerpreparaten"
              className="w-full h-32 bg-white text-black p-4 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#ED5028]"
            />
          </div>

          {/* Gebruikte Materialen Section */}
          <div className="bg-[#0A1532] p-6 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <Button variant="secondary" onClick={handleUseMaterial}>
                Gebruikte Materiaal
              </Button>
              <Button variant="primary" onClick={handleReturn}>
                Terugleggen
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
    </ProtectedRoute>
  );
}

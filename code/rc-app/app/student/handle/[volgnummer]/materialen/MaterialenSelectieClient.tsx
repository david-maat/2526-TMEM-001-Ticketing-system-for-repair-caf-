'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/app/components/BackButton';
import Button from '@/app/components/Button';
import { addMateriaalToVoorwerp, updateMateriaalAantal } from '@/lib/actions/materialen';

interface Materiaal {
  materiaalId: number;
  naam: string;
}

interface GebruiktMateriaal {
  materiaalId: number;
  aantal: number;
}

interface MaterialenSelectieClientProps {
  readonly materialen: Materiaal[];
  readonly volgnummer: string;
  readonly gebruikteMaterialen?: GebruiktMateriaal[];
}

export default function MaterialenSelectieClient({ materialen, volgnummer, gebruikteMaterialen = [] }: MaterialenSelectieClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterialen, setFilteredMaterialen] = useState(materialen);
  const [selectedMaterialen, setSelectedMaterialen] = useState<Map<number, number>>(new Map());

  // Populate selectedMaterialen from bestaande gebruikteMaterialen when component mounts or prop changes
  useEffect(() => {
    const map = new Map<number, number>();
    gebruikteMaterialen.forEach((g) => {
      if (typeof g.materiaalId === 'number' && typeof g.aantal === 'number') {
        map.set(g.materiaalId, g.aantal);
      }
    });
    setSelectedMaterialen(map);
  }, [gebruikteMaterialen]);

  // Filter materials based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMaterialen(materialen);
    } else {
      const filtered = materialen.filter(materiaal =>
        materiaal.naam.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMaterialen(filtered);
    }
  }, [searchQuery, materialen]);

  const handleIncrement = (materiaalId: number) => {
    setSelectedMaterialen(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(materiaalId) || 0;
      newMap.set(materiaalId, current + 1);
      return newMap;
    });
  };

  const handleDecrement = (materiaalId: number) => {
    setSelectedMaterialen(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(materiaalId) || 0;
      if (current > 0) {
        newMap.set(materiaalId, current - 1);
      }
      return newMap;
    });
  };

  const handleAddMaterials = async () => {
    try {
      // For each materiaal compute desired vs existing and call appropriate action
      // Build a lookup for existing counts
      const existingMap = new Map<number, number>();
      (gebruikteMaterialen || []).forEach(g => existingMap.set(g.materiaalId, g.aantal));

      // Iterate over all materials (so unchanged ones are considered too)
      for (const materiaal of materialen) {
        const id = materiaal.materiaalId;
        const desired = selectedMaterialen.get(id) || 0;
        const existing = existingMap.get(id) || 0;

        if (desired > existing) {
          // add the delta
          await addMateriaalToVoorwerp(volgnummer, id, desired - existing);
        } else if (desired < existing) {
          // update to a lower amount (or remove if 0)
          await updateMateriaalAantal(volgnummer, id, desired);
        }
        // if equal, do nothing
      }
      router.back();
    } catch (error) {
      console.error('Error adding materials:', error);
      alert('Er is een fout opgetreden bij het toevoegen van materialen');
    }
  };

  return (
    <div className="min-h-screen bg-[#03091C] text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Zoeken"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-black px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ED5028]"
        />
      </div>

      {/* Materials List */}
      <div className="mb-8">
        {filteredMaterialen.map((materiaal) => {
          const aantal = selectedMaterialen.get(materiaal.materiaalId) || 0;

          return (
            <div
              key={materiaal.materiaalId}
              className="flex items-center gap-4 bg-[#0A1532] p-4 border-b last:border-b-0 border-white"
            >
              {/* Material Image Placeholder */}
              <div className="w-20 h-20 bg-white rounded-md flex-shrink-0"></div>

              {/* Material Name */}
              <div className="flex-1 text-lg">
                {materiaal.naam}
              </div>

              {/* Quantity Display */}
              <div className="text-2xl px-4 font-semibold w-8 text-center">
                {aantal}
              </div>

              {/* Increment/Decrement Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDecrement(materiaal.materiaalId)}
                  className="p-2 sm:p-4 rounded-full border-2 border-white flex items-center justify-center text-xl font-bold hover:bg-white hover:text-[#03091C] transition-colors"
                  aria-label="Verminderen"
                >
                  −
                </button>
                <button
                  onClick={() => handleIncrement(materiaal.materiaalId)}
                  className="p-2 sm:p-4 rounded-full border-2 border-white flex items-center justify-center text-xl font-bold hover:bg-white hover:text-[#03091C] transition-colors"
                  aria-label="Verhogen"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Button */}
      {Array.from(selectedMaterialen.values()).some(aantal => aantal > 0) && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center">
          <Button
            variant="primary"
            onClick={handleAddMaterials}
            className="px-12 py-4 text-lg"
          >
            Materialen Toevoegen
          </Button>
        </div>
      )}
    </div>
  );
}

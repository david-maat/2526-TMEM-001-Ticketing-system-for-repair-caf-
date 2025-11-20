'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket';

interface Voorwerp {
  voorwerpId: number;
  voorwerpNummer: string;
  voorwerpStatus: {
    naam: string;
  };
}

interface GroupedVoorwerpen {
  afgeleverd: Voorwerp[];
  inBehandeling: Voorwerp[];
  klaar: Voorwerp[];
}

export default function ClientView() {
  const [items, setItems] = useState<GroupedVoorwerpen>({
    afgeleverd: [],
    inBehandeling: [],
    klaar: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Keep as API route since this is used for WebSocket updates
        const response = await fetch('/api/voorwerpen/status');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchItems();

    // Listen for WebSocket updates
    if (socket) {
      socket.on('voorwerpen-updated', (data: GroupedVoorwerpen) => {
        console.log('Received WebSocket update');
        setItems(data);
      });

      return () => {
        socket.off('voorwerpen-updated');
      };
    }
  }, [socket]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#03091C] flex justify-center items-center">
        <span className="text-white text-2xl">Laden...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03091C] flex justify-center items-start p-5 lg:p-10">
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {isConnected ? '● Live' : '● Offline'}
        </div>
      </div>
      
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 lg:gap-12">
        {/* Afgegeven */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <h2 className="text-white font-open-sans text-2xl font-normal">Afgeleverd</h2>
          <div className="w-full flex flex-col gap-5">
            {items.afgeleverd.length === 0 ? (
              <div className="text-white/50 text-center py-8">Geen items</div>
            ) : (
              items.afgeleverd.map((item) => (
                <div
                  key={item.voorwerpId}
                  className="w-full h-32 lg:h-44 flex items-center justify-center rounded-md bg-[#ED5028]"
                >
                  <span className="text-white font-open-sans text-4xl font-normal">
                    {item.voorwerpNummer}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In behandeling */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <h2 className="text-white font-open-sans text-2xl font-normal">In behandeling</h2>
          <div className="w-full flex flex-col gap-5">
            {items.inBehandeling.length === 0 ? (
              <div className="text-white/50 text-center py-8">Geen items</div>
            ) : (
              items.inBehandeling.map((item) => (
                <div
                  key={item.voorwerpId}
                  className="w-full h-32 lg:h-44 flex items-center justify-center rounded-md bg-[#ED5028]"
                >
                  <span className="text-white font-open-sans text-4xl font-normal">
                    {item.voorwerpNummer}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Klaar */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <h2 className="text-white font-open-sans text-2xl font-normal">Klaar</h2>
          <div className="w-full flex flex-col gap-5">
            {items.klaar.length === 0 ? (
              <div className="text-white/50 text-center py-8">Geen items</div>
            ) : (
              items.klaar.map((item) => (
                <div
                  key={item.voorwerpId}
                  className="w-full h-32 lg:h-44 flex items-center justify-center rounded-md bg-[#ED5028]"
                >
                  <span className="text-white font-open-sans text-4xl font-normal">
                    {item.voorwerpNummer}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

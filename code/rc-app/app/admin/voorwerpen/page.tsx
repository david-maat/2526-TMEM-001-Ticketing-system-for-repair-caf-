'use client';

import { useState } from 'react';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';

export default function VoorwerpenPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { key: 'registrationDate', header: 'Aanmeldingsdatum' },
    { key: 'registrationTime', header: 'Aanmeldingsuur' },
    { key: 'department', header: 'Afdeling' },
    { key: 'description', header: 'Beschrijving' },
    { key: 'problem', header: 'Probleem/Klacht' },
    { key: 'advice', header: 'Advies' },
    { key: 'trackingNumber', header: 'Volgnummer' },
    { key: 'status', header: 'status' }
  ];

  const data = [
    {
      registrationDate: '10-02-2025',
      registrationTime: '12:46',
      department: 'Elektronica',
      description: 'Een digitale wekker met radio-functie',
      problem: 'De radio gaat niet meer aan',
      advice: 'Geen vloestof over de wekker gooien',
      trackingNumber: 'R7PH',
      status: 'In behandeling'
    },
    {
      registrationDate: '10-02-2025',
      registrationTime: '13:27',
      department: 'Mechanica',
      description: 'Een dompelpomp',
      problem: 'pompt te traag',
      advice: '.',
      trackingNumber: 'H56L',
      status: 'Afgegeven'
    }
  ];

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          Voorwerpen beheren
        </h1>
        <div className="w-[100px]" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 px-2.5 lg:px-24">
        {/* Search and Add */}
        <div className="flex flex-col lg:flex-row items-start gap-2.5">
          <div className="flex-1 w-full">
            <Input
              label="Zoeken"
              placeholder="Repaircafe 2025"
              required
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="primary" className="mt-6">
            +
          </Button>
        </div>

        {/* Table */}
        <div className="py-2.5 overflow-x-auto">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}

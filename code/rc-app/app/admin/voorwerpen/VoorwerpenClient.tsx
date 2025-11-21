'use client';

import { useState } from 'react';
import Input from '../../components/Input';
import Table from '../../components/Table';
import VoorwerpEditModal from '../../components/modals/VoorwerpEditModal';
import { updateVoorwerp } from '@/lib/actions/voorwerpen';

interface Voorwerp {
  voorwerpId: number;
  volgnummer: string;
  aanmeldingsDatum: Date;
  aanmeldingsTijd: Date;
  voorwerpBeschrijving: string | null;
  klachtBeschrijving: string | null;
  afdeling: { naam: string; afdelingId: number };
  voorwerpStatus: { naam: string; voorwerpStatusId: number };
}

interface VoorwerpenClientProps {
  readonly voorwerpen: Voorwerp[];
}

interface TableRow {
  volgnummer: string;
  registrationDate: string;
  registrationTime: string;
  department: string;
  description: string;
  problem: string;
  status: string;
  departmentId: number;
  statusId: number;
}

export default function VoorwerpenClient({ voorwerpen }: VoorwerpenClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TableRow | null>(null);
  const [modalTitle, setModalTitle] = useState('Voorwerp bewerken');

  const columns = [
    { key: 'registrationDate', header: 'Aanmeldingsdatum' },
    { key: 'registrationTime', header: 'Aanmeldingsuur' },
    { key: 'department', header: 'Afdeling' },
    { key: 'description', header: 'Beschrijving' },
    { key: 'problem', header: 'Probleem/Klacht' },
    { key: 'volgnummer', header: 'Volgnummer' },
    { key: 'status', header: 'Status' }
  ];

  // Transform data for table
  const tableData: TableRow[] = voorwerpen.map((voorwerp) => ({
    volgnummer: voorwerp.volgnummer,
    registrationDate: new Date(voorwerp.aanmeldingsDatum).toLocaleDateString('nl-NL'),
    registrationTime: new Date(voorwerp.aanmeldingsTijd).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
    department: voorwerp.afdeling.naam,
    description: voorwerp.voorwerpBeschrijving || '-',
    problem: voorwerp.klachtBeschrijving || '-',
    status: voorwerp.voorwerpStatus.naam,
    departmentId: voorwerp.afdeling.afdelingId,
    statusId: voorwerp.voorwerpStatus.voorwerpStatusId,
  }));

  const filteredData = tableData.filter((item) =>
    item.volgnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.problem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: TableRow) => {
    setSelectedItem(item);
    setModalTitle('Voorwerp bewerken');
    setShowEditModal(true);
  };

  const confirmEdit = async (data: { problem: string; description: string; advice: string; department: string; status: string }) => {
    if (selectedItem) {
      const result = await updateVoorwerp(selectedItem.volgnummer, {
        voorwerpBeschrijving: data.description,
        klachtBeschrijving: data.problem,
        // Note: advice field doesn't exist in schema, would need to add if needed
      });
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedItem(null);
      } else {
        alert('Fout bij het bijwerken: ' + result.error);
      }
    }
  };

  return (
    <>
      {/* Content */}
      <div className="flex flex-col gap-2.5 px-2.5 lg:px-24">
        {/* Search */}
        <div className="flex flex-col lg:flex-row items-start gap-2.5">
          <div className="flex-1 w-full">
            <Input
              label="Zoeken"
              placeholder="Volgnummer of beschrijving"
              required
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="py-2.5 overflow-x-auto">
          <Table columns={columns} data={filteredData} onEdit={handleEdit} />
        </div>
      </div>

      {/* Edit Modal */}
      <VoorwerpEditModal
        isOpen={showEditModal}
        item={selectedItem ? {
          problem: selectedItem.problem,
          description: selectedItem.description,
          advice: '',
          department: selectedItem.department,
          status: selectedItem.status,
        } : null}
        onConfirm={confirmEdit}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        title={modalTitle}
      />
    </>
  );
}

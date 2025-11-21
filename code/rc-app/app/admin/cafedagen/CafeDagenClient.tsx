'use client';

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';
import CafeDagEditModal from '../../components/modals/CafeDagEditModal';
import {
  createCafedag,
  updateCafedag,
  deleteCafedag,
  createCafe,
} from '@/lib/actions/cafedagen';

interface Cafedag {
  cafedagId: number;
  cafeId: number;
  startDatum: Date;
  eindDatum: Date;
  cafe: {
    cafeId: number;
    naam: string;
    locatie: string;
    cafePatroon: string;
  };
}

interface CafeDagenClientProps {
  readonly cafedagen: Cafedag[];
}

interface TableRow {
  cafedagId: number;
  cafeId: number;
  startDate: string;
  endDate: string;
  location: string;
  name: string;
}

export default function CafeDagenClient({ cafedagen }: CafeDagenClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TableRow | null>(null);
  const [modalTitle, setModalTitle] = useState('CafeDag bewerken');

  const columns = [
    { key: 'startDate', header: 'Start Datum' },
    { key: 'endDate', header: 'Eind Datum' },
    { key: 'location', header: 'Locatie' },
    { key: 'name', header: 'Naam' }
  ];

  // Transform data for table
  const tableData: TableRow[] = cafedagen.map((cafedag) => ({
    cafedagId: cafedag.cafedagId,
    cafeId: cafedag.cafeId,
    startDate: new Date(cafedag.startDatum).toLocaleDateString('nl-NL'),
    endDate: new Date(cafedag.eindDatum).toLocaleDateString('nl-NL'),
    location: cafedag.cafe.locatie,
    name: cafedag.cafe.naam,
  }));

  const filteredData = tableData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: TableRow) => {
    setSelectedItem(item);
    setModalTitle('CafeDag bewerken');
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalTitle('CafeDag toevoegen');
    setShowEditModal(true);
  };

  const handleDelete = (item: TableRow) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmEdit = async (data: { startDate: string; endDate: string; location: string; name: string }) => {
    if (selectedItem) {
      // Update existing cafedag
      const result = await updateCafedag(selectedItem.cafedagId, {
        startDatum: new Date(data.startDate),
        eindDatum: new Date(data.endDate),
      });
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedItem(null);
      } else {
        alert('Fout bij het bijwerken: ' + result.error);
      }
    } else {
      // Create new cafe and cafedag
      const cafeResult = await createCafe(data.name, data.location, 'RC-{yyyy}-{mm}-{dd}');
      
      if (cafeResult.success && cafeResult.cafe) {
        const cafedagResult = await createCafedag({
          cafeId: cafeResult.cafe.cafeId,
          startDatum: new Date(data.startDate),
          eindDatum: new Date(data.endDate),
        });
        
        if (cafedagResult.success) {
          setShowEditModal(false);
        } else {
          alert('Fout bij het aanmaken van cafedag: ' + cafedagResult.error);
        }
      } else {
        alert('Fout bij het aanmaken van cafe: ' + cafeResult.error);
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      const result = await deleteCafedag(selectedItem.cafedagId);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedItem(null);
      } else {
        alert('Fout bij het verwijderen: ' + result.error);
      }
    }
  };

  return (
    <>
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
          <Button variant="primary" className="mt-6" onClick={handleAdd}>
            +
          </Button>
        </div>

        {/* Table */}
        <div className="py-2.5">
          <Table
            columns={columns}
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <CafeDagEditModal
        isOpen={showEditModal}
        item={selectedItem ? {
          startDate: selectedItem.startDate,
          endDate: selectedItem.endDate,
          location: selectedItem.location,
          name: selectedItem.name,
        } : null}
        onConfirm={confirmEdit}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        title={modalTitle}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Ben je zeker?"
        description="Dit is onomkeerbaar"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

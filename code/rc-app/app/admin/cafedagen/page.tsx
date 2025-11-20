'use client';

import { useState } from 'react';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';

export default function CafeDagenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const columns = [
    { key: 'startDate', header: 'Start Datum' },
    { key: 'endDate', header: 'Eind Datum' },
    { key: 'location', header: 'Locatie' },
    { key: 'name', header: 'Naam' }
  ];

  const data = [
    {
      startDate: '10-04-2024',
      endDate: '11-04-2024',
      location: 'Mol',
      name: 'RepairCafé Mol 2024'
    },
    {
      startDate: '04-02-2025',
      endDate: '05-04-2024',
      location: 'Geel',
      name: 'RepairCafé Thomas More Geel 2025'
    }
  ];

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting:', selectedItem);
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          CafeDagen beheren
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
        <div className="py-2.5">
          <Table columns={columns} data={data} onDelete={handleDelete} />
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Ben je zeker?"
        description="Dit is onomkeerbaar"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

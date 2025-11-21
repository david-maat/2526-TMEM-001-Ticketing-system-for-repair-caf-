'use client';

import { useState } from 'react';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';
import MateriaalEditModal from '../../components/modals/MateriaalEditModal';

export default function MaterialenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const columns = [
    { key: 'name', header: 'Naam' },
    { key: 'photo', header: 'Foto' },
    { key: 'price', header: 'Prijs' }
  ];

  const data = [
    {
      name: 'Bout',
      photo: '/bolt.jpg',
      price: '€0.90'
    },
    {
      name: 'Schroef',
      photo: '/screw.jpg',
      price: '€0.80'
    }
  ];

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmEdit = (data: any) => {
    console.log('Editing material:', data);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const confirmDelete = () => {
    console.log('Deleting material:', selectedItem);
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const renderCell = (key: string, value: any) => {
    if (key === 'photo') {
      return (
        <div className="w-22 h-15 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">Image</span>
        </div>
      );
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          Materialen beheren
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
          <Table
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderCell={renderCell}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <MateriaalEditModal
        isOpen={showEditModal}
        item={selectedItem}
        onConfirm={confirmEdit}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
      />

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

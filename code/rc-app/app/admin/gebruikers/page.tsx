'use client';

import { useState } from 'react';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';

export default function GebruikersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const columns = [
    { key: 'name', header: 'Naam' },
    { key: 'type', header: 'Type' },
    { key: 'username', header: 'Gebruikersnaam' },
    { key: 'studentNumber', header: 'StudentNummer' }
  ];

  const data = [
    {
      name: 'Ruben Maat',
      type: 'Student',
      username: 'N.v.t',
      studentNumber: 'r1234567'
    },
    {
      name: 'Balie1',
      type: 'Baliemedewerker',
      username: 'Balie1',
      studentNumber: 'N.v.t'
    }
  ];

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting user:', selectedItem);
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const renderCell = (key: string, value: any, item: any) => {
    if (key === 'username' && item.type === 'Student') {
      return (
        <div className="flex items-center gap-2">
          {value}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8.00005 11.1998H11.2V7.9998H8.00005V11.1998ZM4.80005 7.1998C4.80005 5.8748 5.87505 4.7998 7.20005 4.7998H12C13.325 4.7998 14.4 5.8748 14.4 7.1998V11.9998C14.4 13.3248 13.325 14.3998 12 14.3998H7.20005C5.87505 14.3998 4.80005 13.3248 4.80005 11.9998V7.1998ZM8.00005 23.9998H11.2V20.7998H8.00005V23.9998ZM4.80005 19.9998C4.80005 18.6748 5.87505 17.5998 7.20005 17.5998H12C13.325 17.5998 14.4 18.6748 14.4 19.9998V24.7998C14.4 26.1248 13.325 27.1998 12 27.1998H7.20005C5.87505 27.1998 4.80005 26.1248 4.80005 24.7998V19.9998ZM20.8001 7.9998V11.1998H24V7.9998H20.8001ZM20.0001 4.7998H24.8001C26.1251 4.7998 27.2001 5.8748 27.2001 7.1998V11.9998C27.2001 13.3248 26.1251 14.3998 24.8001 14.3998H20.0001C18.675 14.3998 17.6 13.3248 17.6 11.9998V7.1998C17.6 5.8748 18.675 4.7998 20.0001 4.7998ZM19.2001 20.7998C18.3151 20.7998 17.6 20.0848 17.6 19.1998C17.6 18.3148 18.3151 17.5998 19.2001 17.5998C20.0851 17.5998 20.8001 18.3148 20.8001 19.1998C20.8001 20.0848 20.0851 20.7998 19.2001 20.7998ZM19.2001 23.9998C20.0851 23.9998 20.8001 24.7148 20.8001 25.5998C20.8001 26.4848 20.0851 27.1998 19.2001 27.1998C18.3151 27.1998 17.6 26.4848 17.6 25.5998C17.6 24.7148 18.3151 23.9998 19.2001 23.9998ZM24 25.5998C24 24.7148 24.715 23.9998 25.6 23.9998C26.4851 23.9998 27.2001 24.7148 27.2001 25.5998C27.2001 26.4848 26.4851 27.1998 25.6 27.1998C24.715 27.1998 24 26.4848 24 25.5998ZM25.6 20.7998C24.715 20.7998 24 20.0848 24 19.1998C24 18.3148 24.715 17.5998 25.6 17.5998C26.4851 17.5998 27.2001 18.3148 27.2001 19.1998C27.2001 20.0848 26.4851 20.7998 25.6 20.7998ZM24 22.3998C24 23.2848 23.2851 23.9998 22.4001 23.9998C21.5151 23.9998 20.8001 23.2848 20.8001 22.3998C20.8001 21.5148 21.5151 20.7998 22.4001 20.7998C23.2851 20.7998 24 21.5148 24 22.3998Z"
              fill="black"
            />
          </svg>
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
          Gebruikers beheren
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
            onDelete={handleDelete}
            renderCell={renderCell}
          />
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

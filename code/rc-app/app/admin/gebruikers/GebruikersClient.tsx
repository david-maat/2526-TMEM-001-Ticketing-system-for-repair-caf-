'use client';

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';
import QRLoginModal from '../../components/QRLoginModal';
import GebruikerEditModal from '../../components/modals/GebruikerEditModal';
import { generateQRLoginToken } from '@/lib/actions/gebruikers';
import type { GebruikerWithType } from '@/lib/types';

interface TableRow {
  id: number;
  name: string;
  type: string;
  username: string;
  studentNumber: string;
}

interface GebruikersClientProps {
  readonly gebruikers: GebruikerWithType[];
}

export default function GebruikersClient({ gebruikers }: GebruikersClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TableRow | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrUserName, setQrUserName] = useState('');
  const [modalTitle, setModalTitle] = useState('Gebruiker bewerken');

  const columns = [
    { key: 'name', header: 'Naam' },
    { key: 'type', header: 'Type' },
    { key: 'username', header: 'Gebruikersnaam' },
    { key: 'studentNumber', header: 'StudentNummer' }
  ];

  // Transform gebruikers data to table format
  const data: TableRow[] = gebruikers.map((gebruiker) => ({
    id: gebruiker.gebruikerId,
    name: gebruiker.naam,
    type: gebruiker.gebruikerType.typeNaam,
    username: gebruiker.gebruikerType.typeNaam === 'Student' ? 'N.v.t' : gebruiker.gebruikerNaam,
    studentNumber: gebruiker.studentNummer || 'N.v.t'
  }));

  const handleEdit = (item: TableRow) => {
    setSelectedItem(item);
    setModalTitle('Gebruiker bewerken');
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalTitle('Gebruiker toevoegen');
    setShowEditModal(true);
  };

  const handleDelete = (item: TableRow) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmEdit = async (data: { name: string; username?: string; password: string; passwordConfirm: string; type: string; studentNumber?: string }) => {
    // Validate mandatory fields
    if (!data.name || data.name.trim() === '') {
      alert('Naam is verplicht');
      return;
    }

    if (data.type.toLowerCase() === 'student' && (!data.studentNumber || data.studentNumber.trim() === '')) {
      alert('Studentnummer is verplicht voor studenten');
      return;
    }

    if (data.type.toLowerCase() !== 'student' && (!data.username || data.username.trim() === '')) {
      alert('Gebruikersnaam is verplicht voor niet-studenten');
      return;
    }

    // Only validate password for non-student users
    if (data.type.toLowerCase() !== 'student' && data.password !== data.passwordConfirm) {
      alert('Wachtwoorden komen niet overeen');
      return;
    }

    // Map type name to ID
    const typeMap: { [key: string]: number } = {
      'admin': 1,
      'student': 2,
      'baliemedewerker': 3
    };

    const gebruikerTypeId = typeMap[data.type.toLowerCase()] || 2;

    if (selectedItem) {
      // Update existing
      const { updateGebruiker } = await import('@/lib/actions/gebruikers');
      const result = await updateGebruiker(selectedItem.id, {
        naam: data.name,
        ...(data.password && { wachtwoord: data.password }),
        ...(data.studentNumber && { studentNummer: data.studentNumber }),
        gebruikerTypeId,
      });
      if (result.success) {
        setShowEditModal(false);
        setSelectedItem(null);
      } else {
        alert('Fout bij het bijwerken: ' + result.error);
      }
    } else {
      // Create new - need username
      const gebruikerNaam = data.type.toLowerCase() === 'student' && data.studentNumber 
        ? data.studentNumber 
        : data.username || data.name.toLowerCase().replaceAll(/\s+/g, '');
      const { createGebruiker } = await import('@/lib/actions/gebruikers');
      const result = await createGebruiker({
        gebruikerNaam,
        naam: data.name,
        studentNummer: data.studentNumber,
        wachtwoord: data.type.toLowerCase() === 'student' ? '' : data.password,
        gebruikerTypeId,
      });
      if (result.success) {
        setShowEditModal(false);
      } else {
        alert('Fout bij het aanmaken: ' + result.error);
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      const { deleteGebruiker } = await import('@/lib/actions/gebruikers');
      const result = await deleteGebruiker(selectedItem.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedItem(null);
      } else {
        alert('Fout bij het verwijderen: ' + result.error);
      }
    }
  };

  const handleGenerateQR = async (item: TableRow) => {
    try {
      setQrUserName(item.name);
      const result = await generateQRLoginToken(item.id);

      if (result.success && result.token) {
        setQrToken(result.token);
        setShowQRModal(true);
      } else {
        console.error('Failed to generate QR token:', result.error);
        alert('Fout bij het genereren van QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Fout bij het genereren van QR code');
    }
  };

  const renderCell = (key: string, value: string, item: TableRow) => {
    if (key === 'username' && item.type === 'Student') {
      return (
        <div className="flex items-center gap-2">
          {value}
          <button
            onClick={() => handleGenerateQR(item)}
            className="hover:opacity-70 transition-opacity"
            title="QR Login genereren"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M8.00005 11.1998H11.2V7.9998H8.00005V11.1998ZM4.80005 7.1998C4.80005 5.8748 5.87505 4.7998 7.20005 4.7998H12C13.325 4.7998 14.4 5.8748 14.4 7.1998V11.9998C14.4 13.3248 13.325 14.3998 12 14.3998H7.20005C5.87505 14.3998 4.80005 13.3248 4.80005 11.9998V7.1998ZM8.00005 23.9998H11.2V20.7998H8.00005V23.9998ZM4.80005 19.9998C4.80005 18.6748 5.87505 17.5998 7.20005 17.5998H12C13.325 17.5998 14.4 18.6748 14.4 19.9998V24.7998C14.4 26.1248 13.325 27.1998 12 27.1998H7.20005C5.87505 27.1998 4.80005 26.1248 4.80005 24.7998V19.9998ZM20.8001 7.9998V11.1998H24V7.9998H20.8001ZM20.0001 4.7998H24.8001C26.1251 4.7998 27.2001 5.8748 27.2001 7.1998V11.9998C27.2001 13.3248 26.1251 14.3998 24.8001 14.3998H20.0001C18.675 14.3998 17.6 13.3248 17.6 11.9998V7.1998C17.6 5.8748 18.675 4.7998 20.0001 4.7998ZM19.2001 20.7998C18.3151 20.7998 17.6 20.0848 17.6 19.1998C17.6 18.3148 18.3151 17.5998 19.2001 17.5998C20.0851 17.5998 20.8001 18.3148 20.8001 19.1998C20.8001 20.0848 20.0851 20.7998 19.2001 20.7998ZM19.2001 23.9998C20.0851 23.9998 20.8001 24.7148 20.8001 25.5998C20.8001 26.4848 20.0851 27.1998 19.2001 27.1998C18.3151 27.1998 17.6 26.4848 17.6 25.5998C17.6 24.7148 18.3151 23.9998 19.2001 23.9998ZM24 25.5998C24 24.7148 24.715 23.9998 25.6 23.9998C26.4851 23.9998 27.2001 24.7148 27.2001 25.5998C27.2001 26.4848 26.4851 27.1998 25.6 27.1998C24.715 27.1998 24 26.4848 24 25.5998ZM25.6 20.7998C24.715 20.7998 24 20.0848 24 19.1998C24 18.3148 24.715 17.5998 25.6 17.5998C26.4851 17.5998 27.2001 18.3148 27.2001 19.1998C27.2001 20.0848 26.4851 20.7998 25.6 20.7998ZM24 22.3998C24 23.2848 23.2851 23.9998 22.4001 23.9998C21.5151 23.9998 20.8001 23.2848 20.8001 22.3998C20.8001 21.5148 21.5151 20.7998 22.4001 20.7998C23.2851 20.7998 24 21.5148 24 22.3998Z"
                fill="black"
              />
            </svg>
          </button>
        </div>
      );
    }
    return value;
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
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderCell={renderCell}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <GebruikerEditModal
        isOpen={showEditModal}
        item={selectedItem ? { 
          name: selectedItem.name, 
          type: selectedItem.type, 
          username: selectedItem.username !== 'N.v.t' ? selectedItem.username : undefined,
          studentNumber: selectedItem.studentNumber !== 'N.v.t' ? selectedItem.studentNumber : undefined 
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

      {/* QR Login Modal */}
      <QRLoginModal
        isOpen={showQRModal}
        token={qrToken}
        userName={qrUserName}
        onClose={() => {
          setShowQRModal(false);
          setQrToken(null);
        }}
      />
    </>
  );
}

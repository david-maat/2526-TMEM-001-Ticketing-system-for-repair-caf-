'use client';

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';
import AfdelingEditModal from '../../components/modals/AfdelingEditModal';
import {
  createAfdeling,
  updateAfdeling,
  deleteAfdeling,
} from '@/lib/actions/afdelingen';
import type { Afdeling } from '@prisma/client';

interface AfdelingenClientProps {
  readonly afdelingen: Afdeling[];
}

export default function AfdelingenClient({ afdelingen }: AfdelingenClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Afdeling | null>(null);
  const [modalTitle, setModalTitle] = useState('Afdeling bewerken');

  const columns = [{ key: 'naam', header: 'Naam' }];

  const filteredData = afdelingen.filter((afdeling) =>
    afdeling.naam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: Afdeling) => {
    setSelectedItem(item);
    setModalTitle('Afdeling bewerken');
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalTitle('Afdeling toevoegen');
    setShowEditModal(true);
  };

  const handleDelete = (item: Afdeling) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmEdit = async (data: { name: string }) => {
    if (selectedItem) {
      // Update existing
      const result = await updateAfdeling(selectedItem.afdelingId, data.name);
      if (result.success) {
        setShowEditModal(false);
        setSelectedItem(null);
      } else {
        alert('Fout bij het bijwerken: ' + result.error);
      }
    } else {
      // Create new
      const result = await createAfdeling(data.name);
      if (result.success) {
        setShowEditModal(false);
      } else {
        alert('Fout bij het aanmaken: ' + result.error);
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      const result = await deleteAfdeling(selectedItem.afdelingId);
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
              placeholder="Elektronica"
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
      <AfdelingEditModal
        isOpen={showEditModal}
        item={selectedItem ? { name: selectedItem.naam } : null}
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

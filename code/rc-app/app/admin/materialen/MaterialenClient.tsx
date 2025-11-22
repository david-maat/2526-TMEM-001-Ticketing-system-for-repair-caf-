'use client';

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';
import MateriaalEditModal from '../../components/modals/MateriaalEditModal';
import {
    createMateriaal,
    updateMateriaal,
    deleteMateriaal,
} from '@/lib/actions/materialen';
import type { Materiaal } from '@prisma/client';

interface MaterialenClientProps {
    readonly materialen: Materiaal[];
}

export default function MaterialenClient({ materialen }: MaterialenClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Materiaal | null>(null);
    const [modalTitle, setModalTitle] = useState('Materiaal bewerken');

    const columns = [
        { key: 'naam', header: 'Naam' },
        { key: 'materiaalId', header: 'ID' },
    ];

    const filteredData = materialen.filter((materiaal) =>
        materiaal.naam.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (item: Materiaal) => {
        setSelectedItem(item);
        setModalTitle('Materiaal bewerken');
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setSelectedItem(null);
        setModalTitle('Materiaal toevoegen');
        setShowEditModal(true);
    };

    const handleDelete = (item: Materiaal) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmEdit = async (data: { name: string; price: string; photo?: File | null }) => {
        try {
            let fotoUrl: string | undefined = undefined;

            // Upload photo if provided
            if (data.photo) {
                const formData = new FormData();
                formData.append('file', data.photo);

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    alert('Fout bij uploaden foto: ' + (error.error || 'Onbekende fout'));
                    return;
                }

                const uploadResult = await uploadResponse.json();
                fotoUrl = uploadResult.url;
            }

            if (selectedItem) {
                // Update existing
                const result = await updateMateriaal(
                    selectedItem.materiaalId, 
                    data.name,
                    fotoUrl
                );
                if (result.success) {
                    setShowEditModal(false);
                    setSelectedItem(null);
                } else {
                    alert('Fout bij het bijwerken: ' + result.error);
                }
            } else {
                // Create new
                const result = await createMateriaal(data.name, fotoUrl);
                if (result.success) {
                    setShowEditModal(false);
                } else {
                    alert('Fout bij het aanmaken: ' + result.error);
                }
            }
        } catch (error) {
            console.error('Error in confirmEdit:', error);
            alert('Er is een fout opgetreden');
        }
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            const result = await deleteMateriaal(selectedItem.materiaalId);
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
                            placeholder="Bout"
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
            <MateriaalEditModal
                isOpen={showEditModal}
                item={selectedItem ? { 
                    name: selectedItem.naam, 
                    price: '0', 
                    photo: selectedItem.fotoUrl || '' 
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

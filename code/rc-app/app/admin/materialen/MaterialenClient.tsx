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
        { key: 'fotoUrl', header: 'Foto' },
        { key: 'naam', header: 'Naam' },
        { key: 'prijs', header: 'Prijs' },
    ];

    const renderCell = (key: string, value: any) => {
        if (key === 'fotoUrl') {
            return value ? (
                <img src={value} alt="Materiaal" className="w-16 h-16 object-cover rounded" />
            ) : (
                <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">Geen foto</div>
            );
        }
        if (key === 'prijs') {
            return value != null ? `€${(Number(value) / 100).toFixed(2).replace('.', ',')}` : 'N.v.t';
        }
        return value;
    };

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

            // Convert euros to cents for storage (handle both comma and point as decimal separator)
            const prijsInCents = data.price ? Math.round(parseFloat(data.price.replace(',', '.')) * 100) : undefined;

            if (selectedItem) {
                // Update existing
                const result = await updateMateriaal(
                    selectedItem.materiaalId, 
                    data.name,
                    fotoUrl,
                    prijsInCents
                );
                if (result.success) {
                    setShowEditModal(false);
                    setSelectedItem(null);
                } else {
                    alert('Fout bij het bijwerken: ' + result.error);
                }
            } else {
                // Create new
                const result = await createMateriaal(data.name, fotoUrl, prijsInCents);
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
                        renderCell={renderCell}
                    />
                </div>
            </div>

            {/* Edit Modal */}
            <MateriaalEditModal
                isOpen={showEditModal}
                item={selectedItem ? { 
                    name: selectedItem.naam, 
                    price: selectedItem.prijs ? (selectedItem.prijs / 100).toFixed(2).replace('.', ',') : '', 
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

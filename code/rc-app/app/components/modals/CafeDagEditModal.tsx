'use client';

import React, { useState } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';

interface CafeDagEditModalProps {
  isOpen: boolean;
  item?: {
    startDate: string;
    endDate: string;
    location: string;
    name: string;
  } | null;
  onConfirm: (data: {
    startDate: string;
    endDate: string;
    location: string;
    name: string;
  }) => void;
  onCancel: () => void;
}

export default function CafeDagEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel
}: CafeDagEditModalProps) {
  const [startDate, setStartDate] = useState(item?.startDate || '');
  const [endDate, setEndDate] = useState(item?.endDate || '');
  const [location, setLocation] = useState(item?.location || '');
  const [name, setName] = useState(item?.name || '');

  const handleConfirm = () => {
    onConfirm({ startDate, endDate, location, name });
  };

  return (
    <EditModal
      isOpen={isOpen}
      title="CafeDag bewerken"
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <Input
        label="Start"
        placeholder="Datum"
        required
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Input
        label="Eind"
        placeholder="Datum"
        required
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Input
        label="Locatie"
        placeholder="Geel"
        required
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Input
        label="Naam"
        placeholder="RepairCafé Thomas More Geel 2025"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </EditModal>
  );
}

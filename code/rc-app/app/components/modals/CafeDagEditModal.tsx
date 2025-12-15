'use client';

import React, { useState, useEffect } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';

interface CafeDagEditModalProps {
  readonly isOpen: boolean;
  readonly item?: {
    startDate: Date;
    endDate: Date;
    location: string;
    name: string;
  } | null;
  readonly onConfirm: (data: {
    startDate: Date;
    endDate: Date;
    location: string;
    name: string;
  }) => void;
  readonly onCancel: () => void;
  readonly title?: string;
}

export default function CafeDagEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
  title = 'CafeDag bewerken'
}: CafeDagEditModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(item?.startDate ?? null);
  const [endDate, setEndDate] = useState<Date | null>(item?.endDate ?? null);
  const [location, setLocation] = useState(item?.location || '');
  const [name, setName] = useState(item?.name || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setStartDate(item?.startDate ?? null);
    setEndDate(item?.endDate ?? null);
    setLocation(item?.location || '');
    setName(item?.name || '');
  }, [item]);

  const handleConfirm = () => {
    // ensure non-null Dates are passed
    if (!startDate || !endDate) {
      setError('Vul start- en einddatum in');
      return;
    }
    setError('');
    onConfirm({ startDate, endDate, location, name });
  };

  const formatForInput = (d: Date | null) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseFromInput = (value: string) => {
    if (!value) return null;
    const [y, m, day] = value.split('-').map((v) => Number.parseInt(v, 10));
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(day)) return null;
    return new Date(y, m - 1, day);
  };

  return (
    <EditModal
      isOpen={isOpen}
      title={title}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <Input
        label="Start"
        placeholder="Datum"
        required
        type="date"
        value={formatForInput(startDate)}
        onChange={(e) => setStartDate(parseFromInput(e.target.value))}
      />
      <Input
        label="Eind"
        placeholder="Datum"
        required
        type="date"
        value={formatForInput(endDate)}
        onChange={(e) => setEndDate(parseFromInput(e.target.value))}
      />
      {error && (
        <div className="text-red-400 text-xs mt-1">{error}</div>
      )}
      <Input
        label="Locatie"
        placeholder=""
        required
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Input
        label="Naam"
        placeholder=""
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </EditModal>
  );
}

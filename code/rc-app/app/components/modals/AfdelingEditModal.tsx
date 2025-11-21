'use client';

import React, { useState, useEffect } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';

interface AfdelingEditModalProps {
  isOpen: boolean;
  item?: {
    name: string;
  } | null;
  onConfirm: (data: { name: string }) => void;
  onCancel: () => void;
  title?: string;
}

export default function AfdelingEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
  title = 'Afdeling bewerken'
}: AfdelingEditModalProps) {
  const [name, setName] = useState(item?.name || '');

  useEffect(() => {
    setName(item?.name || '');
  }, [item]);

  const handleConfirm = () => {
    onConfirm({ name });
  };

  return (
    <EditModal
      isOpen={isOpen}
      title={title}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <Input
        label="Naam"
        placeholder="Elektronica"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </EditModal>
  );
}

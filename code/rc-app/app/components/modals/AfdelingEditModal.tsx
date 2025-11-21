'use client';

import React, { useState } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';

interface AfdelingEditModalProps {
  isOpen: boolean;
  item?: {
    name: string;
  } | null;
  onConfirm: (data: { name: string }) => void;
  onCancel: () => void;
}

export default function AfdelingEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel
}: AfdelingEditModalProps) {
  const [name, setName] = useState(item?.name || '');

  const handleConfirm = () => {
    onConfirm({ name });
  };

  return (
    <EditModal
      isOpen={isOpen}
      title="Afdeling bewerken"
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

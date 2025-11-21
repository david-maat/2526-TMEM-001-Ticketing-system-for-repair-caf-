'use client';

import React, { useState } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';
import Dropdown from '../Dropdown';

interface GebruikerEditModalProps {
  isOpen: boolean;
  item?: {
    name: string;
    type: string;
  } | null;
  onConfirm: (data: {
    name: string;
    password: string;
    passwordConfirm: string;
    type: string;
  }) => void;
  onCancel: () => void;
}

export default function GebruikerEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel
}: GebruikerEditModalProps) {
  const [name, setName] = useState(item?.name || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [type, setType] = useState(item?.type || '');

  const typeOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'student', label: 'Student' },
    { value: 'baliemedewerker', label: 'Baliemedewerker' }
  ];

  const handleConfirm = () => {
    onConfirm({ name, password, passwordConfirm, type });
  };

  return (
    <EditModal
      isOpen={isOpen}
      title="Gebruiker bewerken"
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <Input
        label="Naam"
        placeholder="Ruben Maat"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Nieuw wachtwoord"
        placeholder="***********"
        required
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Nieuw Wachtwoord herhalen"
        placeholder="***********"
        required
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      />
      <div className="flex flex-col gap-0.5">
        <Dropdown
          options={typeOptions}
          placeholder="Type"
          value={type}
          onChange={setType}
        />
      </div>
    </EditModal>
  );
}

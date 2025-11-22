'use client';

import React, { useState, useEffect } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';
import Dropdown from '../Dropdown';

interface GebruikerEditModalProps {
  isOpen: boolean;
  item?: {
    name: string;
    type: string;
    username?: string;
    studentNumber?: string;
  } | null;
  onConfirm: (data: {
    name: string;
    username?: string;
    password: string;
    passwordConfirm: string;
    type: string;
    studentNumber?: string;
  }) => void;
  onCancel: () => void;
  title?: string;
}

export default function GebruikerEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
  title = 'Gebruiker bewerken'
}: GebruikerEditModalProps) {
  const [name, setName] = useState(item?.name || '');
  const [username, setUsername] = useState(item?.username || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [type, setType] = useState(item?.type || '');
  const [studentNumber, setStudentNumber] = useState(item?.studentNumber || '');

  useEffect(() => {
    setName(item?.name || '');
    setUsername(item?.username || '');
    setPassword('');
    setPasswordConfirm('');
    setType(item?.type || '');
    setStudentNumber(item?.studentNumber || '');
  }, [item]);

  const typeOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'student', label: 'Student' },
    { value: 'baliemedewerker', label: 'Baliemedewerker' }
  ];

  const handleConfirm = () => {
    // Validate required fields
    if (!name || name.trim() === '') {
      alert('Naam is verplicht');
      return;
    }
    if (type.toLowerCase() === 'student' && (!studentNumber || studentNumber.trim() === '')) {
      alert('Studentnummer is verplicht voor studenten');
      return;
    }
    if (type.toLowerCase() !== 'student') {
      if (!username || username.trim() === '') {
        alert('Gebruikersnaam is verplicht voor niet-studenten');
        return;
      }
      if (!password || password.trim() === '') {
        alert('Wachtwoord is verplicht voor niet-studenten');
        return;
      }
    }
    onConfirm({ 
      name, 
      username: type.toLowerCase() !== 'student' ? username : undefined,
      password, 
      passwordConfirm, 
      type, 
      studentNumber: type.toLowerCase() === 'student' ? studentNumber : undefined 
    });
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
        placeholder="Ruben Maat"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {type.toLowerCase() === 'student' ? (
        <Input
          label="Studentnummer"
          placeholder="r0123456"
          required
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
        />
      ) : (
        <Input
          label="Gebruikersnaam"
          placeholder="johndoe"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}
      {type.toLowerCase() !== 'student' && (
        <>
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
        </>
      )}
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

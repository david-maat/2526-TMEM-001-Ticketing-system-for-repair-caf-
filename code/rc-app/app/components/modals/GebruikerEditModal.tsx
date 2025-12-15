'use client';

import React, { useState, useEffect } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';
import Dropdown from '../Dropdown';
import { GEBRUIKER_TYPES } from '@/lib/constants/gebruikers';

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
  const isEditing = Boolean(item);

  const [name, setName] = useState(item?.name || '');
  const [username, setUsername] = useState(item?.username || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [type, setType] = useState(item?.type?.toLowerCase() || '');
  const [studentNumber, setStudentNumber] = useState(item?.studentNumber || '');

  useEffect(() => {
    setName(item?.name || '');
    setUsername(item?.username || '');
    setPassword('');
    setPasswordConfirm('');
    setType(item?.type?.toLowerCase() || '');
    setStudentNumber(item?.studentNumber || '');
  }, [item]);

  const typeOptions = GEBRUIKER_TYPES.map((t) => ({ value: t.key, label: t.label }));

  const handleConfirm = () => {
    // Validate required fields
    if (!name || name.trim() === '') {
      alert('Naam is verplicht');
      return;
    }
    if (type === 'student' && (!studentNumber || studentNumber.trim() === '')) {
      alert('Studentnummer is verplicht voor studenten');
      return;
    }
    if (type !== 'student') {
      if (!username || username.trim() === '') {
        alert('Gebruikersnaam is verplicht voor niet-studenten');
        return;
      }
      // Only require a password on create; on edit it's optional.
      if (!item && (!password || password.trim() === '')) {
        alert('Wachtwoord is verplicht voor niet-studenten');
        return;
      }
      const passwordWasProvided = (password && password.trim() !== '') || (passwordConfirm && passwordConfirm.trim() !== '');
      if (passwordWasProvided) {
        if (!password || password.trim() === '' || !passwordConfirm || passwordConfirm.trim() === '') {
          alert('Vul beide wachtwoordvelden in');
          return;
        }
        if (password !== passwordConfirm) {
          alert('Wachtwoorden komen niet overeen');
          return;
        }
      }
    }
    onConfirm({ 
      name, 
      username: type !== 'student' ? username : undefined,
      password, 
      passwordConfirm, 
      type, 
      studentNumber: type === 'student' ? studentNumber : undefined 
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      title={title}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-0.5">
        <Dropdown
          options={typeOptions}
          placeholder="Type"
          value={type}
          onChange={setType}
          disabled={isEditing}
        />
      </div>
      <Input
        label="Naam"
        placeholder=""
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {type.toLowerCase() === 'student' ? (
        <Input
          label="Studentnummer"
          placeholder=""
          required
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
        />
      ) : (
        <Input
          label="Gebruikersnaam"
          placeholder=""
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Nieuw Wachtwoord herhalen"
            placeholder="***********"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </>
      )}
    </EditModal>
  );
}

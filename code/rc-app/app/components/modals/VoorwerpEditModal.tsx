'use client';

import React, { useState, useEffect } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';
import Dropdown from '../Dropdown';

interface VoorwerpEditModalProps {
  isOpen: boolean;
  item?: {
    problem: string;
    description: string;
    advice: string;
    department: string;
    status: string;
  } | null;
  onConfirm: (data: {
    problem: string;
    description: string;
    advice: string;
    department: string;
    status: string;
  }) => void;
  onCancel: () => void;
  title?: string;
}

export default function VoorwerpEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
  title = 'Voorwerp bewerken'
}: VoorwerpEditModalProps) {
  const [problem, setProblem] = useState(item?.problem || '');
  const [description, setDescription] = useState(item?.description || '');
  const [advice, setAdvice] = useState(item?.advice || '');
  const [department, setDepartment] = useState(item?.department || '');
  const [status, setStatus] = useState(item?.status || '');

  useEffect(() => {
    setProblem(item?.problem || '');
    setDescription(item?.description || '');
    setAdvice(item?.advice || '');
    setDepartment(item?.department || '');
    setStatus(item?.status || '');
  }, [item]);

  const departmentOptions = [
    { value: 'elektronica', label: 'Elektronica' },
    { value: 'mechanica', label: 'Mechanica' }
  ];

  const statusOptions = [
    { value: 'in-behandeling', label: 'In behandeling' },
    { value: 'gerepareerd', label: 'Gerepareerd' },
    { value: 'afgegeven', label: 'Afgegeven' },
    { value: 'niet-gerepareerd', label: 'Niet gerepareerd' }
  ];

  const handleConfirm = () => {
    onConfirm({ problem, description, advice, department, status });
  };

  return (
    <EditModal
      isOpen={isOpen}
      title={title}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <Input
        label="Probleem/Klacht"
        placeholder="Gaat niet meer aan"
        required
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />
      <Input
        label="Beschrijving"
        placeholder="Een Digitale wekker"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="Advies"
        placeholder="Geen vloeistof over de wekker gooien"
        required
        value={advice}
        onChange={(e) => setAdvice(e.target.value)}
      />
      <div className="flex flex-col gap-0.5">
        <Dropdown
          options={departmentOptions}
          placeholder="Afdeling"
          value={department}
          onChange={setDepartment}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <Dropdown
          options={statusOptions}
          placeholder="Status"
          value={status}
          onChange={setStatus}
        />
      </div>
    </EditModal>
  );
}

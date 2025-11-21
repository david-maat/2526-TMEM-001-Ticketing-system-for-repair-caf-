'use client';

import React, { useState } from 'react';
import EditModal from '../EditModal';
import Input from '../Input';

interface MateriaalEditModalProps {
  isOpen: boolean;
  item?: {
    name: string;
    price: string;
    photo?: string;
  } | null;
  onConfirm: (data: {
    name: string;
    price: string;
    photo?: File | null;
  }) => void;
  onCancel: () => void;
}

export default function MateriaalEditModal({
  isOpen,
  item,
  onConfirm,
  onCancel
}: MateriaalEditModalProps) {
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(item?.photo || '');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    onConfirm({ name, price, photo });
  };

  return (
    <EditModal
      isOpen={isOpen}
      title="Materiaal bewerken"
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <Input
        label="Naam"
        placeholder="Bout"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Prijs"
        placeholder="0,90"
        required
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <label className="text-white font-inter text-xs font-normal">
          Foto
        </label>
        <div className="flex items-center gap-2.5">
          {photoPreview && (
            <div className="w-22 h-15 rounded overflow-hidden bg-gray-200">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <label className="cursor-pointer flex items-center justify-center w-15 h-15 rounded bg-transparent hover:bg-white/10 transition-colors">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M27.5 40V19.625L21 26.125L17.5 22.5L30 10L42.5 22.5L39 26.125L32.5 19.625V40H27.5ZM15 50C13.625 50 12.4483 49.5108 11.47 48.5325C10.4917 47.5542 10.0017 46.3767 10 45V37.5H15V45H45V37.5H50V45C50 46.375 49.5108 47.5525 48.5325 48.5325C47.5542 49.5125 46.3767 50.0017 45 50H15Z" fill="white"/>
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </EditModal>
  );
}

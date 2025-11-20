'use client';

import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Nonactief maken',
  cancelText = 'Annuleren'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[547px] rounded-2xl bg-[#ED532A] p-8 flex flex-col gap-2.5">
        <h2 className="text-white font-inter text-xl font-bold leading-[30px] tracking-[-0.4px]">
          {title}
        </h2>
        <p className="text-white font-inter text-base font-normal leading-[22px] tracking-[-0.32px]">
          {description}
        </p>
        <div className="flex items-center gap-4 mt-6 px-4">
          <button
            onClick={onCancel}
            className="flex-1 h-12 px-4 py-3 flex items-center justify-center rounded-md bg-[#EEF1F4] cursor-pointer hover:bg-[#dde1e4]"
          >
            <span className="text-[#545F71] font-inter text-base font-semibold leading-[22px] tracking-[-0.32px]">
              {cancelText}
            </span>
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 px-4 py-3 flex items-center justify-center rounded-md bg-[#BC3535] cursor-pointer hover:bg-[#a32e2e]"
          >
            <span className="text-white font-inter text-base font-semibold leading-[22px] tracking-[-0.32px]">
              {confirmText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

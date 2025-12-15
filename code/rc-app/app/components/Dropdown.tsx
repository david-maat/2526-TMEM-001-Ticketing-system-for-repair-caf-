'use client';

import React, { useState, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function Dropdown({
  options,
  placeholder = 'Select an option',
  value,
  onChange,
  className = '',
  disabled = false
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Sync internal state with value prop when it changes
  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between gap-0.5 w-full px-3.5 py-2 rounded-md ${isOpen ? 'rounded-b-none' : ''} bg-white text-black font-open-sans text-2xl font-normal ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
      >
        <span>{selectedLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.43494 11.7645C7.74744 12.077 8.25494 12.077 8.56744 11.7645L13.3674 6.96453C13.6799 6.65203 13.6799 6.14453 13.3674 5.83203C13.0549 5.51953 12.5474 5.51953 12.2349 5.83203L7.99994 10.067L3.76495 5.83453C3.45245 5.52203 2.94495 5.52203 2.63245 5.83453C2.31995 6.14703 2.31995 6.65453 2.63245 6.96703L7.43244 11.767L7.43494 11.7645Z"
            fill="black"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-0 bg-white rounded-b-md overflow-hidden shadow-lg z-10">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-1.5 py-0.5 cursor-pointer hover:bg-gray-100 text-black font-open-sans text-2xl"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

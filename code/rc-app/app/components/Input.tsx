import React from 'react';

interface InputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export default function Input({
  label,
  placeholder,
  required = false,
  type = 'text',
  value,
  onChange,
  onBlur,
  multiline = false,
  rows = 1,
  className = '',
  disabled = false
}: InputProps) {
  const inputClasses = 'w-full px-3.5 py-2 rounded-md bg-white text-black font-open-sans text-md font-normal placeholder:text-black/50 border-none focus:outline-none focus:ring-2 focus:ring-[#ED5028]';

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        <label className="text-white font-inter text-xs font-normal">
          {label}
        </label>
        {required && (
          <span className="text-red-500 font-inter text-xs font-normal">*</span>
        )}
      </div>
      {multiline ? (
        <textarea
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          rows={rows}
          disabled={disabled}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClasses}
        />
      )}
    </div>
  );
}

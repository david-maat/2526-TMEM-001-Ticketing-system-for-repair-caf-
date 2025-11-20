import React from 'react';

interface InputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  multiline = false,
  rows = 1,
  className = '',
  disabled = false
}: InputProps) {
  const inputClasses = 'w-full px-1 py-0.5 rounded-md bg-white text-xs text-black placeholder:text-black/50 border-none focus:outline-none focus:ring-2 focus:ring-[#ED5028]';

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
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
          className={inputClasses}
        />
      )}
    </div>
  );
}

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

export default function Button({ 
  children, 
  variant = 'default', 
  onClick, 
  type = 'button',
  className = '',
  disabled = false
}: ButtonProps) {
  const baseStyles = 'px-5 py-1.5 rounded-md font-open-sans text-md font-normal transition-all cursor-pointer';
  
  const variantStyles = {
    default: 'bg-transparent text-black',
    primary: 'bg-[#ED5028] text-white hover:bg-[#d4451f]',
    secondary: 'bg-white text-black hover:bg-gray-100'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

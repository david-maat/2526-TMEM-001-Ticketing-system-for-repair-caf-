'use client';

import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });
  };

  return (
    <div className="min-h-screen bg-[#03091C] flex items-center justify-center p-4">
      <div className="w-full max-w-md lg:max-w-lg flex flex-col items-center gap-8 lg:gap-10">
        {/* Illustration */}
        <div className="flex flex-col items-center gap-2.5">
          <svg
            className="w-60 h-60"
            viewBox="0 0 241 239"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_8_49)">
              <path
                d="M197.374 238.704H29.5404V66.4599C29.5404 29.8137 59.3469 3.05176e-05 95.984 3.05176e-05H130.93C167.567 3.05176e-05 197.374 29.8137 197.374 66.4599V238.704Z"
                fill="#F2F2F2"
              />
              <path
                d="M162.428 238.704H29.5404V66.4599C29.5038 52.4179 33.9492 38.7308 42.2295 27.3915C42.5347 26.9753 42.8392 26.5646 43.1531 26.1585C47.1582 20.9042 51.9244 16.2768 57.2945 12.4291C57.5978 12.2083 57.9024 11.9913 58.2115 11.7744C62.7049 8.66405 67.5656 6.12141 72.683 4.20434C72.9869 4.08924 73.2963 3.97383 73.6057 3.86294C78.2339 2.21064 83.0315 1.07875 87.91 0.48817C88.2113 0.446889 88.5231 0.414651 88.8334 0.382109C93.5874 -0.126327 98.3821 -0.126327 103.136 0.382109C103.446 0.41435 103.756 0.446891 104.062 0.488473C108.939 1.07923 113.736 2.21112 118.363 3.86325C118.672 3.97383 118.982 4.08924 119.286 4.20494C124.341 6.09769 129.145 8.60231 133.591 11.6629C133.899 11.8738 134.208 12.092 134.513 12.3089C137.523 14.4581 140.35 16.8524 142.966 19.4674C145.064 21.5648 147.018 23.8006 148.817 26.1597C149.13 26.5646 149.434 26.9753 149.739 27.3908C158.02 38.7303 162.465 52.4176 162.429 66.4599L162.428 238.704Z"
                fill="#CCCCCC"
              />
              <path
                d="M151.622 119.122C155.685 119.122 158.979 115.828 158.979 111.764C158.979 107.699 155.685 104.405 151.622 104.405C147.559 104.405 144.265 107.699 144.265 111.764C144.265 115.828 147.559 119.122 151.622 119.122Z"
                fill="#ED5028"
              />
            </g>
            <defs>
              <clipPath id="clip0_8_49">
                <rect width="241" height="239" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Login Form */}
        <div className="w-full flex flex-col items-center gap-2.5">
          <h1 className="text-white font-open-sans text-4xl font-normal">
            Repair Café
          </h1>
          <p className="text-white font-open-sans text-2xl font-normal">
            Gelieve in te loggen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-[283px] flex flex-col items-center gap-9">
          {/* Mobile: QR Code Option */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <svg
              className="w-14 h-14 flex-shrink-0"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 18.9H18.9V13.5H13.5V18.9ZM8.10001 12.15C8.10001 9.91407 9.91407 8.10001 12.15 8.10001H20.25C22.4859 8.10001 24.3 9.91407 24.3 12.15V20.25C24.3 22.4859 22.4859 24.3 20.25 24.3H12.15C9.91407 24.3 8.10001 22.4859 8.10001 20.25V12.15ZM13.5 40.5H18.9V35.1H13.5V40.5ZM8.10001 33.75C8.10001 31.5141 9.91407 29.7 12.15 29.7H20.25C22.4859 29.7 24.3 31.5141 24.3 33.75V41.85C24.3 44.0859 22.4859 45.9 20.25 45.9H12.15C9.91407 45.9 8.10001 44.0859 8.10001 41.85V33.75ZM35.1 13.5V18.9H40.5V13.5H35.1ZM33.75 8.10001H41.85C44.0859 8.10001 45.9 9.91407 45.9 12.15V20.25C45.9 22.4859 44.0859 24.3 41.85 24.3H33.75C31.5141 24.3 29.7 22.4859 29.7 20.25V12.15C29.7 9.91407 31.5141 8.10001 33.75 8.10001ZM32.4 35.1C30.9066 35.1 29.7 33.8934 29.7 32.4C29.7 30.9066 30.9066 29.7 32.4 29.7C33.8934 29.7 35.1 30.9066 35.1 32.4C35.1 33.8934 33.8934 35.1 32.4 35.1ZM32.4 40.5C33.8934 40.5 35.1 41.7066 35.1 43.2C35.1 44.6934 33.8934 45.9 32.4 45.9C30.9066 45.9 29.7 44.6934 29.7 43.2C29.7 41.7066 30.9066 40.5 32.4 40.5ZM40.5 43.2C40.5 41.7066 41.7066 40.5 43.2 40.5C44.6934 40.5 45.9 41.7066 45.9 43.2C45.9 44.6934 44.6934 45.9 43.2 45.9C41.7066 45.9 40.5 44.6934 40.5 43.2ZM43.2 35.1C41.7066 35.1 40.5 33.8934 40.5 32.4C40.5 30.9066 41.7066 29.7 43.2 29.7C44.6934 29.7 45.9 30.9066 45.9 32.4C45.9 33.8934 44.6934 35.1 43.2 35.1ZM40.5 37.8C40.5 39.2934 39.2934 40.5 37.8 40.5C36.3066 40.5 35.1 39.2934 35.1 37.8C35.1 36.3066 36.3066 35.1 37.8 35.1C39.2934 35.1 40.5 36.3066 40.5 37.8Z"
                fill="white"
              />
            </svg>
            <Button variant="primary">Scan QR</Button>
          </div>

          <div className="text-white font-open-sans text-2xl font-normal lg:hidden">OR</div>

          {/* Login Fields */}
          <div className="w-full flex flex-col gap-2.5">
            <Input
              label="Gebruikersnaam"
              placeholder="BenCrauwels"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              label="Wachtwoord"
              placeholder="********"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="primary" type="submit" className="w-full mt-4">
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

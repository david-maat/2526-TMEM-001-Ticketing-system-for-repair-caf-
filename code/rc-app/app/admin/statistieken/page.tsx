'use client';

import { useState } from 'react';
import BackButton from '../../components/BackButton';

export default function StatistiekenPage() {
  const [selectedCafeDays, setSelectedCafeDays] = useState([
    'RepairCafé thomas more geel 2025',
    'RepairCafé Mol 2025',
    'RepairCafé thomas more geel 2024'
  ]);

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          Statistieken
        </h1>
        <div className="w-[100px]" />
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-2.5 px-2.5 lg:px-24">
        {/* Statistics Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Pie Chart */}
          <div className="flex flex-col items-center gap-2.5">
            <h2 className="text-white font-open-sans text-2xl font-normal text-center">
              Voorwerpen per Klant Type procentueel
            </h2>
            <div className="flex flex-col lg:flex-row items-center gap-2.5 justify-center">
              <div className="w-[300px] h-[300px] rounded-full bg-gradient-conic from-[#FF6384] via-[#36A2EB] to-[#FFCE56] flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-[#03091C]"></div>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 px-2.5">
                  <div className="w-12 h-12 rounded-full bg-[#FF6384]"></div>
                  <span className="text-white font-inter text-xs leading-[22.523px]">
                    EXTERN (56%)
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5">
                  <div className="w-12 h-12 rounded-full bg-[#36A2EB]"></div>
                  <span className="text-white font-inter text-xs leading-[22.523px]">
                    DOCENT (38%)
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5">
                  <div className="w-12 h-12 rounded-full bg-[#FFCE56]"></div>
                  <span className="text-white font-inter text-xs leading-[22.523px]">
                    STUDENT (6%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex flex-col items-center gap-2.5">
            <h2 className="text-white font-open-sans text-2xl font-normal text-center">
              Totaal aantal voorwerpen per Klant Type
            </h2>
            <div className="flex items-end gap-11 h-[300px] px-[120px] border-b border-l border-white">
              <div className="flex flex-col items-center">
                <div className="h-[264px] w-16 bg-[#FF6384] flex items-start justify-center px-2.5">
                  <span className="text-white font-open-sans text-2xl">160</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-[130px] w-16 bg-[#36A2EB] flex items-start justify-center px-2.5">
                  <span className="text-white font-open-sans text-2xl">58</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-16 bg-[#FFCE56] flex items-start justify-center px-2.5">
                  <span className="text-black font-open-sans text-2xl">10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Items */}
          <div className="flex flex-col items-center gap-2.5">
            <h2 className="text-white font-open-sans text-2xl font-normal">
              Totaal aantal gemaakte voorwerpen
            </h2>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-white font-open-sans text-4xl lg:text-5xl font-normal">
                278
              </span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="flex flex-col items-center gap-2.5">
            <h2 className="text-white font-open-sans text-2xl font-normal">Totale omzet</h2>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-white font-open-sans text-4xl lg:text-5xl font-normal">
                €9999,99
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar - Cafe Day Selection */}
        <div className="flex flex-col gap-2.5 p-2.5 border-t lg:border-t-0 lg:border-l border-white pt-5 lg:pt-0">
          <h2 className="text-white font-open-sans text-2xl font-normal">
            Selecteer cafedagen
          </h2>
          <div className="flex flex-col gap-2.5">
            {selectedCafeDays.map((day, index) => (
              <div key={index} className="flex items-start gap-2.5 px-2.5">
                <div className="flex items-center justify-center w-[15px] h-[15px] border-2 border-white bg-black">
                  <svg
                    className="w-[15px] h-[15px]"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.96874 9.46875L11.2656 4.17188C11.3906 4.04688 11.5364 3.98438 11.7031 3.98438C11.8698 3.98438 12.0156 4.04688 12.1406 4.17188C12.2656 4.29688 12.3281 4.44542 12.3281 4.6175C12.3281 4.78958 12.2656 4.93792 12.1406 5.0625L6.40624 10.8125C6.28124 10.9375 6.13541 11 5.96874 11C5.80207 11 5.65624 10.9375 5.53124 10.8125L2.84374 8.125C2.71874 8 2.65874 7.85167 2.66374 7.68C2.66874 7.50833 2.73395 7.35979 2.85937 7.23438C2.98478 7.10896 3.13332 7.04646 3.30499 7.04687C3.47666 7.04729 3.62499 7.10979 3.74999 7.23438L5.96874 9.46875Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-white font-open-sans text-xs font-normal">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

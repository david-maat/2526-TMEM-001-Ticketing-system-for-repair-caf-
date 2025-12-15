'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from "@deemlol/next-icons";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="cursor-pointer"
      aria-label="Go back"
    >
      <ArrowLeft size={36} color="#FFFFFF" />
    </button>
  );
}

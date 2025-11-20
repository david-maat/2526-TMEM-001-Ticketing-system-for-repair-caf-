'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="cursor-pointer"
      aria-label="Go back"
    >
      <svg
        width="114"
        height="114"
        viewBox="0 0 114 114"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M35.8744 52.9748C33.6478 55.2014 33.6478 58.8173 35.8744 61.0439L64.3744 89.5439C66.601 91.7705 70.2169 91.7705 72.4435 89.5439C74.67 87.3173 74.67 83.7014 72.4435 81.4748L47.9691 57.0005L72.4256 32.5261C74.6522 30.2995 74.6522 26.6836 72.4256 24.457C70.1991 22.2305 66.5831 22.2305 64.3566 24.457L35.8566 52.957L35.8744 52.9748Z"
          fill="#FFF9F9"
        />
      </svg>
    </button>
  );
}

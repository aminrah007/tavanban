/**
 * BrandLogo.tsx
 * Precision geometric vector emblem for TavanBan (توان‌بان)
 * Sistan & Baluchestan Regional Electric Company
 */

import React from 'react';

interface BrandLogoProps {
  isDark?: boolean;
  size?: 'sm' | 'md';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ isDark = true, size = 'md' }) => {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200 ${
        isDark
          ? 'bg-gradient-to-br from-[#06B6D4] via-[#3B82F6] to-[#6366F1] shadow-[0_0_20px_rgba(34,211,238,0.35)] ring-1 ring-white/20'
          : 'bg-gradient-to-br from-[#0284C7] via-[#4F46E5] to-[#7C3AED] shadow-[0_6px_16px_-4px_rgba(79,70,229,0.45)] ring-1 ring-indigo-950/10'
      }`}
    >
      {/* Subtle top glass sheen */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20 pointer-events-none"
      />
      {/* Crisp High-Voltage Grid + Bolt Vector Mark */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
        aria-hidden="true"
      >
        <path
          d="M13.4 2.5L5.2 13.1H11.6L10.3 21.5L18.8 10.6H12.4L13.4 2.5Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <circle cx="19" cy="5.5" r="1.5" fill="#FDE047" />
      </svg>
    </div>
  );
};

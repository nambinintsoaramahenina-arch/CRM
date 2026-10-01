import React from 'react';
import Image from 'next/image';

interface SpatLogoProps {
  collapsed?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const SpatLogo: React.FC<SpatLogoProps> = ({
  collapsed = false,
  variant = 'auto',
  size = 'md',
  className = '',
}) => {
  const heights = {
    sm: 'h-10 w-auto',
    md: 'h-14 sm:h-16 w-auto',
    lg: 'h-20 sm:h-24 w-auto',
  };

  if (collapsed) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white p-1 shadow-sm flex items-center justify-center border border-slate-200">
          <Image
            src="/images/spat-logo.png"
            alt="SPAT Logo"
            width={48}
            height={60}
            className="object-contain h-full w-auto"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className={`relative ${heights[size]} flex items-center justify-center p-1.5 rounded-2xl transition-all ${
          variant === 'dark'
            ? 'bg-white shadow-lg shadow-black/30 ring-1 ring-white/30'
            : 'bg-white shadow-sm ring-1 ring-slate-200'
        }`}
      >
        <Image
          src="/images/spat-logo.png"
          alt="Société du Port à gestion Autonome de Toamasina (SPAT)"
          width={180}
          height={220}
          className="h-full w-auto object-contain max-h-[85px]"
          priority
        />
      </div>
    </div>
  );
};


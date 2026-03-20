'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';

interface RevealButtonProps {
  isRevealed: boolean;
  onReveal: () => Promise<void>;
}

export function RevealButton({ isRevealed, onReveal }: RevealButtonProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isRevealed || isLoading) return;
    setIsLoading(true);
    try {
      await onReveal();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRevealed || isLoading}
      className={`text-[10.5px] px-2 py-1 rounded-md border font-semibold transition-all ${
        isRevealed
          ? 'border-amber-200 bg-amber-50 text-amber-700 cursor-default'
          : 'border-[var(--border)] text-[var(--foreground)]/60 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600'
      }`}
    >
      {isRevealed
        ? `🙈 ${t.secrets?.hide ?? 'Ocultar'}`
        : `👁 ${t.secrets?.show ?? 'Mostrar'}`
      }
    </button>
  );
}

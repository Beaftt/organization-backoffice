'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';

interface CopyButtonProps {
  onCopy: () => Promise<void>;
  size?: 'sm' | 'xs';
}

export function CopyButton({ onCopy, size = 'xs' }: CopyButtonProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (copied || isLoading) return;
    setIsLoading(true);
    try {
      await onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClass = size === 'sm'
    ? 'text-xs px-2.5 py-1.5'
    : 'text-[10.5px] px-2 py-1';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`${sizeClass} rounded-md border font-semibold transition-all ${
        copied
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-[var(--border)] text-[var(--foreground)]/60 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
    >
      {copied ? `✓ ${t.secrets?.copied ?? 'Copiado!'}` : `📋 ${t.secrets?.copy ?? 'Copiar'}`}
    </button>
  );
}

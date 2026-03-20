'use client';

import type { PasswordStrength } from '../types';
import { useLanguage } from '@/lib/i18n/language-context';

const STRENGTH_CONFIG: Record<PasswordStrength, { width: string; color: string; labelKey: string }> = {
  'weak':        { width: 'w-1/4',  color: 'bg-red-500',     labelKey: 'secrets.strength.weak' },
  'medium':      { width: 'w-1/2',  color: 'bg-amber-500',   labelKey: 'secrets.strength.medium' },
  'strong':      { width: 'w-3/4',  color: 'bg-blue-500',    labelKey: 'secrets.strength.strong' },
  'very-strong': { width: 'w-full', color: 'bg-emerald-500', labelKey: 'secrets.strength.veryStrong' },
};

interface PasswordStrengthBarProps {
  strength: PasswordStrength;
}

export function PasswordStrengthBar({ strength }: PasswordStrengthBarProps) {
  const { t } = useLanguage();
  const config = STRENGTH_CONFIG[strength];
  const label = t.secrets?.strength?.[strength === 'very-strong' ? 'veryStrong' : strength] ?? strength;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${config.width} ${config.color}`}
        />
      </div>
      <p className={`text-[10.5px] font-semibold ${
        strength === 'weak' ? 'text-red-500' :
        strength === 'medium' ? 'text-amber-500' :
        strength === 'strong' ? 'text-blue-500' :
        'text-emerald-600'
      }`}>
        {label}
      </p>
    </div>
  );
}

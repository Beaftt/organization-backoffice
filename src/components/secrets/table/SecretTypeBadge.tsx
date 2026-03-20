'use client';

import type { SecretType } from '../types';
import { TYPE_CONFIG } from '../types';
import { useLanguage } from '@/lib/i18n/language-context';

interface SecretTypeBadgeProps {
  type: SecretType;
}

export function SecretTypeBadge({ type }: SecretTypeBadgeProps) {
  const { t } = useLanguage();
  const config = TYPE_CONFIG[type];

  const label = t.secrets?.types?.[type.toLowerCase() as Lowercase<SecretType>] ?? type;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${config.activeBg} ${config.activeText} ${config.activeBorder}`}
    >
      {label}
    </span>
  );
}

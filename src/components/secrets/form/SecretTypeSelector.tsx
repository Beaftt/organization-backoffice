'use client';

import type { SecretType } from '../types';
import { TYPE_CONFIG } from '../types';
import { useLanguage } from '@/lib/i18n/language-context';

interface SecretTypeSelectorProps {
  value: SecretType;
  onChange: (t: SecretType) => void;
}

const TYPES: SecretType[] = ['ACCOUNT', 'SERVER', 'API', 'OTHER'];

export function SecretTypeSelector({ value, onChange }: SecretTypeSelectorProps) {
  const { t } = useLanguage();

  const getLabel = (type: SecretType) =>
    t.secrets?.types?.[type.toLowerCase() as Lowercase<SecretType>] ?? type;

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-[var(--foreground)]/60">
        {t.secrets?.form?.type ?? 'Tipo'}
      </p>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((type) => {
          const config = TYPE_CONFIG[type];
          const isActive = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? `${config.activeBg} ${config.activeText} ${config.activeBorder}`
                  : 'border-[var(--border)] bg-transparent text-[var(--foreground)]/60 hover:border-[var(--border)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              <span className="text-sm">{config.icon}</span>
              {getLabel(type)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

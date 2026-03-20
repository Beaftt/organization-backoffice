'use client';

import type { SecretType } from '../types';
import { FIELD_GROUPS } from '../types';
import { SecretPasswordField } from './SecretPasswordField';
import { useLanguage } from '@/lib/i18n/language-context';

interface SecretFieldGroupProps {
  type: SecretType;
  values: {
    username: string;
    url: string;
    port: string;
    secret: string;
  };
  onChange: (key: 'username' | 'url' | 'port' | 'secret', value: string) => void;
}

export function SecretFieldGroup({ type, values, onChange }: SecretFieldGroupProps) {
  const { t } = useLanguage();
  const fields = FIELD_GROUPS[type];

  // Helper to resolve i18n label from dotted key like 'secrets.form.username'
  const resolveLabel = (labelKey: string): string => {
    const parts = labelKey.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- traversal
    let node: any = t;
    for (const part of parts) {
      node = node?.[part];
    }
    return typeof node === 'string' ? node : labelKey;
  };

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const key = field.key as 'username' | 'url' | 'secret';
        const label = resolveLabel(field.labelKey);
        const placeholder = resolveLabel(field.placeholderKey);
        const value = values[key] ?? '';

        // SERVER type: show url (host/IP) + port as a side-by-side row
        if (type === 'SERVER' && field.key === 'url') {
          return (
            <div key="host-port" className="flex gap-2">
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
                  {label}
                </p>
                <input
                  type="text"
                  value={values.url}
                  onChange={(e) => onChange('url', e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
                />
              </div>
              <div className="w-24">
                <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
                  {t.secrets?.form?.port ?? 'Porta'}
                </p>
                <input
                  type="number"
                  value={values.port}
                  onChange={(e) => onChange('port', e.target.value)}
                  placeholder="22"
                  min="1"
                  max="65535"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
                />
              </div>
            </div>
          );
        }

        if (field.inputType === 'password') {
          return (
            <SecretPasswordField
              key={field.key}
              label={label}
              placeholder={placeholder}
              value={value}
              onChange={(v) => onChange('secret', v)}
              required={field.required}
            />
          );
        }

        return (
          <div key={field.key}>
            <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
              {label}
              {field.required ? <span className="ml-0.5 text-red-500">*</span> : null}
            </p>
            <input
              type={field.inputType}
              value={value}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              required={field.required}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
            />
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { PasswordStrength } from '../types';
import { getPasswordStrength } from '../types';
import { PasswordStrengthBar } from '../shared/PasswordStrengthBar';
import { useLanguage } from '@/lib/i18n/language-context';

interface SecretPasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

export function SecretPasswordField({
  label,
  placeholder,
  value,
  onChange,
  required = false,
}: SecretPasswordFieldProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const strength: PasswordStrength | null = value ? getPasswordStrength(value) : null;

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </p>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete="new-password"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 pr-20 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent text-[10.5px] font-semibold text-[var(--sidebar)]"
        >
          {visible ? (t.secrets?.hide ?? 'Ocultar') : (t.secrets?.show ?? 'Mostrar')}
        </button>
      </div>
      {strength ? <PasswordStrengthBar strength={strength} /> : null}
    </div>
  );
}

import type { SecretSummary, SecretDetails, SecretType } from '@/lib/api/secrets';

export type { SecretSummary, SecretDetails, SecretType };

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

export type SortOption = 'updatedAt' | 'title';
export type SortDirection = 'asc' | 'desc';
export type TypeFilter = 'all' | SecretType;

export type TypeConfig = {
  icon: string;
  bg: string;
  color: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
};

export const TYPE_CONFIG: Record<SecretType, TypeConfig> = {
  ACCOUNT: {
    icon: '@',
    bg: 'bg-blue-500/15',
    color: 'text-blue-600',
    activeBg: 'bg-blue-50',
    activeText: 'text-blue-700',
    activeBorder: 'border-blue-200',
  },
  SERVER: {
    icon: '⚙',
    bg: 'bg-emerald-500/15',
    color: 'text-emerald-600',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    activeBorder: 'border-emerald-200',
  },
  API: {
    icon: '⚡',
    bg: 'bg-amber-500/15',
    color: 'text-amber-600',
    activeBg: 'bg-amber-50',
    activeText: 'text-amber-700',
    activeBorder: 'border-amber-200',
  },
  OTHER: {
    icon: '🔑',
    bg: 'bg-gray-500/15',
    color: 'text-gray-600',
    activeBg: 'bg-gray-100',
    activeText: 'text-gray-700',
    activeBorder: 'border-gray-300',
  },
};

export type FieldDef = {
  key: string;
  labelKey: string;
  placeholderKey: string;
  inputType: 'text' | 'password' | 'url' | 'number';
  required: boolean;
  isSensitive: boolean;
};

// Each type maps to visible fields in the form/view
// Fields map to API keys: title, username (usernameOrKey), url, secret, notes
export const FIELD_GROUPS: Record<SecretType, FieldDef[]> = {
  ACCOUNT: [
    { key: 'username', labelKey: 'secrets.form.username', placeholderKey: 'secrets.form.usernamePlaceholder', inputType: 'text', required: false, isSensitive: false },
    { key: 'url', labelKey: 'secrets.form.url', placeholderKey: 'secrets.form.urlPlaceholder', inputType: 'url', required: false, isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.password', placeholderKey: 'secrets.form.passwordPlaceholder', inputType: 'password', required: true, isSensitive: true },
  ],
  SERVER: [
    { key: 'username', labelKey: 'secrets.form.serverUser', placeholderKey: 'secrets.form.serverUserPlaceholder', inputType: 'text', required: false, isSensitive: false },
    { key: 'url', labelKey: 'secrets.form.host', placeholderKey: 'secrets.form.hostPlaceholder', inputType: 'text', required: false, isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.serverPass', placeholderKey: 'secrets.form.passwordPlaceholder', inputType: 'password', required: true, isSensitive: true },
  ],
  API: [
    { key: 'username', labelKey: 'secrets.form.keyName', placeholderKey: 'secrets.form.keyNamePlaceholder', inputType: 'text', required: false, isSensitive: false },
    { key: 'url', labelKey: 'secrets.form.apiEndpoint', placeholderKey: 'secrets.form.urlPlaceholder', inputType: 'url', required: false, isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.apiKey', placeholderKey: 'secrets.form.passwordPlaceholder', inputType: 'password', required: true, isSensitive: true },
  ],
  OTHER: [
    { key: 'username', labelKey: 'secrets.form.identifier', placeholderKey: 'secrets.form.identifierPlaceholder', inputType: 'text', required: false, isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.secretValue', placeholderKey: 'secrets.form.passwordPlaceholder', inputType: 'password', required: true, isSensitive: true },
  ],
};

// View fields (non-sensitive + sensitive) per type
export const VIEW_FIELD_GROUPS: Record<SecretType, Array<{ key: keyof SecretDetails; labelKey: string; isSensitive: boolean }>> = {
  ACCOUNT: [
    { key: 'username', labelKey: 'secrets.form.username', isSensitive: false },
    { key: 'url', labelKey: 'secrets.form.url', isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.password', isSensitive: true },
    { key: 'notes', labelKey: 'secrets.fieldNotes', isSensitive: false },
  ],
  SERVER: [
    { key: 'username', labelKey: 'secrets.form.serverUser', isSensitive: false },
    { key: 'url', labelKey: 'secrets.form.host', isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.serverPass', isSensitive: true },
    { key: 'notes', labelKey: 'secrets.fieldNotes', isSensitive: false },
  ],
  API: [
    { key: 'username', labelKey: 'secrets.form.keyName', isSensitive: false },
    { key: 'url', labelKey: 'secrets.form.apiEndpoint', isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.apiKey', isSensitive: true },
    { key: 'notes', labelKey: 'secrets.fieldNotes', isSensitive: false },
  ],
  OTHER: [
    { key: 'username', labelKey: 'secrets.form.identifier', isSensitive: false },
    { key: 'secret', labelKey: 'secrets.form.secretValue', isSensitive: true },
    { key: 'notes', labelKey: 'secrets.fieldNotes', isSensitive: false },
  ],
};

export function getPasswordStrength(value: string): PasswordStrength {
  if (!value || value.length < 6) return 'weak';
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (score <= 1) return 'weak';
  if (score <= 2) return 'medium';
  if (score <= 3) return 'strong';
  return 'very-strong';
}

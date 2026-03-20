'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { TypeFilter, SortOption, SortDirection, SecretType } from '../types';

interface SecretsToolbarProps {
  typeFilter: TypeFilter;
  search: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onTypeChange: (t: TypeFilter) => void;
  onSearchChange: (v: string) => void;
  onSortChange: (sort: SortOption, dir: SortDirection) => void;
}

const TYPE_FILTER_OPTIONS: Array<{ value: TypeFilter; labelKey: string }> = [
  { value: 'all',     labelKey: 'secrets.types.all' },
  { value: 'ACCOUNT', labelKey: 'secrets.types.account' },
  { value: 'SERVER',  labelKey: 'secrets.types.server' },
  { value: 'API',     labelKey: 'secrets.types.api' },
  { value: 'OTHER',   labelKey: 'secrets.types.other' },
];

export function SecretsToolbar({
  typeFilter,
  search,
  sortBy,
  sortDirection,
  onTypeChange,
  onSearchChange,
  onSortChange,
}: SecretsToolbarProps) {
  const { t } = useLanguage();

  const getTypeLabel = (value: TypeFilter) => {
    if (value === 'all') return t.secrets?.types?.all ?? 'Todos';
    return t.secrets?.types?.[value.toLowerCase() as Lowercase<SecretType>] ?? value;
  };

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort, dir] = e.target.value.split('_') as [SortOption, SortDirection];
    onSortChange(sort, dir);
  };

  const currentSortValue = `${sortBy}_${sortDirection}`;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-5 py-2.5">
      {/* Type filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {TYPE_FILTER_OPTIONS.map(({ value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTypeChange(value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              typeFilter === value
                ? 'border-[var(--sidebar)] bg-[var(--sidebar)] text-white'
                : 'border-[var(--border)] bg-transparent text-[var(--foreground)]/60 hover:border-[var(--border)] hover:text-[var(--foreground)]'
            }`}
          >
            {getTypeLabel(value)}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <input
        type="text"
        className="w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        placeholder={t.secrets?.searchPlaceholder ?? 'Pesquisar…'}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Sort */}
      <select
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        value={currentSortValue}
        onChange={handleSortSelect}
      >
        <option value="updatedAt_desc">↓ {t.secrets?.sort?.updated ?? 'Atualização'}</option>
        <option value="title_asc">↑ {t.secrets?.sort?.title ?? 'Título'}</option>
        <option value="updatedAt_asc">↑ {t.secrets?.sort?.oldest ?? 'Mais antigo'}</option>
      </select>
    </div>
  );
}

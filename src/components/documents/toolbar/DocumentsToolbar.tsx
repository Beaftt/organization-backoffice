'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Input } from '@/components/ui/Input';
import { ViewToggle } from './ViewToggle';
import type { DocumentType, ViewMode } from '../types';

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  typeFilter: 'all' | DocumentType;
  onTypeChange: (v: 'all' | DocumentType) => void;
  sortBy: 'updatedAt' | 'name';
  onSortChange: (v: 'updatedAt' | 'name') => void;
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
};

export function DocumentsToolbar({
  query,
  onQueryChange,
  typeFilter,
  onTypeChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewChange,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <Input
          placeholder={t.documents.searchPlaceholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label={t.documents.searchLabel}
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]/70">
        {t.documents.typeLabel}
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value as 'all' | DocumentType)}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
          aria-label={t.documents.typeLabel}
        >
          <option value="all">{t.documents.typeAll}</option>
          <option value="PDF">{t.documents.typePdf}</option>
          <option value="IMAGE">{t.documents.typeImage}</option>
          <option value="SPREADSHEET">{t.documents.typeSpreadsheet}</option>
          <option value="OTHER">{t.documents.typeOther}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]/70">
        {t.documents.sortLabel}
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as 'updatedAt' | 'name')
          }
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
          aria-label={t.documents.sortLabel}
        >
          <option value="updatedAt">{t.documents.sortUpdated}</option>
          <option value="name">{t.documents.sortName}</option>
        </select>
      </label>

      <div className="pb-px">
        <ViewToggle value={viewMode} onChange={onViewChange} />
      </div>
    </div>
  );
}

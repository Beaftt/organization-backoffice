'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { ViewMode } from '../types';

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewToggle({ value, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex overflow-hidden rounded-lg border border-[var(--border)]">
      <button
        type="button"
        className={`px-3 py-1.5 text-sm transition ${
          value === 'grid'
            ? 'bg-[var(--sidebar)] text-white'
            : 'text-[var(--foreground)]/60 hover:bg-[var(--surface-muted)]'
        }`}
        onClick={() => onChange('grid')}
        aria-label={t.documents.viewGrid}
        aria-pressed={value === 'grid'}
        title={t.documents.viewGrid}
      >
        ⊞
      </button>
      <button
        type="button"
        className={`px-3 py-1.5 text-sm transition ${
          value === 'list'
            ? 'bg-[var(--sidebar)] text-white'
            : 'text-[var(--foreground)]/60 hover:bg-[var(--surface-muted)]'
        }`}
        onClick={() => onChange('list')}
        aria-label={t.documents.viewList}
        aria-pressed={value === 'list'}
        title={t.documents.viewList}
      >
        ☰
      </button>
    </div>
  );
}

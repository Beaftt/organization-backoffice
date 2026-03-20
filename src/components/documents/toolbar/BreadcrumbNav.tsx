'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { buildFolderBreadcrumb } from '../types';
import type { DocumentFolder } from '../types';

type Props = {
  folderFilter: string;
  folderMap: Record<string, DocumentFolder>;
  onNavigate: (id: string) => void;
};

export function BreadcrumbNav({ folderFilter, folderMap, onNavigate }: Props) {
  const { t } = useLanguage();
  const crumbs =
    folderFilter !== 'all'
      ? buildFolderBreadcrumb(folderFilter, folderMap)
      : [];

  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--foreground)]/55"
      aria-label={t.documents.breadcrumbLabel}
    >
      <button
        type="button"
        className={`transition-colors ${
          crumbs.length === 0
            ? 'cursor-default font-medium text-[var(--foreground)]'
            : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
        }`}
        onClick={() => onNavigate('all')}
        disabled={crumbs.length === 0}
      >
        {t.documents.allFiles}
      </button>
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} className="flex items-center gap-1">
          <span className="text-[var(--foreground)]/30">/</span>
          {i < crumbs.length - 1 ? (
            <button
              type="button"
              className="text-[var(--foreground)]/60 transition-colors hover:text-[var(--foreground)]"
              onClick={() => onNavigate(crumb.id)}
            >
              {crumb.name}
            </button>
          ) : (
            <span className="font-medium text-[var(--foreground)]">
              {crumb.name}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

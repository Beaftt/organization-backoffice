'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import { FileTypeIcon } from './FileTypeIcon';
import { FileTypeBadge } from './FileTypeBadge';
import { FILE_TYPE_STYLE } from '../types';
import type { DocumentSummary } from '../types';

type Props = {
  document: DocumentSummary;
  onViewHistory: (doc: DocumentSummary) => void;
  onRename: (doc: DocumentSummary) => void;
  onMove: (doc: DocumentSummary) => void;
  onMention: (doc: DocumentSummary) => void;
  onLink: (doc: DocumentSummary) => void;
  onDelete: (doc: DocumentSummary) => void;
};

function formatBytes(bytes?: number | string | null): string {
  if (bytes === null || bytes === undefined) return '';
  const numeric = typeof bytes === 'string' ? Number(bytes) : bytes;
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  if (numeric < 1024) return `${numeric} B`;
  if (numeric < 1024 * 1024) return `${(numeric / 1024).toFixed(1)} KB`;
  return `${(numeric / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileCard({
  document: doc,
  onViewHistory,
  onRename,
  onMove,
  onMention,
  onLink,
  onDelete,
}: Props) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const style = FILE_TYPE_STYLE[doc.type];

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!doc.fileUrl) return;
    window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="group relative flex cursor-grab flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:shadow-sm active:cursor-grabbing"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', doc.id)}
    >
      <div className={`relative flex h-24 items-center justify-center ${style.bg}`}>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface)]/90 shadow-sm ${style.text}`}
        >
          <FileTypeIcon type={doc.type} className="h-5 w-5" />
        </div>
        {doc.fileUrl ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--foreground)]/12 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              type="button"
              variant="secondary"
              className="pointer-events-auto rounded-lg px-3 py-1.5 text-[10.5px]"
              onClick={handleDownload}
            >
              ⬇ {t.documents.download}
            </Button>
          </div>
        ) : null}
      </div>
      <div className="relative p-3">
        <div className="relative ml-auto" ref={menuRef}>
          <button
            type="button"
            className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]/45 opacity-60 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] hover:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t.documents.tableActions}
          >
            ⋯
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-8 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]"
                onClick={() => {
                  setMenuOpen(false);
                  onViewHistory(doc);
                }}
              >
                {t.documents.historyAction}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]"
                onClick={() => {
                  setMenuOpen(false);
                  onRename(doc);
                }}
              >
                {t.documents.renameAction}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]"
                onClick={() => {
                  setMenuOpen(false);
                  onMove(doc);
                }}
              >
                {t.documents.moveAction}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]"
                onClick={() => {
                  setMenuOpen(false);
                  onMention(doc);
                }}
              >
                {t.documents.mentionAction}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]"
                onClick={() => {
                  setMenuOpen(false);
                  onLink(doc);
                }}
              >
                {t.documents.linkAction}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-[var(--danger-text)] hover:bg-[var(--danger)]"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(doc);
                }}
              >
                {t.documents.deleteAction}
              </button>
            </div>
          ) : null}
        </div>
        <p
          className="pr-9 text-sm font-medium text-[var(--foreground)]"
          title={doc.name}
        >
          {doc.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <FileTypeBadge type={doc.type} />
          {doc.sizeBytes ? (
            <span className="text-xs text-[var(--foreground)]/40">
              {formatBytes(doc.sizeBytes)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-[var(--foreground)]/40">
          {t.documents.tableUpdated}{' '}
          {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { FileTypeIcon } from './FileTypeIcon';
import { FileTypeBadge } from './FileTypeBadge';
import type { DocumentSummary, DocumentFolder } from '../types';

type Props = {
  document: DocumentSummary;
  folderMap: Record<string, DocumentFolder>;
  onViewHistory: (doc: DocumentSummary) => void;
  onRename: (doc: DocumentSummary) => void;
  onMove: (doc: DocumentSummary) => void;
  onMention: (doc: DocumentSummary) => void;
  onLink: (doc: DocumentSummary) => void;
  onDelete: (doc: DocumentSummary) => void;
};

export function FileListRow({
  document: doc,
  folderMap,
  onViewHistory,
  onRename,
  onMove,
  onMention,
  onLink,
  onDelete,
}: Props) {
  const { t, language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLTableCellElement>(null);
  const folderName = doc.folderId ? (folderMap[doc.folderId]?.name ?? '—') : '—';

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

  return (
    <tr
      className="border-b border-[var(--border)] transition hover:bg-[var(--surface-muted)]"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', doc.id)}
    >
      <td className="py-2.5 pl-3 pr-4">
        <div className="flex items-center gap-3">
          <FileTypeIcon
            type={doc.type}
            className="h-4 w-4 shrink-0 text-[var(--foreground)]/40"
          />
          <span className="max-w-xs truncate text-sm font-medium text-[var(--foreground)]">
            {doc.name}
          </span>
        </div>
      </td>
      <td className="hidden px-4 py-2.5 text-sm text-[var(--foreground)]/60 md:table-cell">
        {folderName}
      </td>
      <td className="hidden px-4 py-2.5 sm:table-cell">
        <FileTypeBadge type={doc.type} />
      </td>
      <td className="hidden px-4 py-2.5 text-sm text-[var(--foreground)]/60 lg:table-cell">
        {new Date(doc.updatedAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
      </td>
      <td className="relative py-2.5 pl-4 pr-3 text-right" ref={menuRef}>
        <button
          type="button"
          className="rounded-full p-1 text-[var(--foreground)]/40 transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="File options"
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
      </td>
    </tr>
  );
}

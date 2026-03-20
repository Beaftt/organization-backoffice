'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import type { DocumentFolder } from '../types';

type Props = {
  folder: DocumentFolder;
  onOpen: (folder: DocumentFolder) => void;
  onRename: (folder: DocumentFolder) => void;
  onMove: (folder: DocumentFolder) => void;
  onDelete: (folder: DocumentFolder) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, folderId: string | null) => void;
};

export function FolderCard({
  folder,
  onOpen,
  onRename,
  onMove,
  onDelete,
  onDrop,
}: Props) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div
      className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border bg-[var(--surface)] p-4 transition hover:shadow-sm ${
        isDragOver
          ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/5'
          : 'border-[var(--border)]'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e, folder.id);
      }}
      onClick={() => onOpen(folder)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(folder);
      }}
      aria-label={folder.name}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">📁</span>
        <div
          className="relative"
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--foreground)]/40 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Folder options"
          >
            ⋯
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-8 z-20 min-w-36 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]"
                onClick={() => {
                  setMenuOpen(false);
                  onRename(folder);
                }}
              >
                {t.documents.renameAction}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]"
                onClick={() => {
                  setMenuOpen(false);
                  onMove(folder);
                }}
              >
                {t.documents.moveAction}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-[var(--danger-text)] hover:bg-[var(--danger)]"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(folder);
                }}
              >
                {t.documents.deleteAction}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div>
        <p className="truncate text-sm font-medium text-[var(--foreground)]">
          {folder.name}
        </p>
        <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
          {folder.totalFiles} {t.documents.filesTitle.toLowerCase()}
        </p>
      </div>
    </div>
  );
}

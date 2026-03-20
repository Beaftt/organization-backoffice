'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { FolderCard } from './FolderCard';
import { FileCard } from './FileCard';
import { FilesEmptyState } from './FilesEmptyState';
import type { DocumentFolder, DocumentSummary } from '../types';

type Props = {
  folders: DocumentFolder[];
  records: DocumentSummary[];
  isLoading: boolean;
  folderFilter: string;
  onFolderOpen: (folder: DocumentFolder) => void;
  onFolderRename: (folder: DocumentFolder) => void;
  onFolderMove: (folder: DocumentFolder) => void;
  onFolderDelete: (folder: DocumentFolder) => void;
  onFolderDrop: (e: React.DragEvent<HTMLDivElement>, folderId: string | null) => void;
  onViewHistory: (doc: DocumentSummary) => void;
  onDocumentRename: (doc: DocumentSummary) => void;
  onDocumentMove: (doc: DocumentSummary) => void;
  onDocumentMention: (doc: DocumentSummary) => void;
  onDocumentLink: (doc: DocumentSummary) => void;
  onDocumentDelete: (doc: DocumentSummary) => void;
  onUpload: () => void;
  onUploadFile: (file: File) => void;
};

export function DocumentsGridView({
  folders,
  records,
  isLoading,
  folderFilter,
  onFolderOpen,
  onFolderRename,
  onFolderMove,
  onFolderDelete,
  onFolderDrop,
  onViewHistory,
  onDocumentRename,
  onDocumentMove,
  onDocumentMention,
  onDocumentLink,
  onDocumentDelete,
  onUpload,
  onUploadFile,
}: Props) {
  const { t } = useLanguage();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const visibleFolders =
    folderFilter === 'all'
      ? folders.filter((f) => !f.parentId)
      : folders.filter((f) => f.parentId === folderFilter);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleFolders.length > 0 ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
            {t.documents.foldersTitle}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={onFolderOpen}
                onRename={onFolderRename}
                onMove={onFolderMove}
                onDelete={onFolderDelete}
                onDrop={onFolderDrop}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        {visibleFolders.length > 0 && records.length > 0 ? (
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
            {t.documents.filesTitle}
          </h3>
        ) : null}
        <div
          className={`mb-4 rounded-xl border border-dashed p-3 text-center transition-all ${
            isDraggingOver
              ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/5'
              : 'border-[var(--border)] hover:border-[var(--sidebar)] hover:bg-[var(--sidebar)]/5'
          }`}
          onClick={onUpload}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              onUploadFile(file);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onUpload();
            }
          }}
        >
          <p className="text-xs text-[var(--foreground)]/50">
            <span aria-hidden="true">☁ </span>
            {t.documents.dragDropHint}{' '}
            <span className="font-semibold text-[var(--sidebar)]">
              {t.documents.clickToUpload}
            </span>
          </p>
        </div>
        {records.length === 0 && visibleFolders.length === 0 ? (
          <FilesEmptyState onUpload={onUpload} />
        ) : records.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--foreground)]/50">
            {t.documents.empty}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {records.map((doc) => (
              <FileCard
                key={doc.id}
                document={doc}
                onViewHistory={onViewHistory}
                onRename={onDocumentRename}
                onMove={onDocumentMove}
                onMention={onDocumentMention}
                onLink={onDocumentLink}
                onDelete={onDocumentDelete}
              />
            ))}
            <button
              type="button"
              className="flex min-h-[130px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] bg-transparent text-[var(--foreground)]/45 transition-colors hover:border-[var(--sidebar)] hover:text-[var(--sidebar)]"
              onClick={onUpload}
            >
              <span className="text-xl leading-none">+</span>
              <span className="text-xs font-medium">{t.documents.uploadAction}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

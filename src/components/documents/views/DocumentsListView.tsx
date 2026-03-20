'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { FileListRow } from './FileListRow';
import { FilesEmptyState } from './FilesEmptyState';
import type { DocumentSummary, DocumentFolder } from '../types';

type Props = {
  records: DocumentSummary[];
  folderMap: Record<string, DocumentFolder>;
  isLoading: boolean;
  onViewHistory: (doc: DocumentSummary) => void;
  onRename: (doc: DocumentSummary) => void;
  onMove: (doc: DocumentSummary) => void;
  onMention: (doc: DocumentSummary) => void;
  onLink: (doc: DocumentSummary) => void;
  onDelete: (doc: DocumentSummary) => void;
  onUpload: () => void;
};

export function DocumentsListView({
  records,
  folderMap,
  isLoading,
  onViewHistory,
  onRename,
  onMove,
  onMention,
  onLink,
  onDelete,
  onUpload,
}: Props) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return <FilesEmptyState onUpload={onUpload} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
            <th className="py-2 pl-3 pr-4">{t.documents.tableFile}</th>
            <th className="hidden px-4 py-2 md:table-cell">
              {t.documents.tableFolder}
            </th>
            <th className="hidden px-4 py-2 sm:table-cell">
              {t.documents.tableType}
            </th>
            <th className="hidden px-4 py-2 lg:table-cell">
              {t.documents.tableUpdated}
            </th>
            <th className="py-2 pl-4 pr-3 text-right">
              {t.documents.tableActions}
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((doc) => (
            <FileListRow
              key={doc.id}
              document={doc}
              folderMap={folderMap}
              onViewHistory={onViewHistory}
              onRename={onRename}
              onMove={onMove}
              onMention={onMention}
              onLink={onLink}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

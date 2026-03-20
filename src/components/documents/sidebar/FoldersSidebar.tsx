'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { FolderTreeItem } from './FolderTreeItem';
import type { DocumentFolder } from '../types';

type Props = {
  folders: DocumentFolder[];
  selectedFolderId: string;
  onSelect: (id: string) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, folderId: string | null) => void;
  isLoading: boolean;
};

export function FoldersSidebar({
  folders,
  selectedFolderId,
  onSelect,
  onDrop,
  isLoading,
}: Props) {
  const { t } = useLanguage();
  const rootFolders = folders.filter((f) => !f.parentId);
  const isAllSelected = selectedFolderId === 'all';

  return (
    <aside
      className="flex h-full w-52 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-[var(--border)] pr-2"
      aria-label="Folders"
    >
      <div
        className={`flex cursor-pointer items-center gap-2 rounded-r-xl border-l-2 py-2.5 pl-3 pr-3 text-sm transition-all ${
          isAllSelected
            ? 'border-l-[var(--sidebar)] bg-[var(--surface)] font-medium text-[var(--foreground)] shadow-sm'
            : 'border-l-transparent hover:bg-[var(--surface-muted)]'
        }`}
        role="button"
        tabIndex={0}
        onClick={() => onSelect('all')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelect('all');
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop(e, null)}
        aria-label={t.documents.allFolders}
        aria-pressed={isAllSelected}
      >
        <span className="text-base">{isAllSelected ? '📂' : '📁'}</span>
        <span className="truncate text-sm font-medium text-[var(--foreground)]">
          {t.documents.allFolders}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-1 px-2 py-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-7 rounded-lg" />
          ))}
        </div>
      ) : (
        rootFolders.map((folder) => (
          <FolderTreeItem
            key={folder.id}
            folder={folder}
            allFolders={folders}
            level={0}
            selectedId={selectedFolderId}
            onSelect={onSelect}
            onDrop={onDrop}
          />
        ))
      )}
    </aside>
  );
}

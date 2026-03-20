'use client';

import { useState } from 'react';
import type { DocumentFolder } from '../types';

type Props = {
  folder: DocumentFolder;
  allFolders: DocumentFolder[];
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, folderId: string | null) => void;
};

export function FolderTreeItem({
  folder,
  allFolders,
  level,
  selectedId,
  onSelect,
  onDrop,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const children = allFolders.filter((f) => f.parentId === folder.id);
  const isActive = selectedId === folder.id;
  const isOpen = isActive || expanded;

  return (
    <div>
      <div
        className={`flex cursor-pointer items-center gap-2 rounded-r-xl border-l-2 py-2.5 pl-3 pr-2 text-sm transition-all ${
          isDragOver
            ? 'border-l-[var(--sidebar)] bg-[var(--sidebar)]/10 ring-1 ring-[var(--sidebar)]/30'
            : isActive
              ? 'border-l-[var(--sidebar)] bg-[var(--surface)] font-medium text-[var(--foreground)] shadow-sm'
              : 'border-l-transparent hover:bg-[var(--surface-muted)]'
        }`}
        style={{ paddingLeft: `${8 + level * 12}px` }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          setIsDragOver(false);
          onDrop(e, folder.id);
        }}
        onClick={() => onSelect(folder.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelect(folder.id);
        }}
        aria-label={folder.name}
        aria-selected={isActive}
      >
        {children.length > 0 ? (
          <button
            type="button"
            className="shrink-0 text-xs text-zinc-400 transition hover:text-[var(--foreground)]"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="shrink-0 text-base">{isOpen ? '📂' : '📁'}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--foreground)]">
          {folder.name}
        </span>
        <span
          className={`shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-semibold ${
            isActive
              ? 'bg-[var(--sidebar)]/20 text-[var(--sidebar)]'
              : 'bg-[var(--surface-muted)] text-[var(--foreground)]/45'
          }`}
        >
          {folder.totalFiles}
        </span>
      </div>
      {expanded && children.length > 0 ? (
        <div>
          {children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onDrop={onDrop}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

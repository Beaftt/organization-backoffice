'use client';

import { useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';

type Props = {
  onFile: (file: File) => void;
  accept?: string;
};

export function FileDropzone({ onFile, accept }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
        isDragOver
          ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/5'
          : 'border-[var(--border)] hover:border-[var(--sidebar)]/50 hover:bg-[var(--surface-muted)]'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
      aria-label="Upload file dropzone"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="flex flex-col items-center gap-2">
        <svg
          className="h-10 w-10 text-[var(--foreground)]/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="17 8 12 3 7 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
        </svg>
        {isDragOver ? (
          <p className="font-medium text-[var(--sidebar)]">
            {t.documents.dropzoneActive}
          </p>
        ) : (
          <>
            <p className="font-medium text-[var(--foreground)]/70">
              {t.documents.dropzoneTitle}
            </p>
            <p className="text-sm text-[var(--foreground)]/40">
              {t.documents.dropzoneSubtitle}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

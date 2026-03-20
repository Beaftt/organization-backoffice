'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import type { DocumentSummary } from '@/lib/api/documents';

interface EventDocumentsSectionProps {
  documentIds: string;
  minutesText: string;
  minutesDocumentIds: string;
  documents: DocumentSummary[];
  isDocumentsLoading: boolean;
  documentsError: string | null;
  parseCsv: (v: string) => string[];
  onToggleDocument: (id: string) => void;
  onMinutesTextChange: (v: string) => void;
  onToggleMinutesDocument: (id: string) => void;
}

export function EventDocumentsSection({
  documentIds,
  minutesText,
  minutesDocumentIds,
  documents,
  isDocumentsLoading,
  documentsError,
  parseCsv,
  onToggleDocument,
  onMinutesTextChange,
  onToggleMinutesDocument,
}: EventDocumentsSectionProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const selectedDocIds = parseCsv(documentIds);
  const selectedMinuteIds = parseCsv(minutesDocumentIds);

  return (
    <div className="border-t border-[var(--border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition"
      >
        <span>{t.calendar.sectionDocuments}</span>
        <span className="text-[var(--foreground)]/30 text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="space-y-4 pb-3">
          {/* Documents picker */}
          <div>
            <p className="mb-2 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.documentsLabel}</p>
            {isDocumentsLoading ? (
              <p className="text-xs text-[var(--foreground)]/40">{t.calendar.documentsLoading}</p>
            ) : documentsError ? (
              <p className="text-xs text-red-500">{documentsError}</p>
            ) : documents.length ? (
              <div className="grid gap-1.5 sm:grid-cols-2">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={() => onToggleDocument(doc.id)}
                      className="accent-[var(--sidebar)]"
                    />
                    <span className="truncate font-medium text-[var(--foreground)]/80">{doc.name}</span>
                    <span className="ml-auto shrink-0 rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] text-[var(--foreground)]/40">
                      {doc.type}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--foreground)]/40">{t.calendar.documentsEmpty}</p>
            )}
          </div>

          {/* Minutes text */}
          <div>
            <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.minutesLabel}</p>
            <textarea
              value={minutesText}
              onChange={(e) => onMinutesTextChange(e.target.value)}
              placeholder={t.calendar.minutesPlaceholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
            />
          </div>

          {/* Minutes documents picker */}
          {documents.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.minutesDocumentsLabel}</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMinuteIds.includes(doc.id)}
                      onChange={() => onToggleMinutesDocument(doc.id)}
                      className="accent-[var(--sidebar)]"
                    />
                    <span className="truncate font-medium text-[var(--foreground)]/80">{doc.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

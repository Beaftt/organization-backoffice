'use client';

import { createPortal } from 'react-dom';
import { useLanguage } from '@/lib/i18n/language-context';
import type { DocumentSummary } from '@/lib/api/documents';
import type { EventFormValues, MemberOption } from '../types';
import { EventForm } from './EventForm';

interface EventDrawerProps {
  open: boolean;
  isEditing: boolean;
  form: EventFormValues;
  onChange: (form: EventFormValues) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
  members: MemberOption[];
  documents: DocumentSummary[];
  isDocumentsLoading: boolean;
  documentsError: string | null;
  onToggleDocument: (id: string) => void;
  onToggleMinutesDocument: (id: string) => void;
  onToggleParticipant: (userId: string) => void;
  parseCsv: (v: string) => string[];
}

export function EventDrawer({
  open,
  isEditing,
  form,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
  members,
  documents,
  isDocumentsLoading,
  documentsError,
  onToggleDocument,
  onToggleMinutesDocument,
  onToggleParticipant,
  parseCsv,
}: EventDrawerProps) {
  const { t } = useLanguage();

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label={t.calendar.closeAction}
      />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-[440px] flex-col bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              {isEditing ? t.calendar.editEvent : t.calendar.formTitle}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--foreground)]/50">{t.calendar.formDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form id="event-form" onSubmit={onSubmit} className="flex-1 overflow-y-auto px-5 py-4">
          <EventForm
            form={form}
            onChange={onChange}
            members={members}
            documents={documents}
            isDocumentsLoading={isDocumentsLoading}
            documentsError={documentsError}
            onToggleDocument={onToggleDocument}
            onToggleMinutesDocument={onToggleMinutesDocument}
            onToggleParticipant={onToggleParticipant}
            parseCsv={parseCsv}
          />
          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex shrink-0 items-center gap-3 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)]"
          >
            {t.calendar.closeAction}
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={isSubmitting}
            className="flex-[2] rounded-xl bg-[var(--sidebar)] py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? t.calendar.creating
              : isEditing
                ? t.calendar.saveEvent
                : t.calendar.createAction}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

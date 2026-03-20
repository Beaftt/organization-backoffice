'use client';

import { createPortal } from 'react-dom';
import type { JobFormValues, JobStatus } from '../types';
import { JobFormFields } from './JobFormFields';

type Props = {
  open: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  form: JobFormValues;
  labels: {
    newJob: string;
    editJob: string;
    newJobSubtitle: string;
    cancel: string;
    save: string;
    add: string;
    delete: string;
    title: string;
    titlePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    type: string;
    salary: string;
    salaryPlaceholder: string;
    status: string;
    source: string;
    sourcePlaceholder: string;
    url: string;
    urlPlaceholder: string;
    appliedAt: string;
    notes: string;
    notesPlaceholder: string;
    typeOptions: Record<string, string>;
    statusOptions: Record<JobStatus, string>;
  };
  onChange: (patch: Partial<JobFormValues>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
};

export function JobDrawer({ open, isEditing, isSaving, isDeleting, form, labels, onChange, onClose, onSave, onDelete }: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/35" aria-label={labels.cancel} onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-[380px] flex-col bg-[var(--surface)] shadow-2xl">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">{isEditing ? labels.editJob : labels.newJob}</h2>
              <p className="mt-1 text-xs text-[var(--foreground)]/50">{isEditing ? form.company || form.title : labels.newJobSubtitle}</p>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <JobFormFields form={form} labels={labels} onChange={onChange} />
        </div>

        <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <div className="flex items-center gap-3">
            {isEditing && onDelete ? (
              <button
                type="button"
                className="rounded-full border border-[var(--danger-border)] bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-[var(--danger-text)] transition hover:bg-[var(--danger-hover)] disabled:opacity-50"
                disabled={isDeleting || isSaving}
                onClick={onDelete}
              >
                {labels.delete}
              </button>
            ) : null}
            <button
              type="button"
              className="flex-1 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]/65 transition hover:bg-[var(--surface-muted)]"
              onClick={onClose}
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              className="flex-[1.3] rounded-full bg-[var(--sidebar)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              disabled={isSaving || !form.title.trim()}
              onClick={onSave}
            >
              {isEditing ? labels.save : labels.add}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
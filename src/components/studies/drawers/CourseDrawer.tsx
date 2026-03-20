'use client';

import { createPortal } from 'react-dom';
import { CourseFormFields } from './CourseFormFields';
import type { CourseFormValues } from '../types';

type Props = {
  open: boolean;
  isEditing: boolean;
  form: CourseFormValues;
  isSaving: boolean;
  labels: {
    newCourse: string;
    editCourse: string;
    cancel: string;
    create: string;
    save: string;
    title: string;
    titlePlaceholder: string;
    institution: string;
    institutionPlaceholder: string;
    lessons: string;
    status: string;
    color: string;
    startDate: string;
    description: string;
    descriptionPlaceholder: string;
    completedLessons: string;
    progressPreview: string;
    hint: string;
    statusActive: string;
    statusPaused: string;
    statusCompleted: string;
  };
  onChange: (patch: Partial<CourseFormValues>) => void;
  onClose: () => void;
  onSave: () => void;
};

export function CourseDrawer({
  open,
  isEditing,
  form,
  isSaving,
  labels,
  onChange,
  onClose,
  onSave,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label={labels.cancel} />
      <div className="relative z-10 flex w-full max-w-[380px] flex-col bg-[var(--surface)] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              {isEditing ? labels.editCourse : labels.newCourse}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--foreground)]/50">{form.title || labels.titlePlaceholder}</p>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CourseFormFields
            form={form}
            isEditing={isEditing}
            labels={{
              title: labels.title,
              titlePlaceholder: labels.titlePlaceholder,
              institution: labels.institution,
              institutionPlaceholder: labels.institutionPlaceholder,
              lessons: labels.lessons,
              status: labels.status,
              color: labels.color,
              startDate: labels.startDate,
              description: labels.description,
              descriptionPlaceholder: labels.descriptionPlaceholder,
              completedLessons: labels.completedLessons,
              progressPreview: labels.progressPreview,
              hint: labels.hint,
              statusActive: labels.statusActive,
              statusPaused: labels.statusPaused,
              statusCompleted: labels.statusCompleted,
            }}
            onChange={onChange}
          />
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            className="flex-1 rounded-xl border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)]"
            onClick={onClose}
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            className="flex-[2] rounded-xl bg-[var(--sidebar)] py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            disabled={isSaving || !form.title.trim()}
            onClick={onSave}
          >
            {isSaving ? labels.save : isEditing ? labels.save : labels.create}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

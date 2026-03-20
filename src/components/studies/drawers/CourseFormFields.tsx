'use client';

import { Input } from '@/components/ui/Input';
import type { CourseFormValues } from '../types';
import { CourseColorPicker } from './CourseColorPicker';
import type { StudyCourse } from '@/lib/api/studies';

type Props = {
  form: CourseFormValues;
  isEditing: boolean;
  labels: {
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
};

export function CourseFormFields({ form, isEditing, labels, onChange }: Props) {
  const totalLessons = Number(form.totalLessons || 0);
  const completedLessons = Math.max(0, Math.min(totalLessons, Number(form.completedLessons || 0)));
  const progressPreview = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <Input
        label={labels.title}
        placeholder={labels.titlePlaceholder}
        value={form.title}
        onChange={(event) => onChange({ title: event.target.value })}
      />
      <Input
        label={labels.institution}
        placeholder={labels.institutionPlaceholder}
        value={form.institution}
        onChange={(event) => onChange({ institution: event.target.value })}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label={labels.lessons}
          type="number"
          min={0}
          value={form.totalLessons}
          onChange={(event) => onChange({ totalLessons: event.target.value })}
        />
        <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
          <span className="font-medium text-[var(--foreground)]/90">{labels.status}</span>
          <select
            value={form.status}
            onChange={(event) => onChange({ status: event.target.value as StudyCourse['status'] })}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
          >
            <option value="ACTIVE">{labels.statusActive}</option>
            <option value="PAUSED">{labels.statusPaused}</option>
            <option value="COMPLETED">{labels.statusCompleted}</option>
          </select>
        </label>
      </div>
      <CourseColorPicker label={labels.color} value={form.color} onChange={(value) => onChange({ color: value })} />
      <Input
        label={labels.startDate}
        type="date"
        value={form.startDate}
        onChange={(event) => onChange({ startDate: event.target.value })}
      />
      <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
        <span className="font-medium text-[var(--foreground)]/90">{labels.description}</span>
        <textarea
          rows={4}
          value={form.description}
          placeholder={labels.descriptionPlaceholder}
          onChange={(event) => onChange({ description: event.target.value })}
          className="resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
        />
      </label>
      <div className="rounded-2xl border border-[var(--sidebar)]/15 bg-[var(--sidebar)]/8 px-3 py-3 text-xs text-[var(--foreground)]/70">
        💡 {labels.hint}
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
          <Input
            label={labels.completedLessons}
            type="number"
            min={0}
            max={totalLessons}
            value={form.completedLessons}
            onChange={(event) => onChange({ completedLessons: event.target.value })}
          />
          <p className="text-[10.5px] text-[var(--foreground)]/50">
            {labels.progressPreview}: {progressPreview}%
          </p>
        </div>
      ) : null}
    </div>
  );
}

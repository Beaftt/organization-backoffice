'use client';

import { Input } from '@/components/ui/Input';
import type { JobFormValues, JobStatus } from '../types';

type Props = {
  form: JobFormValues;
  labels: {
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
};

export function JobFormFields({ form, labels, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Input label={labels.title} placeholder={labels.titlePlaceholder} value={form.title} onChange={(event) => onChange({ title: event.target.value })} />
      <Input label={labels.company} placeholder={labels.companyPlaceholder} value={form.company} onChange={(event) => onChange({ company: event.target.value })} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label={labels.location} placeholder={labels.locationPlaceholder} value={form.location} onChange={(event) => onChange({ location: event.target.value })} />
        <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
          <span className="font-medium text-[var(--foreground)]/90">{labels.type}</span>
          <select
            value={form.type}
            onChange={(event) => onChange({ type: event.target.value as JobFormValues['type'] })}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
          >
            {Object.entries(labels.typeOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label={labels.salary} placeholder={labels.salaryPlaceholder} value={form.salary} onChange={(event) => onChange({ salary: event.target.value })} />
        <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
          <span className="font-medium text-[var(--foreground)]/90">{labels.status}</span>
          <select
            value={form.status}
            onChange={(event) => onChange({ status: event.target.value as JobStatus })}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
          >
            {Object.entries(labels.statusOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Input label={labels.source} placeholder={labels.sourcePlaceholder} value={form.source} onChange={(event) => onChange({ source: event.target.value })} />
      <Input label={labels.url} type="url" placeholder={labels.urlPlaceholder} value={form.url} onChange={(event) => onChange({ url: event.target.value })} />
      <Input label={labels.appliedAt} type="date" value={form.appliedAt} onChange={(event) => onChange({ appliedAt: event.target.value })} />

      <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
        <span className="font-medium text-[var(--foreground)]/90">{labels.notes}</span>
        <textarea
          rows={4}
          value={form.notes}
          placeholder={labels.notesPlaceholder}
          onChange={(event) => onChange({ notes: event.target.value })}
          className="resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
        />
      </label>
    </div>
  );
}
'use client';

import { Button } from '@/components/ui/Button';
import { JobStatusBadge } from './JobStatusBadge';
import { formatJobDate, type JobRecord, type JobStatus } from '../types';

type Props = {
  job: JobRecord;
  locale: string;
  labels: {
    statuses: Record<JobStatus, string>;
    edit: string;
    delete: string;
    view: string;
    types: Record<string, string>;
  };
  onEdit: (jobId: string) => void;
  onDelete: (jobId: string) => void;
};

export function JobListRow({ job, locale, labels, onEdit, onDelete }: Props) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground)]/45">{job.company || '—'}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{job.title}</p>
        <p className="mt-1 text-xs text-[var(--foreground)]/50">
          {[job.location, job.type ? labels.types[job.type] : null, job.salary].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--foreground)]/50">
        <JobStatusBadge status={job.status} label={labels.statuses[job.status]} />
        <span>{job.appliedAt ? formatJobDate(job.appliedAt, locale) : job.source || '—'}</span>
        {job.url ? (
          <a href={job.url} target="_blank" rel="noreferrer" className="font-semibold text-[var(--sidebar)] hover:underline">
            {labels.view}
          </a>
        ) : null}
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <Button variant="ghost" className="px-3 py-2 text-xs" onClick={() => onEdit(job.id)}>
          {labels.edit}
        </Button>
        <Button variant="danger" className="px-3 py-2 text-xs" onClick={() => onDelete(job.id)}>
          {labels.delete}
        </Button>
      </div>
    </div>
  );
}
'use client';

import { formatJobDate, type JobRecord } from '../types';

type Props = {
  job: JobRecord;
  locale: string;
  typeLabel?: string;
  viewLabel: string;
  onClick: () => void;
};

export function JobCard({ job, locale, typeLabel, viewLabel, onClick }: Props) {
  const footerValue = job.appliedAt ? formatJobDate(job.appliedAt, locale) : (job.source ?? '');
  const metaParts = [job.location].filter(Boolean);

  return (
    <div
      className="group cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-[border-color,transform] hover:border-[var(--sidebar)]/70 hover:-translate-y-0.5"
      draggable
      onDragStart={(event) => event.dataTransfer.setData('jobId', job.id)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <p className="mb-1 truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground)]/45">
        {job.company || '—'}
      </p>
      <p className="mb-2 truncate text-[13px] font-semibold text-[var(--foreground)]">{job.title}</p>

      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--foreground)]/50">
        {metaParts.map((part) => (
          <span key={part}>{part}</span>
        ))}
      </div>

      {job.type || job.salary ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {typeLabel ? <span className="capitalize text-[var(--foreground)]/50">{typeLabel}</span> : null}
          {typeLabel && job.salary ? <span className="text-[var(--foreground)]/35">·</span> : null}
          {job.salary ? <span className="font-semibold text-emerald-700 dark:text-emerald-300">{job.salary}</span> : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 text-[10px] text-[var(--foreground)]/50">
        <span className="truncate">{footerValue || '—'}</span>
        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--sidebar)] hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {viewLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
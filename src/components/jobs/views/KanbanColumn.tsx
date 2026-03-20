'use client';

import { useState } from 'react';
import { JobCard } from './JobCard';
import { JOB_STATUS_CONFIG, type JobRecord, type JobStatus } from '../types';

type Props = {
  status: JobStatus;
  title: string;
  jobs: JobRecord[];
  locale: string;
  viewLabel: string;
  emptyCta: string;
  typeLabels: Record<string, string>;
  onAdd: (status: JobStatus) => void;
  onSelect: (jobId: string) => void;
  onDropJob: (jobId: string, status: JobStatus) => void;
};

export function KanbanColumn({ status, title, jobs, locale, viewLabel, emptyCta, typeLabels, onAdd, onSelect, onDropJob }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`min-w-[220px] rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/35 p-3 transition ${
        isDragOver ? 'ring-2 ring-[var(--sidebar)] ring-offset-2 ring-offset-[var(--background)]' : ''
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        const jobId = event.dataTransfer.getData('jobId');
        if (jobId) {
          onDropJob(jobId, status);
        }
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: JOB_STATUS_CONFIG[status].dot }} />
          <span className="text-xs font-bold text-[var(--foreground)]/70">{title}</span>
        </div>
        <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--foreground)]/50">
          {jobs.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            locale={locale}
            viewLabel={viewLabel}
            typeLabel={job.type ? typeLabels[job.type] : undefined}
            onClick={() => onSelect(job.id)}
          />
        ))}

        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-[var(--border)] bg-transparent px-3 py-3 text-xs font-medium text-[var(--foreground)]/50 transition hover:border-[var(--sidebar)] hover:text-[var(--sidebar)]"
          onClick={() => onAdd(status)}
        >
          {emptyCta}
        </button>
      </div>
    </div>
  );
}
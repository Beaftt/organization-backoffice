'use client';

import { JOB_STATUSES, JOB_STATUS_CONFIG, type JobStatus } from '../types';

type Props = {
  counts: Record<JobStatus, number>;
  labels: Record<JobStatus, string>;
};

export function JobsStatsRow({ counts, labels }: Props) {
  return (
    <div className="grid gap-1.5 md:gap-2.5" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
      {JOB_STATUSES.map((status) => (
        <div key={status} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/75 px-1.5 py-2.5 text-center md:p-3">
          <p className={`text-lg font-extrabold leading-none ${JOB_STATUS_CONFIG[status].text}`}>{counts[status] ?? 0}</p>
          <p className="mt-1 text-[9.5px] font-medium text-[var(--foreground)]/50">{labels[status]}</p>
        </div>
      ))}
    </div>
  );
}
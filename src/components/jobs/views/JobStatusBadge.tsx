'use client';

import { JOB_STATUS_CONFIG, type JobStatus } from '../types';

type Props = {
  status: JobStatus;
  label: string;
};

export function JobStatusBadge({ status, label }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${JOB_STATUS_CONFIG[status].bg} ${JOB_STATUS_CONFIG[status].text}`}>
      {label}
    </span>
  );
}
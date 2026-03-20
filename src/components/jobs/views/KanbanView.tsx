'use client';

import { JOB_STATUSES, type JobRecord, type JobStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { JobsEmptyState } from './JobsEmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

type Props = {
  isLoading: boolean;
  locale: string;
  jobsByStatus: Record<JobStatus, JobRecord[]>;
  labels: {
    statuses: Record<JobStatus, string>;
    types: Record<string, string>;
    view: string;
    add: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyCta: string;
  };
  onAdd: (status: JobStatus) => void;
  onCreate: () => void;
  onSelect: (jobId: string) => void;
  onDropJob: (jobId: string, status: JobStatus) => void;
};

export function KanbanView({ isLoading, locale, jobsByStatus, labels, onAdd, onCreate, onSelect, onDropJob }: Props) {
  const hasJobs = JOB_STATUSES.some((status) => jobsByStatus[status].length > 0);

  if (isLoading) {
    return (
      <div className="grid gap-3 lg:grid-cols-5">
        {JOB_STATUSES.map((status) => (
          <div key={status} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/35 p-3">
            <Skeleton className="mb-3 h-5 w-24" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!hasJobs) {
    return <JobsEmptyState title={labels.emptyTitle} subtitle={labels.emptySubtitle} cta={labels.emptyCta} onCreate={onCreate} />;
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {JOB_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            title={labels.statuses[status]}
            jobs={jobsByStatus[status]}
            locale={locale}
            viewLabel={labels.view}
            emptyCta={labels.add}
            typeLabels={labels.types}
            onAdd={onAdd}
            onSelect={onSelect}
            onDropJob={onDropJob}
          />
        ))}
      </div>
    </div>
  );
}
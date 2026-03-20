'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { JobListRow } from './JobListRow';
import { JobsEmptyState } from './JobsEmptyState';
import type { JobRecord, JobStatus } from '../types';

type Props = {
  jobs: JobRecord[];
  locale: string;
  isLoading: boolean;
  labels: {
    statuses: Record<JobStatus, string>;
    edit: string;
    delete: string;
    view: string;
    types: Record<string, string>;
    emptyTitle: string;
    emptySubtitle: string;
    emptyCta: string;
  };
  onCreate: () => void;
  onEdit: (jobId: string) => void;
  onDelete: (jobId: string) => void;
};

export function JobsListView({ jobs, locale, isLoading, labels, onCreate, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return <JobsEmptyState title={labels.emptyTitle} subtitle={labels.emptySubtitle} cta={labels.emptyCta} onCreate={onCreate} />;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobListRow key={job.id} job={job} locale={locale} labels={labels} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
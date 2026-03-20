'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { JobsStatsRow } from './JobsStatsRow';
import type { JobStatus, ViewMode } from '../types';

type Props = {
  title: string;
  subtitle: string;
  search: string;
  searchPlaceholder: string;
  viewMode: ViewMode;
  counts: Record<JobStatus, number>;
  labels: {
    resume: string;
    addJob: string;
    kanban: string;
    list: string;
    stats: Record<JobStatus, string>;
  };
  onSearchChange: (value: string) => void;
  onOpenResume: () => void;
  onOpenJob: () => void;
  onViewModeChange: (value: ViewMode) => void;
};

export function JobsHeader({
  title,
  subtitle,
  search,
  searchPlaceholder,
  viewMode,
  counts,
  labels,
  onSearchChange,
  onOpenResume,
  onOpenJob,
  onViewModeChange,
}: Props) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/30 px-4 py-4 md:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-base font-bold text-[var(--foreground)]">{title}</h1>
          <p className="mt-0.5 text-xs text-[var(--foreground)]/55">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
          <Input
            className="w-full md:w-52"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
              <button
                type="button"
                aria-pressed={viewMode === 'kanban'}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'kanban'
                    ? 'bg-[var(--sidebar)] text-white'
                    : 'text-[var(--foreground)]/55 hover:bg-[var(--surface-muted)]'
                }`}
                onClick={() => onViewModeChange('kanban')}
              >
                {labels.kanban}
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'list'}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-[var(--sidebar)] text-white'
                    : 'text-[var(--foreground)]/55 hover:bg-[var(--surface-muted)]'
                }`}
                onClick={() => onViewModeChange('list')}
              >
                {labels.list}
              </button>
            </div>
            <Button variant="secondary" onClick={onOpenResume}>
              {labels.resume}
            </Button>
            <Button onClick={onOpenJob}>{labels.addJob}</Button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <JobsStatsRow counts={counts} labels={labels.stats} />
      </div>
    </div>
  );
}
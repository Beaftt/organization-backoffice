'use client';

import { Input } from '@/components/ui/Input';
import type { StudyStats } from '../types';

type Props = {
  title: string;
  subtitle: string;
  search: string;
  searchPlaceholder: string;
  stats: StudyStats;
  labels: {
    active: string;
    avgProgress: string;
    total: string;
    completed: string;
    newCourse: string;
  };
  onSearchChange: (value: string) => void;
  onNewCourse: () => void;
};

export function StudiesHeader({
  title,
  subtitle,
  search,
  searchPlaceholder,
  stats,
  labels,
  onSearchChange,
  onNewCourse,
}: Props) {
  const statCards = [
    { value: stats.activeCourses, label: labels.active, color: 'text-[var(--sidebar)]' },
    { value: `${stats.averageProgress}%`, label: labels.avgProgress, color: 'text-[var(--foreground)]' },
    { value: stats.totalCourses, label: labels.total, color: 'text-[var(--foreground)]' },
    { value: stats.completedCourses, label: labels.completed, color: 'text-[var(--income)]' },
  ];

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-base font-bold text-[var(--foreground)]">{title}</h1>
          <p className="mt-0.5 text-xs text-[var(--foreground)]/60">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full sm:w-52"
            aria-label={searchPlaceholder}
          />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[var(--sidebar)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            onClick={onNewCourse}
          >
            + {labels.newCourse}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-center"
          >
            <p className={`text-lg font-extrabold leading-none ${item.color}`}>{item.value}</p>
            <p className="mt-1.5 text-[10px] text-[var(--foreground)]/50">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

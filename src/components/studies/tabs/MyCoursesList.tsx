'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { CourseCard } from './CourseCard';
import { CoursesEmptyState } from './CoursesEmptyState';
import type { StudyCourseCard } from '../types';

type Props = {
  courses: StudyCourseCard[];
  isLoading: boolean;
  labels: {
    lessons: string;
    progress: string;
    edit: string;
    delete: string;
    newCourse: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyCta: string;
  };
  onCreate: () => void;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
};

export function MyCoursesList({
  courses,
  isLoading,
  labels,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[220px]" />
        ))}
      </div>
    );
  }

  if (!courses.length) {
    return (
      <CoursesEmptyState
        title={labels.emptyTitle}
        subtitle={labels.emptySubtitle}
        cta={labels.emptyCta}
        onCreate={onCreate}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          lessonsLabel={labels.lessons}
          progressLabel={labels.progress}
          editLabel={labels.edit}
          deleteLabel={labels.delete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <button
        type="button"
        className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-transparent text-[var(--foreground)]/45 transition-colors hover:border-[var(--sidebar)] hover:text-[var(--sidebar)]"
        onClick={onCreate}
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-xs font-medium">{labels.newCourse}</span>
      </button>
    </div>
  );
}

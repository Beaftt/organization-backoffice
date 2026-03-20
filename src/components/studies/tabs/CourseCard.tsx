'use client';

import { CourseProgressBar } from './CourseProgressBar';
import { CourseStatusBadge } from './CourseStatusBadge';
import type { StudyCourseCard } from '../types';

type Props = {
  course: StudyCourseCard;
  lessonsLabel: string;
  progressLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
};

export function CourseCard({
  course,
  lessonsLabel,
  progressLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-[border-color,box-shadow] hover:border-[var(--sidebar)]/70 hover:shadow-sm"
      onClick={() => onEdit(course.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onEdit(course.id);
        }
      }}
    >
      <div
        className="flex h-20 items-center justify-center border-b border-[var(--border)] text-3xl dark:opacity-80"
        style={{ backgroundColor: course.color }}
      >
        <span aria-hidden="true">📚</span>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{course.title}</p>
        <p className="mb-3 mt-0.5 text-xs text-[var(--foreground)]/50">
          {course.totalLessons} {lessonsLabel}
          {course.provider ? ` · ${course.provider}` : ''}
        </p>
        <CourseProgressBar
          progress={course.progress}
          completed={course.status === 'COMPLETED'}
          label={progressLabel}
        />
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
        <CourseStatusBadge status={course.status} />
        <div className="flex gap-2 opacity-60 transition-opacity duration-100 hover:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            className="bg-transparent text-[11px] font-semibold text-[var(--sidebar)] transition hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(course.id);
            }}
          >
            {editLabel}
          </button>
          <button
            type="button"
            className="bg-transparent text-[11px] font-semibold text-[var(--foreground)]/45 transition hover:text-[var(--danger-text)]"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(course.id);
            }}
          >
            {deleteLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

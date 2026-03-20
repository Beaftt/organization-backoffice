import type { StudyCourse } from '@/lib/api/studies';
import type { UserProfile } from '@/lib/api/user-profile';

export type StudyTab = 'all' | 'active' | 'paused' | 'completed';

export type StudyCourseUiMeta = {
  color?: string;
  description?: string;
};

export type StudyCourseCard = StudyCourse & {
  color: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
};

export type StudyStats = {
  activeCourses: number;
  averageProgress: number;
  totalCourses: number;
  completedCourses: number;
};

export type StudyProfileView = {
  name: string;
  level: string;
  xp: number;
  xpForNextLevel: number;
  avatarInitials: string;
  photoUrl: string | null;
};

export type CourseFormValues = {
  title: string;
  institution: string;
  totalLessons: string;
  status: StudyCourse['status'];
  color: string;
  startDate: string;
  description: string;
  completedLessons: string;
};

export type MiniCalendarState = {
  monthLabel: string;
  slots: Array<number | null>;
  today: number;
};

export const COURSE_COLORS = [
  { value: '#fef9e7', border: '#e5d58f' },
  { value: '#ecfdf5', border: '#a7f3d0' },
  { value: '#eef0ff', border: '#c7caff' },
  { value: '#fdf4ff', border: '#ddd6fe' },
  { value: '#fff7ed', border: '#fed7aa' },
  { value: '#fef2f2', border: '#fca5a5' },
] as const;

export const COURSE_STATUS_CONFIG: Record<StudyCourse['status'], { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300' },
  PAUSED: { bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-300' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getProfileName(profile: UserProfile | null, fallback: string): string {
  const value = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  return value || fallback;
}

export function getDefaultCourseColor(courseId: string): string {
  const total = courseId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COURSE_COLORS[total % COURSE_COLORS.length].value;
}

export function toStudyCourseCard(course: StudyCourse, meta?: StudyCourseUiMeta): StudyCourseCard {
  const totalLessons = course.lessonCount ?? 0;
  const completedLessons = totalLessons > 0
    ? Math.min(totalLessons, Math.round((course.progress / 100) * totalLessons))
    : 0;

  return {
    ...course,
    color: meta?.color ?? getDefaultCourseColor(course.id),
    description: meta?.description ?? '',
    totalLessons,
    completedLessons,
  };
}

export function getStudyStats(courses: StudyCourse[]): StudyStats {
  const totalCourses = courses.length;
  const activeCourses = courses.filter((course) => course.status === 'ACTIVE').length;
  const completedCourses = courses.filter((course) => course.status === 'COMPLETED').length;
  const averageProgress = totalCourses
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses)
    : 0;

  return { activeCourses, averageProgress, totalCourses, completedCourses };
}

export function buildMiniCalendar(locale: string): MiniCalendarState {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const slots: Array<number | null> = [];

  for (let index = 0; index < firstDay; index += 1) {
    slots.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    slots.push(day);
  }

  return {
    monthLabel: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
      new Date(year, month, 1),
    ),
    slots,
    today: now.getDate(),
  };
}

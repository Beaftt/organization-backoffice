import type { CalendarEvent, CalendarRecurrence, CalendarShare } from '@/lib/api/calendar';

export type { CalendarEvent, CalendarRecurrence, CalendarShare };

export type MemberOption = {
  userId: string;
  label: string;
  photoUrl?: string | null;
};

export type EventFormValues = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  tags: string;
  participantIds: string[];
  documentIds: string;
  minutesText: string;
  minutesDocumentIds: string;
  recurrenceEnabled: boolean;
  recurrenceFrequency: CalendarRecurrence['frequency'] | 'SEMIANNUAL';
  recurrenceInterval: string;
  recurrenceWeekdays: number[];
  recurrenceMonthDays: number[];
  recurrenceUntil: string;
  documentOnly: boolean;
};

export type ViewMode = 'day' | 'week' | 'month' | 'year';

export type CalendarCellDate = {
  date: Date;
  dayNumber: number;
  dateKey: string;
  isCurrentMonth: boolean;
};

const EVENT_COLORS = [
  { bg: 'bg-blue-500/15',    text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-amber-500/15',   text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-purple-500/15',  text: 'text-purple-700 dark:text-purple-300' },
  { bg: 'bg-rose-500/15',    text: 'text-rose-700 dark:text-rose-300' },
];

export function getEventColor(id: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

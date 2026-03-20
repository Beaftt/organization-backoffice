import type { ReminderList, ReminderItem, ReminderListRecurrence } from '@/lib/api/reminders';

export type { ReminderList, ReminderItem };

export type MemberOption = {
  userId: string;
  label: string;
  photoUrl?: string | null;
};

export type ListForm = {
  title: string;
  description: string;
  monthlyReset: boolean;
  resetDay: number;
  linkFinance: boolean;
  linkCalendar: boolean;
  isPrivate: boolean;
  allowedUserIds: string[];
  color: string;
};

export const LIST_COLORS = [
  '#4347c0',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
];

export const DEFAULT_LIST_FORM: ListForm = {
  title: '',
  description: '',
  monthlyReset: false,
  resetDay: 1,
  linkFinance: false,
  linkCalendar: false,
  isPrivate: false,
  allowedUserIds: [],
  color: LIST_COLORS[0],
};

export function getListColor(listId: string, colorMap: Record<string, string>): string {
  if (colorMap[listId]) return colorMap[listId];
  const hash = [...listId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return LIST_COLORS[hash % LIST_COLORS.length];
}

export function toRecurrence(monthlyReset: boolean): ReminderListRecurrence {
  return monthlyReset ? 'MONTHLY' : 'NONE';
}

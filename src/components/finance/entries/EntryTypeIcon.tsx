'use client';

type Group = 'INCOME' | 'EXPENSE';

const GROUP_STYLES: Record<Group, string> = {
  INCOME: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  EXPENSE: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

interface EntryTypeIconProps {
  title: string;
  group: Group;
}

export function EntryTypeIcon({ title, group }: EntryTypeIconProps) {
  const initial = title.trim()[0]?.toUpperCase() ?? '?';
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${GROUP_STYLES[group]}`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

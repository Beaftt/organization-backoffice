export type ModuleConfig = {
  slug: string;
  iconLabel: string;
  iconBgClass: string;
  iconTextClass: string;
};

export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  reminders: {
    slug: 'reminders',
    iconLabel: 'R',
    iconBgClass: 'bg-blue-500/15',
    iconTextClass: 'text-blue-500',
  },
  calendar: {
    slug: 'calendar',
    iconLabel: 'C',
    iconBgClass: 'bg-emerald-500/15',
    iconTextClass: 'text-emerald-500',
  },
  documents: {
    slug: 'documents',
    iconLabel: 'D',
    iconBgClass: 'bg-orange-500/15',
    iconTextClass: 'text-orange-500',
  },
  finance: {
    slug: 'finance',
    iconLabel: 'F',
    iconBgClass: 'bg-green-500/15',
    iconTextClass: 'text-green-500',
  },
  secrets: {
    slug: 'secrets',
    iconLabel: 'S',
    iconBgClass: 'bg-purple-500/15',
    iconTextClass: 'text-purple-500',
  },
  studies: {
    slug: 'studies',
    iconLabel: 'E',
    iconBgClass: 'bg-amber-500/15',
    iconTextClass: 'text-amber-500',
  },
  jobs: {
    slug: 'jobs',
    iconLabel: 'J',
    iconBgClass: 'bg-teal-500/15',
    iconTextClass: 'text-teal-500',
  },
  inventory: {
    slug: 'inventory',
    iconLabel: 'I',
    iconBgClass: 'bg-cyan-500/15',
    iconTextClass: 'text-cyan-500',
  },
  hr: {
    slug: 'hr',
    iconLabel: 'H',
    iconBgClass: 'bg-rose-500/15',
    iconTextClass: 'text-rose-500',
  },
  chat: {
    slug: 'chat',
    iconLabel: '✦',
    iconBgClass: 'bg-indigo-500/15',
    iconTextClass: 'text-indigo-500',
  },
};

export const FALLBACK_MODULE_CONFIG: ModuleConfig = {
  slug: 'unknown',
  iconLabel: '?',
  iconBgClass: 'bg-[var(--surface-muted)]',
  iconTextClass: 'text-[var(--foreground)]/40',
};

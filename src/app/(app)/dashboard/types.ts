import type { DocumentSummary } from '@/lib/api/documents';

export type DashboardExpenseCategory = {
  id: string;
  name: string;
  amount: number;
  /** Percentage relative to total expenses (0–100). */
  percentage: number;
};

export type DashboardFinanceSummary = {
  income: number;
  expenses: number;
  netResult: number;
  previousMonthResult: number;
  /** (income - expenses) / income * 100. */
  savingsRate: number;
  topCategories: DashboardExpenseCategory[];
};

export type ModuleBadgeVariant = 'default' | 'success' | 'warning' | 'danger';

export type ModuleContextData = {
  /** Badge label text, or null when not applicable. */
  badge: string | null;
  badgeVariant: ModuleBadgeVariant;
  /** Dynamic description sentence rendered in the card body. */
  description: string;
  /** Footer sub-label on the left. */
  subtitle: string;
};

export type DashboardModule = {
  key: string;
  label: string;
  href?: string;
  contextData: ModuleContextData;
};

export type UpcomingEventType = 'calendar' | 'reminder' | 'finance' | 'study';

export type UpcomingEvent = {
  id: string;
  title: string;
  /** Formatted time string, e.g. "14:00" or "All day". */
  time: string;
  type: UpcomingEventType;
  moduleSlug: string;
};

export type DashboardStats = {
  listCount: number;
  secretCount: number;
  recentDocument: DocumentSummary | null;
  previousMonthResult: number;
};

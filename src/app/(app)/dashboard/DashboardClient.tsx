'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { listDocuments, type DocumentSummary } from '@/lib/api/documents';
import {
  listFinanceCategories,
  listFinanceTransactions,
  type FinanceCategory,
  type FinanceTransaction,
} from '@/lib/api/finance';
import { listCalendarEvents, type CalendarEvent } from '@/lib/api/calendar';
import { listReminderLists } from '@/lib/api/reminders';
import { listSecrets } from '@/lib/api/secrets';
import { DashboardGreeting } from './_components/blocks/DashboardGreeting';
import { DashboardFinanceBlock } from './_components/blocks/DashboardFinanceBlock';
import { DashboardStatsRow } from './_components/blocks/DashboardStatsRow';
import { DashboardCategoriesPanel } from './_components/blocks/DashboardCategoriesPanel';
import { DashboardEventsPanel } from './_components/blocks/DashboardEventsPanel';
import { DashboardModulesGrid } from './_components/blocks/DashboardModulesGrid';
import type {
  DashboardFinanceSummary,
  DashboardModule,
  DashboardStats,
  ModuleContextData,
  UpcomingEvent,
} from './types';

export default function DashboardClient() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [remindersTotal, setRemindersTotal] = useState(0);
  const [secretsTotal, setSecretsTotal] = useState(0);
  const [documentsRecent, setDocumentsRecent] = useState<DocumentSummary[]>([]);
  const [financeSummary, setFinanceSummary] = useState({ income: 0, expense: 0 });
  const [prevFinanceSummary, setPrevFinanceSummary] = useState({ income: 0, expense: 0 });
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const formatValue = useCallback(
    (value: number) =>
      new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
        style: 'currency',
        currency: language === 'pt' ? 'BRL' : 'USD',
        maximumFractionDigits: 2,
      }).format(value),
    [language],
  );

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const startOfPrevMonth = new Date(startOfMonth);
    startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);
    const endOfPrevMonth = new Date(startOfMonth);
    endOfPrevMonth.setSeconds(endOfPrevMonth.getSeconds() - 1);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [
      remindersResult,
      secretsResult,
      documentsResult,
      financeResult,
      prevFinanceResult,
      categoriesResult,
      calendarResult,
    ] = await Promise.allSettled([
      listReminderLists({ pageSize: 1 }),
      listSecrets({ pageSize: 1 }),
      listDocuments({ pageSize: 3, orderBy: 'updatedAt', orderDirection: 'desc' }),
      listFinanceTransactions({
        from: startOfMonth.toISOString(),
        to: endOfMonth.toISOString(),
      }),
      listFinanceTransactions({
        from: startOfPrevMonth.toISOString(),
        to: endOfPrevMonth.toISOString(),
      }),
      listFinanceCategories(),
      listCalendarEvents({
        from: todayStart.toISOString(),
        to: todayEnd.toISOString(),
      }),
    ]);

    if (remindersResult.status === 'fulfilled') {
      const reminders = remindersResult.value;
      setRemindersTotal(reminders.total ?? reminders.items.length);
    } else {
      setRemindersTotal(0);
    }

    if (secretsResult.status === 'fulfilled') {
      const secrets = secretsResult.value;
      setSecretsTotal(secrets.total ?? secrets.items.length);
    } else {
      setSecretsTotal(0);
    }

    if (documentsResult.status === 'fulfilled') {
      const documents = documentsResult.value;
      setDocumentsRecent(documents.items ?? []);
    } else {
      setDocumentsRecent([]);
    }

    if (financeResult.status === 'fulfilled') {
      const items = financeResult.value;
      const income = items
        .filter((item) => item.group === 'INCOME')
        .reduce((acc, item) => acc + item.amount, 0);
      const expense = items
        .filter((item) => item.group === 'EXPENSE')
        .reduce((acc, item) => acc + item.amount, 0);
      setFinanceSummary({ income, expense });
      setFinanceTransactions(items);
    } else {
      setFinanceSummary({ income: 0, expense: 0 });
      setFinanceTransactions([]);
    }

    if (prevFinanceResult.status === 'fulfilled') {
      const items = prevFinanceResult.value;
      const income = items
        .filter((item) => item.group === 'INCOME')
        .reduce((acc, item) => acc + item.amount, 0);
      const expense = items
        .filter((item) => item.group === 'EXPENSE')
        .reduce((acc, item) => acc + item.amount, 0);
      setPrevFinanceSummary({ income, expense });
    } else {
      setPrevFinanceSummary({ income: 0, expense: 0 });
    }

    if (categoriesResult.status === 'fulfilled') {
      setFinanceCategories(categoriesResult.value);
    }

    if (calendarResult.status === 'fulfilled') {
      setCalendarEvents(calendarResult.value);
    } else {
      setCalendarEvents([]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSummary();
  }, [loadSummary]);

  const finance: DashboardFinanceSummary | null = useMemo(() => {
    if (isLoading) return null;
    const totalIncome = financeSummary.income;
    const totalExpenses = financeSummary.expense;
    const netResult = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netResult / totalIncome) * 100 : 0;

    const byCategory: Record<string, number> = {};
    financeTransactions
      .filter((tx) => tx.group === 'EXPENSE')
      .forEach((tx) => {
        const key = tx.categoryId ?? '__none__';
        byCategory[key] = (byCategory[key] ?? 0) + tx.amount;
      });

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoryId, amount]) => {
        const cat = financeCategories.find((c) => c.id === categoryId);
        return {
          id: categoryId,
          name: cat?.name ?? t.dashboard.categsNone,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        };
      });

    return {
      income: totalIncome,
      expenses: totalExpenses,
      netResult,
      previousMonthResult: prevFinanceSummary.income - prevFinanceSummary.expense,
      savingsRate,
      topCategories,
    };
  }, [
    isLoading,
    financeSummary,
    prevFinanceSummary,
    financeTransactions,
    financeCategories,
    t.dashboard.categsNone,
  ]);

  const stats: DashboardStats = useMemo(
    () => ({
      listCount: remindersTotal,
      secretCount: secretsTotal,
      recentDocument: documentsRecent[0] ?? null,
      previousMonthResult: finance?.previousMonthResult ?? 0,
    }),
    [remindersTotal, secretsTotal, documentsRecent, finance],
  );

  const upcomingEvents: UpcomingEvent[] = useMemo(() => {
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    return calendarEvents
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .map((e) => ({
        id: e.id,
        title: e.title,
        time: e.allDay
          ? language === 'pt' ? 'Dia todo' : 'All day'
          : new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
              new Date(e.startAt),
            ),
        type: 'calendar' as const,
        moduleSlug: 'calendar',
      }));
  }, [calendarEvents, language]);

  const modules: DashboardModule[] = useMemo(() => {
    const currentMonthLabel = new Intl.DateTimeFormat(
      language === 'pt' ? 'pt-BR' : 'en-US',
      { month: 'long', year: 'numeric' },
    ).format(new Date());

    const remindersCtx: ModuleContextData = {
      badge: remindersTotal > 0 ? `${remindersTotal} ${t.dashboard.modulePendingTasks}` : null,
      badgeVariant: 'default',
      description:
        remindersTotal > 0
          ? `${remindersTotal} ${t.dashboard.modulePendingTasks}`
          : t.dashboard.moduleAllUpToDate,
      subtitle: remindersTotal > 0 ? t.dashboard.moduleActiveToday : t.dashboard.moduleAllUpToDate,
    };

    const nextEvent = upcomingEvents[0];
    const calendarCtx: ModuleContextData = {
      badge:
        upcomingEvents.length > 0
          ? `${upcomingEvents.length} ${t.dashboard.moduleEventsToday}`
          : null,
      badgeVariant: 'default',
      description: nextEvent
        ? `${t.dashboard.moduleNextEvent}: ${nextEvent.time} — ${nextEvent.title}`
        : t.dashboard.moduleNoEventsToday,
      subtitle: currentMonthLabel,
    };

    const latestDoc = documentsRecent[0];
    const documentsCtx: ModuleContextData = {
      badge: latestDoc
        ? latestDoc.name.length > 12
          ? `${latestDoc.name.slice(0, 12)}…`
          : latestDoc.name
        : null,
      badgeVariant: 'default',
      description:
        documentsRecent.length > 0 ? t.dashboard.moduleUpdatedRecently : t.dashboard.moduleNoDocuments,
      subtitle: `${documentsRecent.length} ${t.dashboard.moduleFiles}`,
    };

    const netResult = finance?.netResult ?? null;
    const financeCtx: ModuleContextData = {
      badge:
        netResult !== null && netResult !== 0
          ? `${netResult > 0 ? '+' : ''}${formatValue(netResult)}`
          : null,
      badgeVariant: netResult !== null && netResult > 0 ? 'success' : 'danger',
      description:
        netResult === null
          ? t.dashboard.moduleNoEntries
          : netResult > 0
            ? t.dashboard.modulePositiveResult
            : t.dashboard.moduleNegativeResult,
      subtitle: currentMonthLabel,
    };

    const secretsCtx: ModuleContextData = {
      badge: null,
      badgeVariant: 'default',
      description: secretsTotal > 0 ? t.dashboard.moduleVaultLabel : t.dashboard.moduleNoVaultItems,
      subtitle: `${secretsTotal} ${t.dashboard.moduleProtectedItems}`,
    };

    const genericCtx = (subtitle: string): ModuleContextData => ({
      badge: null,
      badgeVariant: 'default',
      description: t.dashboard.moduleOpenToExplore,
      subtitle,
    });

    const comingSoonCtx: ModuleContextData = {
      badge: null,
      badgeVariant: 'default',
      description: t.dashboard.centralChatSubtitle,
      subtitle: t.dashboard.moduleAvailableSoon,
    };

    return [
      {
        key: 'reminders',
        label: t.modules.reminders,
        href: '/reminders',
        contextData: remindersCtx,
      },
      {
        key: 'calendar',
        label: t.modules.calendar,
        href: '/calendar',
        contextData: calendarCtx,
      },
      {
        key: 'documents',
        label: t.modules.documents,
        href: '/documents',
        contextData: documentsCtx,
      },
      {
        key: 'finance',
        label: t.modules.finance,
        href: '/finance',
        contextData: financeCtx,
      },
      {
        key: 'secrets',
        label: t.modules.secrets,
        href: '/secrets',
        contextData: secretsCtx,
      },
      {
        key: 'studies',
        label: t.modules.studies,
        href: '/studies',
        contextData: genericCtx(t.dashboard.moduleOpenToExplore),
      },
      {
        key: 'hr',
        label: t.modules.hr,
        href: '/hr',
        contextData: genericCtx(t.dashboard.moduleOpenToExplore),
      },
      {
        key: 'inventory',
        label: t.modules.inventory,
        href: '/inventory',
        contextData: genericCtx(t.dashboard.moduleOpenToExplore),
      },
      {
        key: 'chat',
        label: t.dashboard.centralChatTitle,
        contextData: comingSoonCtx,
      },
    ];
  }, [
    t,
    language,
    remindersTotal,
    secretsTotal,
    documentsRecent,
    finance,
    formatValue,
    upcomingEvents,
  ]);

  return (
    <div className="page-transition flex flex-col gap-5 px-1 py-1">
      <DashboardGreeting upcomingEvents={upcomingEvents} />
      <DashboardFinanceBlock finance={finance} isLoading={isLoading} formatValue={formatValue} />
      <DashboardStatsRow stats={stats} finance={finance} isLoading={isLoading} formatValue={formatValue} />
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCategoriesPanel
          categories={finance?.topCategories ?? []}
          isLoading={isLoading}
          formatValue={formatValue}
        />
        <DashboardEventsPanel events={upcomingEvents} />
      </div>
      <DashboardModulesGrid modules={modules} title={t.dashboard.centralModulesTitle} />
    </div>
  );
}


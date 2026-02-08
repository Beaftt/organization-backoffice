"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { getEntitlements } from "@/lib/api/entitlements";
import { listReminderLists, type ReminderList } from "@/lib/api/reminders";
import { listDocuments, type DocumentSummary } from "@/lib/api/documents";
import { listCalendarEvents, type CalendarEvent } from "@/lib/api/calendar";
import {
  listFinanceTransactions,
  type FinanceTransaction,
} from "@/lib/api/finance";
import { listStudyCourses, listStudyTasks } from "@/lib/api/studies";
import { listHrJobs } from "@/lib/api/hr";
import { listJobs } from "@/lib/api/jobs";
import { ApiError } from "@/lib/api/client";

type FinanceSummary = {
  count: number;
  income: number;
  expense: number;
  recent: FinanceTransaction[];
};

type StudiesSummary = {
  activeCount: number;
  avgProgress: number;
  dueCount: number;
};

type RecentSummary = {
  recentCount: number;
  latestTitle: string | null;
};

const formatCurrency = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

const formatTime = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const isWithinDays = (value: string, days: number) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return new Date(value).getTime() >= since.getTime();
};

export default function DashboardClient() {
  const { t, language } = useLanguage();
  const currencyLocale = language === "pt" ? "pt-BR" : "en-US";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({
    count: 0,
    income: 0,
    expense: 0,
    recent: [],
  });
  const [entitlements, setEntitlements] = useState<Record<string, string>>({});
  const [calendarToday, setCalendarToday] = useState<CalendarEvent[]>([]);
  const [documentsTop, setDocumentsTop] = useState<DocumentSummary[]>([]);
  const [latestReminder, setLatestReminder] = useState<ReminderList | null>(null);
  const [studiesSummary, setStudiesSummary] = useState<StudiesSummary>({
    activeCount: 0,
    avgProgress: 0,
    dueCount: 0,
  });
  const [hrSummary, setHrSummary] = useState<RecentSummary>({
    recentCount: 0,
    latestTitle: null,
  });
  const [jobsSummary, setJobsSummary] = useState<RecentSummary>({
    recentCount: 0,
    latestTitle: null,
  });

  const isEnabled = useCallback(
    (key: string) => {
      if (!key) return true;
      const value = entitlements[key];
      if (value === undefined) return true;
      return value === "true";
    },
    [entitlements],
  );

  const loadData = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    setIsLoading(true);
    setError(null);
    if (!workspaceId) {
      setError(t.dashboard.loadError);
      setIsLoading(false);
      return;
    }

    try {
      const entitlementsResponse = await getEntitlements(workspaceId);
      const map = entitlementsResponse.items.reduce<Record<string, string>>(
        (acc, item) => {
          acc[item.key] = item.value;
          return acc;
        },
        {},
      );
      setEntitlements(map);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const dueEnd = new Date();
      dueEnd.setDate(dueEnd.getDate() + 7);
      dueEnd.setHours(23, 59, 59, 999);

      const isModuleEnabled = (key: string) => {
        if (!key) return true;
        const value = map[key];
        if (value === undefined) return true;
        return value === "true";
      };

      const requests: Array<Promise<void>> = [];

      if (isModuleEnabled("module.organization")) {
        requests.push(
          listReminderLists({
            workspaceId,
            pageSize: 1,
            orderBy: "updatedAt",
            orderDirection: "desc",
          }).then((res) => {
            setLatestReminder(res.items[0] ?? null);
          }),
        );
        requests.push(
          listDocuments({
            workspaceId,
            pageSize: 3,
            orderBy: "updatedAt",
            orderDirection: "desc",
          }).then((res) => {
            setDocumentsTop(res.items ?? []);
          }),
        );
        requests.push(
          listCalendarEvents({
            workspaceId,
            from: todayStart.toISOString(),
            to: todayEnd.toISOString(),
          }).then((res) => {
            setCalendarToday(res);
          }),
        );
      }

      if (isModuleEnabled("module.finance")) {
        requests.push(
          listFinanceTransactions({
            workspaceId,
            from: startOfMonth.toISOString(),
            to: endOfMonth.toISOString(),
          }).then((items) => {
            const sorted = [...items].sort(
              (a, b) =>
                new Date(b.occurredAt).getTime() -
                new Date(a.occurredAt).getTime(),
            );
            const summary = items.reduce(
              (acc, item) => {
                if (item.group === "INCOME") acc.income += item.amount;
                if (item.group === "EXPENSE") acc.expense += item.amount;
                acc.count += 1;
                return acc;
              },
              { count: 0, income: 0, expense: 0 },
            );
            setFinanceSummary({
              ...summary,
              recent: sorted.slice(0, 6),
            });
          }),
        );
      }

      if (isModuleEnabled("module.studies")) {
        requests.push(
          listStudyCourses({ workspaceId, status: "ACTIVE" }).then((items) => {
            const total = items.reduce((acc, course) => acc + course.progress, 0);
            const avg = items.length ? total / items.length : 0;
            setStudiesSummary((prev) => ({
              ...prev,
              activeCount: items.length,
              avgProgress: avg,
            }));
          }),
        );
        requests.push(
          listStudyTasks({
            workspaceId,
            status: "OPEN",
            from: todayStart.toISOString(),
            to: dueEnd.toISOString(),
          }).then((items) => {
            setStudiesSummary((prev) => ({
              ...prev,
              dueCount: items.length,
            }));
          }),
        );
      }

      if (isModuleEnabled("module.hr")) {
        requests.push(
          listHrJobs({ workspaceId, pageSize: 1 }).then((res) => {
            const sorted = [...res.items].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            const recent = sorted.filter((job) =>
              isWithinDays(job.createdAt, 30),
            );
            setHrSummary({
              recentCount: recent.length,
              latestTitle: sorted[0]?.title ?? null,
            });
          }),
        );
      }

      if (isModuleEnabled("module.jobs")) {
        requests.push(
          listJobs({ workspaceId, pageSize: 1 }).then((res) => {
            const sorted = [...res.items].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            const recent = sorted.filter((job) =>
              isWithinDays(job.createdAt, 30),
            );
            setJobsSummary({
              recentCount: recent.length,
              latestTitle: sorted[0]?.title ?? null,
            });
          }),
        );
      }

      await Promise.allSettled(requests);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.dashboard.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [t.dashboard.loadError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const financeChart = useMemo(() => {
    if (!financeSummary.recent.length) return [];
    const values = financeSummary.recent.map((item) => Math.abs(item.amount));
    const max = Math.max(...values, 1);
    return financeSummary.recent.map((item) => ({
      id: item.id,
      height: Math.round((Math.abs(item.amount) / max) * 100),
      positive: item.group === "INCOME",
      label: formatDate(item.occurredAt, currencyLocale),
    }));
  }, [financeSummary.recent, currencyLocale]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">{t.dashboard.title}</h2>
        <p className="text-sm text-zinc-500">{t.dashboard.subtitle}</p>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {isEnabled("module.finance") ? (
          <Link href="/finance" className="block">
            <Card className="group h-full cursor-pointer transition hover:border-[var(--sidebar)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    {t.dashboard.financeBoardLabel}
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {t.dashboard.financeBoardTitle}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {t.dashboard.financeBoardSubtitle}
                  </p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-zinc-500">
                  {t.dashboard.monthlyTransactions}: {financeSummary.count}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    {t.dashboard.monthlyIncome}
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {isLoading
                      ? "—"
                      : formatCurrency(financeSummary.income, currencyLocale)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    {t.dashboard.monthlyExpense}
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {isLoading
                      ? "—"
                      : formatCurrency(financeSummary.expense, currencyLocale)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    {t.dashboard.monthlyNet ?? "Saldo do mês"}
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {isLoading
                      ? "—"
                      : formatCurrency(
                          financeSummary.income - financeSummary.expense,
                          currencyLocale,
                        )}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  {t.dashboard.financeChartLabel}
                </p>
                <div className="mt-3 flex h-24 items-end gap-2">
                  {financeChart.length ? (
                    financeChart.map((bar, index) => (
                      <div key={bar.id} className="flex-1">
                        <div
                          className={`chart-bar w-full rounded-full ${
                            bar.positive
                              ? "bg-emerald-500/70"
                              : "bg-rose-500/70"
                          }`}
                          style={{
                            height: `${Math.max(bar.height, 12)}%`,
                            animationDelay: `${index * 40}ms`,
                          }}
                          title={bar.label}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-400">
                      {t.dashboard.financeChartEmpty}
                    </p>
                  )}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {financeSummary.recent.length ? (
                    financeSummary.recent.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="text-xs text-zinc-500">
                            {formatDate(item.occurredAt, currencyLocale)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(item.amount, currencyLocale)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-400">
                      {t.dashboard.financeChartEmpty}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ) : null}

        {isEnabled("module.organization") ? (
          <Link href="/calendar" className="block">
            <Card className="h-full cursor-pointer transition hover:border-[var(--sidebar)]">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  {t.dashboard.calendarBoardLabel}
                </p>
                <h3 className="text-lg font-semibold">
                  {t.dashboard.calendarTodayTitle}
                </h3>
                <p className="text-sm text-zinc-500">
                  {t.dashboard.calendarTodaySubtitle}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {calendarToday.length ? (
                  calendarToday.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                    >
                      <p className="text-sm font-semibold">{event.title}</p>
                      <p className="text-xs text-zinc-500">
                        {formatTime(event.startAt, currencyLocale)}
                        {event.endAt
                          ? ` - ${formatTime(event.endAt, currencyLocale)}`
                          : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">
                    {t.dashboard.calendarTodayEmpty}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.dashboard.reportsTitle}</h3>
          <p className="text-sm text-zinc-500">{t.dashboard.reportsSubtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isEnabled("module.organization") ? (
            <Link href="/documents" className="block">
              <Card className="h-full cursor-pointer transition hover:border-[var(--sidebar)]">
                <h4 className="text-base font-semibold">
                  {t.dashboard.documentsTopTitle}
                </h4>
                <p className="mt-1 text-sm text-zinc-500">
                  {t.dashboard.documentsTopSubtitle}
                </p>
                <div className="mt-4 space-y-3">
                  {documentsTop.length ? (
                    documentsTop.map((doc) => (
                      <div key={doc.id} className="flex flex-col">
                        <p className="text-sm font-semibold">{doc.name}</p>
                        <p className="text-xs text-zinc-500">
                          {t.dashboard.lastUpdatedLabel} {formatDate(doc.updatedAt, currencyLocale)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-400">
                      {t.dashboard.documentsTopEmpty}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ) : null}

          {isEnabled("module.organization") ? (
            <Link href="/reminders" className="block">
              <Card className="h-full cursor-pointer transition hover:border-[var(--sidebar)]">
                <h4 className="text-base font-semibold">
                  {t.dashboard.remindersLatestTitle}
                </h4>
                <p className="mt-1 text-sm text-zinc-500">
                  {t.dashboard.remindersLatestSubtitle}
                </p>
                <div className="mt-4">
                  {latestReminder ? (
                    <div>
                      <p className="text-sm font-semibold">
                        {latestReminder.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {t.dashboard.lastUpdatedLabel} {formatDate(latestReminder.updatedAt, currencyLocale)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      {t.dashboard.remindersLatestEmpty}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ) : null}

          {isEnabled("module.studies") ? (
            <Link href="/studies" className="block">
              <Card className="h-full cursor-pointer transition hover:border-[var(--sidebar)]">
                <h4 className="text-base font-semibold">
                  {t.dashboard.studiesTitle}
                </h4>
                <p className="mt-1 text-sm text-zinc-500">
                  {t.dashboard.studiesSubtitle}
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      {t.dashboard.studiesProgressLabel}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {studiesSummary.activeCount
                        ? `${Math.round(studiesSummary.avgProgress)}%`
                        : "—"}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="h-2 rounded-full bg-emerald-500/80"
                        style={{
                          width: `${Math.min(
                            Math.round(studiesSummary.avgProgress),
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {t.dashboard.studiesActiveLabel}
                    </span>
                    <span className="font-semibold">
                      {studiesSummary.activeCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {t.dashboard.studiesDueLabel}
                    </span>
                    <span className="font-semibold">
                      {studiesSummary.dueCount}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ) : null}

          {isEnabled("module.hr") ? (
            <Link href="/hr/jobs" className="block">
              <Card className="h-full cursor-pointer transition hover:border-[var(--sidebar)]">
                <h4 className="text-base font-semibold">
                  {t.dashboard.hrRecentTitle}
                </h4>
                <p className="mt-1 text-sm text-zinc-500">
                  {t.dashboard.hrRecentSubtitle}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {t.dashboard.recentSinceLabel}
                    </span>
                    <span className="font-semibold">
                      {hrSummary.recentCount}
                    </span>
                  </div>
                  {hrSummary.latestTitle ? (
                    <p className="text-sm font-semibold">
                      {hrSummary.latestTitle}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      {t.dashboard.hrRecentEmpty}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ) : null}

          {isEnabled("module.jobs") ? (
            <Link href="/vagas" className="block">
              <Card className="h-full cursor-pointer transition hover:border-[var(--sidebar)]">
                <h4 className="text-base font-semibold">
                  {t.dashboard.jobsRecentTitle}
                </h4>
                <p className="mt-1 text-sm text-zinc-500">
                  {t.dashboard.jobsRecentSubtitle}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {t.dashboard.recentSinceLabel}
                    </span>
                    <span className="font-semibold">
                      {jobsSummary.recentCount}
                    </span>
                  </div>
                  {jobsSummary.latestTitle ? (
                    <p className="text-sm font-semibold">
                      {jobsSummary.latestTitle}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      {t.dashboard.jobsRecentEmpty}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

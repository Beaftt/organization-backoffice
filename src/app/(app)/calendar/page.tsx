"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

type CalendarEvent = {
  id: string;
  title: string;
  module: "finance" | "hr" | "documents" | "secrets" | "reminders";
  date: string;
  status: "pending" | "done";
};
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CalendarPage() {
  const { t } = useLanguage();
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const events = useMemo<CalendarEvent[]>(
    () => [
      {
        id: "e1",
        title: t.calendar.events.monthlyTaxes,
        module: "finance",
        date: "2026-01-28",
        status: "pending",
      },
      {
        id: "e2",
        title: t.calendar.events.hrRecruitmentMeeting,
        module: "hr",
        date: "2026-01-22",
        status: "done",
      },
      {
        id: "e3",
        title: t.calendar.events.renewDocument,
        module: "documents",
        date: "2026-01-18",
        status: "pending",
      },
      {
        id: "e4",
        title: t.calendar.events.updateCredentials,
        module: "secrets",
        date: "2026-01-12",
        status: "done",
      },
    ],
    [t],
  );

  const moduleLabels = {
    finance: t.modules.finance,
    hr: t.modules.hr,
    documents: t.modules.documents,
    secrets: t.modules.secrets,
    reminders: t.modules.reminders,
  } satisfies Record<CalendarEvent["module"], string>;

  const statusLabels = {
    pending: t.calendar.statusPending,
    done: t.calendar.statusDone,
  } satisfies Record<CalendarEvent["status"], string>;

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesModule =
        moduleFilter === "all" || event.module === moduleFilter;
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      return matchesModule && matchesStatus;
    });
  }, [events, moduleFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.modules.calendar}</h2>
          <p className="text-sm text-zinc-600">
            {t.calendar.subtitle}
          </p>
        </div>
        <Button>{t.calendar.newEvent}</Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.calendar.filterModuleLabel}
            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.calendar.filterAll}</option>
              <option value="finance">{t.modules.finance}</option>
              <option value="hr">{t.modules.hr}</option>
              <option value="documents">{t.modules.documents}</option>
              <option value="secrets">{t.modules.secrets}</option>
              <option value="reminders">{t.modules.reminders}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.calendar.filterStatusLabel}
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.calendar.filterAll}</option>
              <option value="pending">{t.calendar.statusPending}</option>
              <option value="done">{t.calendar.statusDone}</option>
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t.calendar.monthTitle}</h3>
              <p className="text-sm text-zinc-500">{t.calendar.monthSummary}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">◀</Button>
              <Button variant="secondary">▶</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-zinc-500">
            {t.calendar.days.map((day) => (
              <div key={day} className="text-center font-semibold uppercase">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthDays.map((day) => (
              <div
                key={day}
                className="flex h-16 flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
              >
                <span className="font-semibold text-zinc-700">{day}</span>
                {events.some((event) => event.date.endsWith(`-${String(day).padStart(2, "0")}`)) ? (
                  <span className="mt-2 h-1.5 w-full rounded-full bg-[var(--sidebar)]" />
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.calendar.monthEventsTitle}
          </h3>
          <div className="mt-4 space-y-3">
            {filtered.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {event.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {moduleLabels[event.module]} · {event.date}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    event.status === "done"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {statusLabels[event.status]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

type CalendarClientProps = {
  initialModule?: string;
  initialStatus?: string;
};

export default function CalendarClient({
  initialModule = "all",
  initialStatus = "all",
}: CalendarClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [moduleFilter, setModuleFilter] = useState(initialModule);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (moduleFilter !== "all") {
      params.set("module", moduleFilter);
    } else {
      params.delete("module");
    }
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }

    const queryString = params.toString();
    router.replace(`/calendar${queryString ? `?${queryString}` : ""}`);
  }, [moduleFilter, statusFilter, router]);

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
        date: "2026-01-14",
        status: "pending",
      },
    ],
    [t],
  );

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesModule = moduleFilter === "all" || event.module === moduleFilter;
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      return matchesModule && matchesStatus;
    });
  }, [events, moduleFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.modules.calendar}</h2>
          <p className="text-sm text-zinc-600">{t.calendar.subtitle}</p>
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

      <Card>
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {t.calendar.monthTitle}
            </h3>
            <p className="text-sm text-zinc-600">{t.calendar.monthSummary}</p>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {t.calendar.days.map((day) => (
              <div key={day} className="text-xs font-semibold text-zinc-500">
                {day}
              </div>
            ))}
            {monthDays.map((day) => (
              <div
                key={day}
                className="rounded-xl border border-[var(--border)] px-2 py-3 text-xs text-zinc-500"
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.calendar.monthEventsTitle}
          </h3>
        </div>
        <div className="mt-4 space-y-3">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-[var(--foreground)]">{event.title}</p>
                <p className="text-xs text-zinc-500">{event.date}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                  {event.module}
                </span>
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                  {event.status === "pending" ? t.calendar.statusPending : t.calendar.statusDone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

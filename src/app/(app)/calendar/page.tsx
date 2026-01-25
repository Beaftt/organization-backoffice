"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type CalendarEvent = {
  id: string;
  title: string;
  module: "Finanças" | "RH" | "Documentos" | "Senhas" | "Lembretes";
  date: string;
  status: "Pendente" | "Concluído";
};

const events: CalendarEvent[] = [
  {
    id: "e1",
    title: "Impostos mensais",
    module: "Finanças",
    date: "2026-01-28",
    status: "Pendente",
  },
  {
    id: "e2",
    title: "Reunião RH - recrutamento",
    module: "RH",
    date: "2026-01-22",
    status: "Concluído",
  },
  {
    id: "e3",
    title: "Renovar documento",
    module: "Documentos",
    date: "2026-01-18",
    status: "Pendente",
  },
  {
    id: "e4",
    title: "Atualizar credenciais",
    module: "Senhas",
    date: "2026-01-12",
    status: "Concluído",
  },
];

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CalendarPage() {
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesModule =
        moduleFilter === "all" || event.module === moduleFilter;
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      return matchesModule && matchesStatus;
    });
  }, [moduleFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Calendário</h2>
          <p className="text-sm text-zinc-600">
            Eventos integrados de finanças, RH, documentos e lembretes.
          </p>
        </div>
        <Button>+ Novo evento</Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Módulo
            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="Finanças">Finanças</option>
              <option value="RH">RH</option>
              <option value="Documentos">Documentos</option>
              <option value="Senhas">Senhas</option>
              <option value="Lembretes">Lembretes</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluído">Concluído</option>
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Janeiro 2026</h3>
              <p className="text-sm text-zinc-500">Resumo mensal</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">◀</Button>
              <Button variant="secondary">▶</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-zinc-500">
            {days.map((day) => (
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
            Eventos do mês
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
                    {event.module} · {event.date}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    event.status === "Concluído"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

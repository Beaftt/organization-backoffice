"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type FinanceType = {
  id: string;
  name: string;
  group: "Receita" | "Despesa";
};

type Transaction = {
  id: string;
  title: string;
  amount: number;
  typeId: string;
  date: string;
  status: "Pago" | "Pendente";
};

type RecurringItem = {
  id: string;
  title: string;
  amount: number;
  typeId: string;
  cadence: "Mensal" | "Trimestral";
  nextDue: string;
  paid: boolean;
};

const financeTypes: FinanceType[] = [
  { id: "t1", name: "Salário", group: "Receita" },
  { id: "t2", name: "Assinaturas", group: "Despesa" },
  { id: "t3", name: "Impostos", group: "Despesa" },
  { id: "t4", name: "Serviços", group: "Despesa" },
];

const transactions: Transaction[] = [
  {
    id: "tr1",
    title: "Salário janeiro",
    amount: 8500,
    typeId: "t1",
    date: "2026-01-10",
    status: "Pago",
  },
  {
    id: "tr2",
    title: "Spotify",
    amount: 39.9,
    typeId: "t2",
    date: "2026-01-12",
    status: "Pago",
  },
  {
    id: "tr3",
    title: "ISS",
    amount: 420,
    typeId: "t3",
    date: "2026-01-20",
    status: "Pendente",
  },
  {
    id: "tr4",
    title: "Consultoria",
    amount: 1500,
    typeId: "t4",
    date: "2026-01-18",
    status: "Pago",
  },
  {
    id: "tr5",
    title: "Netflix",
    amount: 55,
    typeId: "t2",
    date: "2026-01-05",
    status: "Pago",
  },
];

const recurringItems: RecurringItem[] = [
  {
    id: "r1",
    title: "Impostos mensais",
    amount: 420,
    typeId: "t3",
    cadence: "Mensal",
    nextDue: "2026-02-10",
    paid: false,
  },
  {
    id: "r2",
    title: "Assinaturas streaming",
    amount: 95,
    typeId: "t2",
    cadence: "Mensal",
    nextDue: "2026-02-02",
    paid: true,
  },
  {
    id: "r3",
    title: "Serviços contabilidade",
    amount: 600,
    typeId: "t4",
    cadence: "Mensal",
    nextDue: "2026-02-05",
    paid: false,
  },
];

const pageSize = 4;

export default function FinancePage() {
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = transactions.filter((item) => {
      const type = financeTypes.find((t) => t.id === item.typeId);
      const matchesQuery = item.title.toLowerCase().includes(q);
      const matchesGroup =
        groupFilter === "all" || type?.group === groupFilter;
      const matchesType = typeFilter === "all" || item.typeId === typeFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesQuery && matchesGroup && matchesType && matchesStatus;
    });

    if (sortBy === "amount") {
      items = items.sort((a, b) => b.amount - a.amount);
    } else {
      items = items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }

    return items;
  }, [query, groupFilter, typeFilter, statusFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Finanças</h2>
          <p className="text-sm text-zinc-600">
            Registre despesas, receitas e recorrências mensais.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">+ Novo tipo</Button>
          <Button>+ Nova transação</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Checklist de contas recorrentes
          </h3>
          <div className="mt-4 space-y-3">
            {recurringItems.map((item) => {
              const type = financeTypes.find((t) => t.id === item.typeId);
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {type?.name} · {item.cadence}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500">Próx: {item.nextDue}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.paid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.paid ? "Pago" : "Pendente"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Tipos financeiros
          </h3>
          <div className="mt-4 grid gap-3">
            {financeTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
              >
                <span>{type.name}</span>
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                  {type.group}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Buscar"
              placeholder="Pesquisar transações"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Grupo
            <select
              value={groupFilter}
              onChange={(event) => {
                setGroupFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Tipo
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              {financeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Status
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Ordenar
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="date">Data</option>
              <option value="amount">Valor</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3">Título</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Data</th>
                <th className="pb-3">Valor</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paged.map((item) => {
                const type = financeTypes.find((t) => t.id === item.typeId);
                return (
                  <tr key={item.id} className="text-zinc-700">
                    <td className="py-3 font-medium text-[var(--foreground)]">
                      {item.title}
                    </td>
                    <td className="py-3">{type?.name}</td>
                    <td className="py-3">{item.date}</td>
                    <td className="py-3">R$ {item.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Pago"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost">Detalhes</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          <span>
            Página {page} de {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
            >
              Próximo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

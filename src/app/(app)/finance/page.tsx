"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

type FinanceType = {
  id: string;
  name: string;
  group: "income" | "expense";
};

type Transaction = {
  id: string;
  title: string;
  amount: number;
  typeId: string;
  date: string;
  status: "paid" | "pending";
};

type RecurringItem = {
  id: string;
  title: string;
  amount: number;
  typeId: string;
  cadence: "monthly" | "quarterly";
  nextDue: string;
  paid: boolean;
};

const pageSize = 4;

export default function FinancePage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);

  const financeTypes = useMemo<FinanceType[]>(
    () => [
      { id: "t1", name: t.finance.types.salary, group: "income" },
      { id: "t2", name: t.finance.types.subscriptions, group: "expense" },
      { id: "t3", name: t.finance.types.taxes, group: "expense" },
      { id: "t4", name: t.finance.types.services, group: "expense" },
    ],
    [t],
  );

  const transactions = useMemo<Transaction[]>(
    () => [
      {
        id: "tr1",
        title: t.finance.transactions.salaryJanuary,
        amount: 8500,
        typeId: "t1",
        date: "2026-01-10",
        status: "paid",
      },
      {
        id: "tr2",
        title: t.finance.transactions.spotify,
        amount: 39.9,
        typeId: "t2",
        date: "2026-01-12",
        status: "paid",
      },
      {
        id: "tr3",
        title: t.finance.transactions.iss,
        amount: 420,
        typeId: "t3",
        date: "2026-01-20",
        status: "pending",
      },
      {
        id: "tr4",
        title: t.finance.transactions.consulting,
        amount: 1500,
        typeId: "t4",
        date: "2026-01-18",
        status: "paid",
      },
      {
        id: "tr5",
        title: t.finance.transactions.netflix,
        amount: 55,
        typeId: "t2",
        date: "2026-01-05",
        status: "paid",
      },
    ],
    [t],
  );

  const recurringItems = useMemo<RecurringItem[]>(
    () => [
      {
        id: "r1",
        title: t.finance.recurring.monthlyTaxes,
        amount: 420,
        typeId: "t3",
        cadence: "monthly",
        nextDue: "2026-02-10",
        paid: false,
      },
      {
        id: "r2",
        title: t.finance.recurring.streamingSubscriptions,
        amount: 95,
        typeId: "t2",
        cadence: "monthly",
        nextDue: "2026-02-02",
        paid: true,
      },
      {
        id: "r3",
        title: t.finance.recurring.accountingServices,
        amount: 600,
        typeId: "t4",
        cadence: "monthly",
        nextDue: "2026-02-05",
        paid: false,
      },
    ],
    [t],
  );

  const groupLabels = {
    income: t.finance.groupIncome,
    expense: t.finance.groupExpense,
  } satisfies Record<FinanceType["group"], string>;

  const statusLabels = {
    paid: t.finance.statusPaid,
    pending: t.finance.statusPending,
  } satisfies Record<Transaction["status"], string>;

  const cadenceLabels = {
    monthly: t.finance.cadenceMonthly,
    quarterly: t.finance.cadenceQuarterly,
  } satisfies Record<RecurringItem["cadence"], string>;

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
          <h2 className="text-lg font-semibold">{t.modules.finance}</h2>
          <p className="text-sm text-zinc-600">
            {t.finance.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">{t.finance.newType}</Button>
          <Button>{t.finance.newTransaction}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.finance.recurringTitle}
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
                      {type?.name} · {cadenceLabels[item.cadence]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.finance.nextDueLabel} {item.nextDue}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.paid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.paid ? t.finance.statusPaid : t.finance.statusPending}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.finance.typesTitle}
          </h3>
          <div className="mt-4 grid gap-3">
            {financeTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
              >
                <span>{type.name}</span>
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                  {groupLabels[type.group]}
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
              label={t.finance.searchLabel}
              placeholder={t.finance.searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.finance.groupLabel}
            <select
              value={groupFilter}
              onChange={(event) => {
                setGroupFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.finance.groupAll}</option>
              <option value="income">{t.finance.groupIncome}</option>
              <option value="expense">{t.finance.groupExpense}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.finance.typeLabel}
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.finance.groupAll}</option>
              {financeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.finance.statusLabel}
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.finance.statusAll}</option>
              <option value="paid">{t.finance.statusPaid}</option>
              <option value="pending">{t.finance.statusPending}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.finance.sortLabel}
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="date">{t.finance.sortDate}</option>
              <option value="amount">{t.finance.sortAmount}</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3">{t.finance.tableTitle}</th>
                <th className="pb-3">{t.finance.tableType}</th>
                <th className="pb-3">{t.finance.tableDate}</th>
                <th className="pb-3">{t.finance.tableAmount}</th>
                <th className="pb-3">{t.finance.tableStatus}</th>
                <th className="pb-3 text-right">{t.finance.tableActions}</th>
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
                          item.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost">{t.finance.details}</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          <span>
            {t.finance.page} {page} {t.finance.pageOf} {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              {t.finance.prev}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
            >
              {t.finance.next}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

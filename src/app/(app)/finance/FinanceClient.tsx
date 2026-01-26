"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

type FinanceClientProps = {
  initialQuery?: string;
  initialGroup?: string;
  initialType?: string;
  initialStatus?: string;
  initialSort?: string;
  initialPage?: number;
};

export default function FinanceClient({
  initialQuery = "",
  initialGroup = "all",
  initialType = "all",
  initialStatus = "all",
  initialSort = "date",
  initialPage = 1,
}: FinanceClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [groupFilter, setGroupFilter] = useState(initialGroup);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    if (groupFilter !== "all") {
      params.set("group", groupFilter);
    } else {
      params.delete("group");
    }
    if (typeFilter !== "all") {
      params.set("type", typeFilter);
    } else {
      params.delete("type");
    }
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }
    if (sortBy !== "date") {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }
    if (page !== 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const queryString = params.toString();
    router.replace(`/finance${queryString ? `?${queryString}` : ""}`);
  }, [query, groupFilter, typeFilter, statusFilter, sortBy, page, router]);

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
        amount: 620,
        typeId: "t4",
        cadence: "quarterly",
        nextDue: "2026-03-15",
        paid: false,
      },
    ],
    [t],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = transactions.filter((item) => {
      const type = financeTypes.find((entry) => entry.id === item.typeId);
      const matchesGroup = groupFilter === "all" || type?.group === groupFilter;
      const matchesType = typeFilter === "all" || item.typeId === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery = item.title.toLowerCase().includes(q);
      return matchesGroup && matchesType && matchesStatus && matchesQuery;
    });

    if (sortBy === "amount") {
      items = items.sort((a, b) => b.amount - a.amount);
    } else {
      items = items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }

    return items;
  }, [query, groupFilter, typeFilter, statusFilter, sortBy, transactions, financeTypes]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.modules.finance}</h2>
          <p className="text-sm text-zinc-600">{t.finance.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">{t.finance.newType}</Button>
          <Button>{t.finance.newTransaction}</Button>
        </div>
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
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="date">{t.finance.sortDate}</option>
              <option value="amount">{t.finance.sortAmount}</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4">
          <div className="grid grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.6fr] gap-4 text-xs font-semibold uppercase text-zinc-500">
            <span>{t.finance.tableTitle}</span>
            <span>{t.finance.tableType}</span>
            <span>{t.finance.tableDate}</span>
            <span>{t.finance.tableAmount}</span>
            <span>{t.finance.tableStatus}</span>
          </div>
          <div className="grid gap-3">
            {paged.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.6fr] items-center gap-4 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
              >
                <span className="font-semibold text-[var(--foreground)]">
                  {item.title}
                </span>
                <span className="text-zinc-500">
                  {financeTypes.find((type) => type.id === item.typeId)?.name}
                </span>
                <span className="text-zinc-500">{item.date}</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {item.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
                <span className="text-zinc-500">
                  {item.status === "paid" ? t.finance.statusPaid : t.finance.statusPending}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
            <span>
              {t.finance.page} {page} {t.finance.pageOf} {pageCount}
            </span>
            <div className="flex gap-2">
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
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.finance.recurringTitle}
          </h3>
        </div>
        <div className="mt-4 space-y-3">
          {recurringItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
                <p className="text-xs text-zinc-500">
                  {t.finance.nextDueLabel} {item.nextDue}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {item.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-xs text-zinc-500">
                  {item.cadence === "monthly"
                    ? t.finance.cadenceMonthly
                    : t.finance.cadenceQuarterly}
                </p>
              </div>
              <Button variant="secondary">
                {item.paid ? t.finance.statusPaid : t.finance.statusPending}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

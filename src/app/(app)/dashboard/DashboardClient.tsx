"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { listDocuments, type DocumentSummary } from "@/lib/api/documents";
import { listFinanceTransactions } from "@/lib/api/finance";
import { listReminderLists } from "@/lib/api/reminders";
import { listSecrets } from "@/lib/api/secrets";

type ModuleCard = {
  key: string;
  label: string;
  description: string;
  href?: string;
  tone: string;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export default function DashboardClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [remindersTotal, setRemindersTotal] = useState(0);
  const [secretsTotal, setSecretsTotal] = useState(0);
  const [documentsRecent, setDocumentsRecent] = useState<DocumentSummary[]>(
    [],
  );
  const [financeSummary, setFinanceSummary] = useState({
    income: 0,
    expense: 0,
  });

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
      }).format(value),
    [],
  );

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const [remindersResult, secretsResult, documentsResult, financeResult] =
      await Promise.allSettled([
        listReminderLists({ pageSize: 1 }),
        listSecrets({ pageSize: 1 }),
        listDocuments({
          pageSize: 3,
          orderBy: "updatedAt",
          orderDirection: "desc",
        }),
        listFinanceTransactions({
          from: startOfMonth.toISOString(),
          to: endOfMonth.toISOString(),
        }),
      ]);

    if (remindersResult.status === "fulfilled") {
      const reminders = remindersResult.value;
      setRemindersTotal(reminders.total ?? reminders.items.length);
    } else {
      setRemindersTotal(0);
    }

    if (secretsResult.status === "fulfilled") {
      const secrets = secretsResult.value;
      setSecretsTotal(secrets.total ?? secrets.items.length);
    } else {
      setSecretsTotal(0);
    }

    if (documentsResult.status === "fulfilled") {
      const documents = documentsResult.value;
      setDocumentsRecent(documents.items ?? []);
    } else {
      setDocumentsRecent([]);
    }

    if (financeResult.status === "fulfilled") {
      const financeTransactions = financeResult.value;
      const income = financeTransactions
        .filter((item) => item.group === "INCOME")
        .reduce((acc, item) => acc + item.amount, 0);
      const expense = financeTransactions
        .filter((item) => item.group === "EXPENSE")
        .reduce((acc, item) => acc + item.amount, 0);
      setFinanceSummary({ income, expense });
    } else {
      setFinanceSummary({ income: 0, expense: 0 });
    }

    setSummaryLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSummary();
  }, [loadSummary]);

  const handleOpenPreset = useCallback(
    (label: string) => {
      const encoded = encodeURIComponent(label);
      router.push(`/reminders?preset=1&presetLabel=${encoded}`);
    },
    [router],
  );

  const summaryCards = useMemo(
    () => [
      {
        key: "finance",
        title: t.dashboard.summaryFinanceTitle,
        subtitle: t.dashboard.summaryFinanceSubtitle,
        body: (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                {t.dashboard.summaryFinanceIncome}
              </p>
              <p className="text-lg font-semibold text-emerald-600">
                {summaryLoading ? "—" : formatCurrency(financeSummary.income)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                {t.dashboard.summaryFinanceExpense}
              </p>
              <p className="text-lg font-semibold text-rose-500">
                {summaryLoading ? "—" : formatCurrency(financeSummary.expense)}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "lists",
        title: t.dashboard.summaryListsTitle,
        subtitle: t.dashboard.summaryListsSubtitle,
        body: (
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {summaryLoading ? "—" : remindersTotal}
            </p>
            <p className="text-xs text-zinc-400">
              {t.dashboard.summaryListsMeta}
            </p>
          </div>
        ),
      },
      {
        key: "secrets",
        title: t.dashboard.summarySecretsTitle,
        subtitle: t.dashboard.summarySecretsSubtitle,
        body: (
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {summaryLoading ? "—" : secretsTotal}
            </p>
            <p className="text-xs text-zinc-400">
              {t.dashboard.summarySecretsMeta}
            </p>
          </div>
        ),
      },
      {
        key: "documents",
        title: t.dashboard.summaryDocumentsTitle,
        subtitle: t.dashboard.summaryDocumentsSubtitle,
        body: (
          <div className="space-y-1 text-xs text-zinc-500">
            {documentsRecent.length ? (
              documentsRecent.map((doc) => (
                <p key={doc.id} className="truncate">
                  {doc.name}
                </p>
              ))
            ) : (
              <p className="text-zinc-400">{t.dashboard.summaryEmpty}</p>
            )}
          </div>
        ),
      },
    ],
    [
      documentsRecent,
      financeSummary.expense,
      financeSummary.income,
      formatCurrency,
      remindersTotal,
      secretsTotal,
      summaryLoading,
      t.dashboard.summaryDocumentsSubtitle,
      t.dashboard.summaryDocumentsTitle,
      t.dashboard.summaryEmpty,
      t.dashboard.summaryFinanceExpense,
      t.dashboard.summaryFinanceIncome,
      t.dashboard.summaryFinanceSubtitle,
      t.dashboard.summaryFinanceTitle,
      t.dashboard.summaryListsMeta,
      t.dashboard.summaryListsSubtitle,
      t.dashboard.summaryListsTitle,
      t.dashboard.summarySecretsMeta,
      t.dashboard.summarySecretsSubtitle,
      t.dashboard.summarySecretsTitle,
    ],
  );

  const modules: ModuleCard[] = [
    {
      key: "reminders",
      label: t.modules.reminders,
      description: t.dashboard.centralModuleHint,
      href: "/reminders",
      tone: "from-sky-500/20 via-cyan-300/10 to-transparent",
      action: {
        label: t.reminders.newList,
        onClick: () => handleOpenPreset(t.reminders.presetListFallback),
      },
    },
    {
      key: "calendar",
      label: t.modules.calendar,
      description: t.dashboard.centralModuleHint,
      href: "/calendar",
      tone: "from-emerald-500/20 via-lime-300/10 to-transparent",
    },
    {
      key: "documents",
      label: t.modules.documents,
      description: t.dashboard.centralModuleHint,
      href: "/documents",
      tone: "from-indigo-500/20 via-blue-400/10 to-transparent",
    },
    {
      key: "finance",
      label: t.modules.finance,
      description: t.dashboard.centralModuleHint,
      href: "/finance",
      tone: "from-amber-500/20 via-orange-300/10 to-transparent",
    },
    {
      key: "secrets",
      label: t.modules.secrets,
      description: t.dashboard.centralModuleHint,
      href: "/secrets",
      tone: "from-violet-500/20 via-fuchsia-300/10 to-transparent",
    },
    {
      key: "studies",
      label: t.modules.studies,
      description: t.dashboard.centralModuleHint,
      href: "/studies",
      tone: "from-rose-500/20 via-pink-300/10 to-transparent",
    },
    {
      key: "hr",
      label: t.modules.hr,
      description: t.dashboard.centralModuleHint,
      href: "/hr",
      tone: "from-slate-500/20 via-slate-300/10 to-transparent",
    },
    {
      key: "chat",
      label: t.dashboard.centralChatTitle,
      description: t.dashboard.centralChatSubtitle,
      tone: "from-blue-500/20 via-indigo-300/10 to-transparent",
      badge: t.layout.comingSoon,
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {t.dashboard.centralModulesTitle}
        </h3>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const hrefMap: Record<string, string> = {
            finance: "/finance",
            lists: "/reminders",
            secrets: "/secrets",
            documents: "/documents",
          };
          const href = hrefMap[card.key] ?? "/dashboard";
          return (
            <Link
              key={card.key}
              href={href}
              className="block list-item-animate"
            >
              <Card className="group relative h-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    {card.title}
                  </p>
                  <p className="text-sm text-zinc-500">{card.subtitle}</p>
                  <div className="pt-1">{card.body}</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {t.layout.modules}
        </h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const content = (
            <Card className="group relative h-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-[var(--foreground)]">
                      {module.label}
                    </h4>
                    {module.badge ? (
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                        {module.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-zinc-500">{module.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {module.href ? (
                    <span className="rounded-full bg-[var(--sidebar)] px-4 py-1.5 text-xs font-semibold text-white">
                      {t.dashboard.centralModuleAction}
                    </span>
                  ) : (
                    <span className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-semibold text-zinc-400">
                      {t.layout.comingSoon}
                    </span>
                  )}
                  {module.action ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        module.action?.onClick();
                      }}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
                    >
                      {module.action.label}
                    </button>
                  ) : null}
                </div>
              </div>
            </Card>
          );

          if (!module.href) {
            return <div key={module.key}>{content}</div>;
          }

          return (
            <Link key={module.key} href={module.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>
      </section>
    </div>
  );
}

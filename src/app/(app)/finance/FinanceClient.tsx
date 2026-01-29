"use client";

    import { useCallback, useEffect, useMemo, useState } from "react";
    import { useRouter } from "next/navigation";
    import { Card } from "@/components/ui/Card";
    import { Input } from "@/components/ui/Input";
    import { Button } from "@/components/ui/Button";
    import { useLanguage } from "@/lib/i18n/language-context";
    import { ApiError } from "@/lib/api/client";
    import { createCalendarEvent } from "@/lib/api/calendar";
    import {
      createFinanceAccount,
      createFinanceCategory,
      createFinanceRecurring,
      createFinanceTag,
      createFinanceTransaction,
      deleteFinanceRecurring,
      deleteFinanceTransaction,
      getFinanceSummary,
      listFinanceAccounts,
      listFinanceCategories,
      listFinanceNotifications,
      listFinanceRecurring,
      listFinanceTags,
      listFinanceTransactions,
      updateFinanceRecurring,
      updateFinanceNotification,
      updateFinanceTransaction,
      type FinanceAccount,
      type FinanceCategory,
      type FinanceNotification,
      type FinanceRecurring,
      type FinanceSummary,
      type FinanceTag,
      type FinanceTransaction,
    } from "@/lib/api/finance";

    const pageSize = 6;
    const suggestedTags = ["Mercado", "Compras", "Eventos"];

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
      const chartMonthRange = 12;
      const [query, setQuery] = useState(initialQuery);
      const [groupFilter, setGroupFilter] = useState(initialGroup);
      const [typeFilter, setTypeFilter] = useState(initialType);
      const [statusFilter, setStatusFilter] = useState(initialStatus);
      const [sortBy, setSortBy] = useState(initialSort);
      const [page, setPage] = useState(initialPage);
      const [tags, setTags] = useState<FinanceTag[]>([]);
      const [categories, setCategories] = useState<FinanceCategory[]>([]);
      const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
      const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
      const [recurring, setRecurring] = useState<FinanceRecurring[]>([]);
      const [notifications, setNotifications] = useState<FinanceNotification[]>([]);
      const [summary, setSummary] = useState<FinanceSummary | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [transactionModalOpen, setTransactionModalOpen] = useState(false);
      const [transactionTab, setTransactionTab] = useState<"details" | "recurrence">(
        "details",
      );
      const [linkedRecurringId, setLinkedRecurringId] = useState<string | null>(null);
      const [recurringModalOpen, setRecurringModalOpen] = useState(false);
      const [categoryModalOpen, setCategoryModalOpen] = useState(false);
      const [accountModalOpen, setAccountModalOpen] = useState(false);
      const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(
        null,
      );
      const [transactionForm, setTransactionForm] = useState({
        title: "",
        amount: "",
        currency: "BRL" as "BRL" | "USD",
        group: "INCOME" as "INCOME" | "EXPENSE",
        status: "PAID" as "PAID" | "PENDING",
        occurredAt: "",
        accountId: "",
        categoryId: "",
        tagIds: [] as string[],
        description: "",
        isRecurring: false,
        addToCalendar: false,
        recurrenceFrequency: "MONTHLY" as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
      });
      const [recurringForm, setRecurringForm] = useState({
        title: "",
        amount: "",
        group: "INCOME" as "INCOME" | "EXPENSE",
        frequency: "MONTHLY" as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
        interval: "1",
        nextDue: "",
        accountId: "",
        categoryId: "",
        tagIds: [] as string[],
      });
      const [categoryForm, setCategoryForm] = useState({
        name: "",
        group: "EXPENSE" as "INCOME" | "EXPENSE",
      });
      const [accountForm, setAccountForm] = useState({
        name: "",
        type: "BANK" as "CASH" | "BANK" | "CARD",
        currency: "BRL",
      });
      const [tagDraft, setTagDraft] = useState("");
      const [formError, setFormError] = useState<string | null>(null);
      const [isSaving, setIsSaving] = useState(false);
      const [monthIndex, setMonthIndex] = useState(() => chartMonthRange - 1);

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

      const loadBase = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [
            tagsResult,
            categoriesResult,
            accountsResult,
            recurringResult,
            notificationsResult,
            summaryResult,
          ] = await Promise.all([
            listFinanceTags(),
            listFinanceCategories(),
            listFinanceAccounts(),
            listFinanceRecurring(),
            listFinanceNotifications(),
            getFinanceSummary(),
          ]);

          setTags(tagsResult);
          setCategories(categoriesResult);
          setAccounts(accountsResult);
          setRecurring(recurringResult);
          setNotifications(notificationsResult);
          setSummary(summaryResult);
        } catch (err) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError(t.finance.loadError);
          }
        } finally {
          setIsLoading(false);
        }
      }, [t]);

      const loadTransactions = useCallback(async () => {
        try {
          const response = await listFinanceTransactions({
            q: query || undefined,
            group: groupFilter !== "all" ? (groupFilter as "INCOME" | "EXPENSE") : undefined,
            status: statusFilter !== "all" ? (statusFilter as "PAID" | "PENDING") : undefined,
            categoryId: typeFilter !== "all" ? typeFilter : undefined,
          });
          setTransactions(response);
        } catch (err) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError(t.finance.loadError);
          }
        }
      }, [query, groupFilter, statusFilter, typeFilter, t]);

      useEffect(() => {
        void loadBase();
      }, [loadBase]);

      useEffect(() => {
        void loadTransactions();
      }, [loadTransactions]);

      const sortedTransactions = useMemo(() => {
        const items = [...transactions];
        if (sortBy === "amount") {
          items.sort((a, b) => b.amount - a.amount);
        } else {
          items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
        }
        return items;
      }, [transactions, sortBy]);

      const pageCount = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
      const paged = sortedTransactions.slice((page - 1) * pageSize, page * pageSize);

      const monthKeys = useMemo(() => {
        const now = new Date();
        return Array.from({ length: chartMonthRange }, (_, index) => {
          const monthDate = new Date(
            now.getFullYear(),
            now.getMonth() - (chartMonthRange - 1 - index),
            1,
          );
          return monthDate.toISOString().slice(0, 7);
        });
      }, [chartMonthRange]);

      useEffect(() => {
        setMonthIndex((current) => {
          if (current < 0) return 0;
          if (current > monthKeys.length - 1) return monthKeys.length - 1;
          return current;
        });
      }, [monthKeys.length]);

      const monthlyAccountTotals = useMemo(() => {
        const accountMap = new Map(accounts.map((account) => [account.id, account]));
        const monthMap = new Map(
          monthKeys.map((key) => [key, new Map<string, { income: number; expense: number; currency: string }>()]),
        );
        let hasUnknownAccount = false;

        transactions.forEach((transaction) => {
          const monthKey = transaction.occurredAt.slice(0, 7);
          const monthBucket = monthMap.get(monthKey);
          if (!monthBucket) return;

          const accountId = transaction.accountId ?? "__unknown__";
          if (!transaction.accountId) {
            hasUnknownAccount = true;
          }

          const accountCurrency = transaction.accountId
            ? accountMap.get(transaction.accountId)?.currency ?? transaction.currency ?? "BRL"
            : transaction.currency ?? "BRL";

          const existing = monthBucket.get(accountId) ?? {
            income: 0,
            expense: 0,
            currency: accountCurrency,
          };

          if (transaction.group === "INCOME") {
            existing.income += transaction.amount;
          } else {
            existing.expense += transaction.amount;
          }

          monthBucket.set(accountId, existing);
        });

        const accountEntries = accounts.map((account) => ({
          id: account.id,
          name: account.name,
          currency: account.currency,
        }));

        if (hasUnknownAccount) {
          accountEntries.push({
            id: "__unknown__",
            name: t.finance.accountUnknown,
            currency: "BRL",
          });
        }

        return monthKeys.map((key) => {
          const monthDate = new Date(`${key}-01T00:00:00`);
          const label = monthDate.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          });
          const totals = monthMap.get(key) ?? new Map();
          const accountsData = accountEntries.map((account) => {
            const data = totals.get(account.id) ?? { income: 0, expense: 0, currency: account.currency };
            return {
              ...account,
              income: data.income,
              expense: data.expense,
            };
          });
          return { key, label, accounts: accountsData };
        });
      }, [accounts, monthKeys, t.finance.accountUnknown, transactions]);

      const activeMonth = monthlyAccountTotals[monthIndex];

      const maxBarValue = useMemo(() => {
        if (!activeMonth) return 1;
        let max = 0;
        activeMonth.accounts.forEach((account) => {
          max = Math.max(max, account.income, account.expense);
        });
        return max || 1;
      }, [activeMonth]);

      const resolveNowForInput = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      };

      const formatCurrencyInput = (digits: string, currency: string) => {
        if (!digits) return "";
        const value = Number(digits) / 100;
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }).format(value);
      };

      const parseCurrencyInput = (value: string) => {
        const digits = value.replace(/\D/g, "");
        return digits ? Number(digits) / 100 : 0;
      };

      const findRecurringById = (recurringId?: string | null) =>
        recurringId ? recurring.find((item) => item.id === recurringId) ?? null : null;

      const handleOpenTransaction = (item?: FinanceTransaction) => {
        setEditingTransaction(item ?? null);
        setFormError(null);
        setTransactionTab("details");
        const matchedRecurring = item ? findRecurringById(item.recurringId) : null;
        setLinkedRecurringId(matchedRecurring?.id ?? item?.recurringId ?? null);
        setTransactionForm({
          title: item?.title ?? "",
          amount: item ? formatCurrencyInput(String(Math.round(item.amount * 100)), item.currency ?? "BRL") : "",
          currency: (item?.currency ?? "BRL") as "BRL" | "USD",
          group: item?.group ?? "INCOME",
          status: item?.status ?? "PAID",
          occurredAt: item?.occurredAt ?? resolveNowForInput(),
          accountId: item?.accountId ?? "",
          categoryId: item?.categoryId ?? "",
          tagIds: item?.tagIds ?? [],
          description: item?.description ?? "",
          isRecurring: Boolean(matchedRecurring ?? item?.recurringId),
          addToCalendar: false,
          recurrenceFrequency: matchedRecurring?.frequency ?? "MONTHLY",
        });
        setTransactionModalOpen(true);
      };

      const handleSaveTransaction = async () => {
        if (!transactionForm.title.trim()) {
          setFormError(t.finance.titleRequired ?? t.finance.titleLabel);
          return;
        }
        if (!transactionForm.amount) {
          setFormError(t.finance.amountRequired ?? t.finance.amountLabel);
          return;
        }
        if (!transactionForm.occurredAt) {
          setFormError(t.finance.dateRequired ?? t.finance.dateLabel);
          return;
        }

        setIsSaving(true);
        setFormError(null);

        try {
          const payload = {
            title: transactionForm.title.trim(),
            amount: parseCurrencyInput(transactionForm.amount),
            currency: transactionForm.currency,
            group: transactionForm.group,
            status: transactionForm.status,
            occurredAt: transactionForm.occurredAt,
            accountId: transactionForm.accountId || null,
            categoryId: transactionForm.categoryId || null,
            tagIds: transactionForm.tagIds,
            description: transactionForm.description.trim() || null,
          };

          const selectedTagNames = tags
            .filter((tag) => payload.tagIds?.includes(tag.id))
            .map((tag) => tag.name);

          const nextDue = transactionForm.occurredAt.slice(0, 10);

          if (editingTransaction) {
            let nextRecurringId = linkedRecurringId;
            if (transactionForm.isRecurring) {
              if (linkedRecurringId) {
                await updateFinanceRecurring({
                  id: linkedRecurringId,
                  title: payload.title,
                  amount: payload.amount,
                  currency: transactionForm.currency,
                  group: payload.group,
                  frequency: transactionForm.recurrenceFrequency,
                  interval: 1,
                  nextDue,
                  accountId: payload.accountId,
                  categoryId: payload.categoryId,
                  tagIds: payload.tagIds,
                });
              } else {
                const created = await createFinanceRecurring({
                  title: payload.title,
                  amount: payload.amount,
                  currency: transactionForm.currency,
                  group: payload.group,
                  frequency: transactionForm.recurrenceFrequency,
                  interval: 1,
                  nextDue,
                  accountId: payload.accountId,
                  categoryId: payload.categoryId,
                  tagIds: payload.tagIds,
                });
                nextRecurringId = created.id;
              }
            } else if (linkedRecurringId) {
              await deleteFinanceRecurring({ id: linkedRecurringId });
              nextRecurringId = null;
            }

            await updateFinanceTransaction({
              id: editingTransaction.id,
              ...payload,
              recurringId: nextRecurringId,
            });
          } else {
            let recurringId: string | null = null;
            if (transactionForm.isRecurring) {
              const created = await createFinanceRecurring({
                title: payload.title,
                amount: payload.amount,
                currency: transactionForm.currency,
                group: payload.group,
                frequency: transactionForm.recurrenceFrequency,
                interval: 1,
                nextDue,
                accountId: payload.accountId,
                categoryId: payload.categoryId,
                tagIds: payload.tagIds,
              });
              recurringId = created.id;
            }

            await createFinanceTransaction({
              ...payload,
              recurringId,
            });

            if (transactionForm.isRecurring && transactionForm.addToCalendar) {
              const startAt = new Date(transactionForm.occurredAt);
              const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
              await createCalendarEvent({
                title: payload.title,
                description: payload.description ?? null,
                startAt: startAt.toISOString(),
                endAt: endAt.toISOString(),
                allDay: false,
                tags: selectedTagNames.length ? selectedTagNames : null,
                recurrence: {
                  frequency: transactionForm.recurrenceFrequency,
                  interval: 1,
                },
              });
            }
          }

          setTransactionModalOpen(false);
          await loadTransactions();
          const updatedRecurring = await listFinanceRecurring();
          setRecurring(updatedRecurring);
          const summary = await getFinanceSummary();
          setSummary(summary);
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.saveError ?? t.finance.loadError);
          }
        } finally {
          setIsSaving(false);
        }
      };

      const handleDeleteTransaction = async (item: FinanceTransaction) => {
        setIsSaving(true);
        setFormError(null);
        try {
          await deleteFinanceTransaction({ id: item.id });
          if (item.recurringId) {
            await deleteFinanceRecurring({ id: item.recurringId });
          }
          await loadTransactions();
          const summary = await getFinanceSummary();
          setSummary(summary);
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.deleteError ?? t.finance.loadError);
          }
        } finally {
          setIsSaving(false);
        }
      };

      const handleCreateTag = async () => {
        const value = tagDraft.trim();
        if (!value) return;
        try {
          const created = await createFinanceTag({ name: value });
          setTags((prev) => [...prev, created]);
          setTransactionForm((prev) => ({
            ...prev,
            tagIds: [...prev.tagIds, created.id],
          }));
          setTagDraft("");
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.tagError ?? t.finance.loadError);
          }
        }
      };

      const handleSuggestedTag = async (name: string) => {
        const existing = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          setTransactionForm((prev) => ({
            ...prev,
            tagIds: prev.tagIds.includes(existing.id)
              ? prev.tagIds.filter((item) => item !== existing.id)
              : [...prev.tagIds, existing.id],
          }));
          return;
        }
        try {
          const created = await createFinanceTag({ name });
          setTags((prev) => [...prev, created]);
          setTransactionForm((prev) => ({
            ...prev,
            tagIds: [...prev.tagIds, created.id],
          }));
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.tagError ?? t.finance.loadError);
          }
        }
      };

      const handleSaveRecurring = async () => {
        if (!recurringForm.title.trim()) {
          setFormError(t.finance.titleRequired ?? t.finance.titleLabel);
          return;
        }
        if (!recurringForm.amount) {
          setFormError(t.finance.amountRequired ?? t.finance.amountLabel);
          return;
        }
        if (!recurringForm.nextDue) {
          setFormError(t.finance.dateRequired ?? t.finance.dateLabel);
          return;
        }

        setIsSaving(true);
        setFormError(null);
        try {
          await createFinanceRecurring({
            title: recurringForm.title.trim(),
            amount: Number(recurringForm.amount),
            group: recurringForm.group,
            frequency: recurringForm.frequency,
            interval: Number(recurringForm.interval) || 1,
            nextDue: recurringForm.nextDue,
            accountId: recurringForm.accountId || null,
            categoryId: recurringForm.categoryId || null,
            tagIds: recurringForm.tagIds,
          });
          setRecurringModalOpen(false);
          const updated = await listFinanceRecurring();
          setRecurring(updated);
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.saveError ?? t.finance.loadError);
          }
        } finally {
          setIsSaving(false);
        }
      };

      const handleCreateCategory = async () => {
        if (!categoryForm.name.trim()) {
          setFormError(t.finance.typeRequired ?? t.finance.typeLabel);
          return;
        }
        setIsSaving(true);
        setFormError(null);
        try {
          const created = await createFinanceCategory({
            name: categoryForm.name.trim(),
            group: categoryForm.group,
          });
          setCategories((prev) => [...prev, created]);
          setCategoryModalOpen(false);
          setCategoryForm({ name: "", group: "EXPENSE" });
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.saveError ?? t.finance.loadError);
          }
        } finally {
          setIsSaving(false);
        }
      };

      const handleCreateAccount = async () => {
        if (!accountForm.name.trim()) {
          setFormError(t.finance.accountRequired ?? t.finance.accountLabel);
          return;
        }
        setIsSaving(true);
        setFormError(null);
        try {
          const created = await createFinanceAccount({
            name: accountForm.name.trim(),
            type: accountForm.type,
            currency: accountForm.currency,
          });
          setAccounts((prev) => [...prev, created]);
          setAccountModalOpen(false);
          setAccountForm({ name: "", type: "BANK", currency: "BRL" });
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.saveError ?? t.finance.loadError);
          }
        } finally {
          setIsSaving(false);
        }
      };

      const handleToggleNotification = async (item: FinanceNotification) => {
        const nextReadAt = item.readAt ? null : new Date().toISOString();
        const updated = await updateFinanceNotification({ id: item.id, readAt: nextReadAt });
        setNotifications((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)));
      };

      const formatCurrency = (value: number, currency: string = "BRL") =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }).format(value);

      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{t.modules.finance}</h2>
              <p className="text-sm text-zinc-600">{t.finance.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                {t.finance.newType}
              </Button>
              <Button variant="secondary" onClick={() => setAccountModalOpen(true)}>
                {t.finance.newAccount ?? t.finance.typeLabel}
              </Button>
              <Button variant="secondary" onClick={() => setRecurringModalOpen(true)}>
                {t.finance.recurringTitle}
              </Button>
              <Button onClick={() => handleOpenTransaction()}>{t.finance.newTransaction}</Button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="grid gap-4 lg:grid-cols-4">
            <Card>
              <p className="text-xs text-zinc-500">{t.finance.summaryIncome}</p>
              <p className="text-2xl font-semibold">
                {summary ? formatCurrency(summary.totalIncome) : "-"}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">{t.finance.summaryExpense}</p>
              <p className="text-2xl font-semibold">
                {summary ? formatCurrency(summary.totalExpense) : "-"}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">{t.finance.summaryNet}</p>
              <p className="text-2xl font-semibold">
                {summary ? formatCurrency(summary.net) : "-"}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">{t.finance.summaryAccounts}</p>
              <p className="text-2xl font-semibold">{summary?.accounts.length ?? 0}</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.finance.monthTitle}
                  </h3>
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {t.finance.monthSummary}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <button
                    type="button"
                    onClick={() => setMonthIndex((current) => Math.max(0, current - 1))}
                    disabled={monthIndex <= 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-sm text-zinc-600 disabled:opacity-40"
                    aria-label="Previous month"
                  >
                    ←
                  </button>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">
                    {activeMonth?.label ?? "-"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMonthIndex((current) => Math.min(monthKeys.length - 1, current + 1))}
                    disabled={monthIndex >= monthKeys.length - 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-sm text-zinc-600 disabled:opacity-40"
                    aria-label="Next month"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  {activeMonth ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeMonth.accounts.map((account) => (
                        <div key={`${activeMonth.key}-${account.id}`} className="rounded-xl border border-[var(--border)] p-3">
                          <p className="text-xs font-semibold text-zinc-600">{account.name}</p>
                          <div className="mt-3 flex items-end gap-3">
                            <div className="flex flex-col items-center gap-2">
                              <div
                                className="w-6 rounded-lg bg-emerald-500"
                                style={{
                                  height: Math.max(10, (account.income / maxBarValue) * 80),
                                }}
                              />
                              <span className="text-[10px] text-zinc-500">{t.finance.groupIncome}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div
                                className="w-6 rounded-lg bg-red-400"
                                style={{
                                  height: Math.max(10, (account.expense / maxBarValue) * 80),
                                }}
                              />
                              <span className="text-[10px] text-zinc-500">{t.finance.groupExpense}</span>
                            </div>
                          </div>
                          <div className="mt-3 text-[10px] text-zinc-500">
                            {formatCurrency(account.income, account.currency)} · {formatCurrency(account.expense, account.currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">{t.finance.empty}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.finance.notificationsTitle}
                  </h3>
                  <p className="text-sm text-zinc-600">{t.finance.notificationsSubtitle}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-zinc-500">{t.finance.notificationsEmpty}</p>
                ) : (
                  notifications.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleNotification(item)}
                      className={`rounded-2xl border px-4 py-3 text-left ${
                        item.readAt ? "border-[var(--border)]" : "border-emerald-400"
                      }`}
                    >
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-zinc-500">{item.message}</p>
                    </button>
                  ))
                )}
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
                  <option value="INCOME">{t.finance.groupIncome}</option>
                  <option value="EXPENSE">{t.finance.groupExpense}</option>
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
                  <option value="all">{t.finance.typeAll}</option>
                  {categories.map((type) => (
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
                  <option value="PAID">{t.finance.statusPaid}</option>
                  <option value="PENDING">{t.finance.statusPending}</option>
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

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.finance.listTitle}
                  </h3>
                  <p className="text-sm text-zinc-600">{t.finance.monthEventsTitle}</p>
                </div>
              </div>

              {isLoading ? (
                <p className="mt-4 text-sm text-zinc-500">{t.finance.loading}</p>
              ) : null}

              {!isLoading && paged.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">{t.finance.empty}</p>
              ) : null}

              <div className="mt-4 grid gap-3">
                {paged.map((item) => {
                  const category = categories.find((type) => type.id === item.categoryId);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {category?.name ?? t.finance.tagsEmpty} · {item.occurredAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {formatCurrency(item.amount, item.currency ?? "BRL")}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {item.status === "PAID"
                            ? t.finance.statusPaid
                            : t.finance.statusPending}
                        </p>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenTransaction(item)}
                          >
                            {t.finance.editAction ?? t.calendar.editAction}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleDeleteTransaction(item)}
                            disabled={isSaving}
                          >
                            {t.finance.deleteAction ?? t.calendar.deleteAction}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
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
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.finance.recurringTitle}
                  </h3>
                  <p className="text-sm text-zinc-600">{t.finance.nextDueLabel}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {recurring.length === 0 ? (
                  <p className="text-sm text-zinc-500">{t.finance.empty}</p>
                ) : (
                  recurring.map((item) => {
                    const category = categories.find((type) => type.id === item.categoryId);
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[var(--border)] px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {item.title}
                          </p>
                          <span className="text-xs text-zinc-500">{item.frequency}</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {category?.name ?? t.finance.tagsEmpty} · {item.nextDue}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                          {formatCurrency(item.amount, item.currency ?? "BRL")}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {transactionModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setTransactionModalOpen(false)}
              />
              <Card className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {editingTransaction ? t.finance.editAction : t.finance.newTransaction}
                    </h3>
                    <Button variant="secondary" onClick={() => setTransactionModalOpen(false)}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Button
                      type="button"
                      variant={transactionTab === "details" ? "primary" : "secondary"}
                      onClick={() => setTransactionTab("details")}
                    >
                      {t.finance.details}
                    </Button>
                    {transactionForm.isRecurring ? (
                      <Button
                        type="button"
                        variant={transactionTab === "recurrence" ? "primary" : "secondary"}
                        onClick={() => setTransactionTab("recurrence")}
                      >
                        {t.finance.recurrenceTabLabel}
                      </Button>
                    ) : null}
                  </div>
                  {transactionTab === "details" ? (
                    <>
                      <Input
                        label={t.finance.titleLabel}
                        value={transactionForm.title}
                        onChange={(event) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2 text-sm text-zinc-600">
                          <span className="font-medium text-zinc-700">{t.finance.amountLabel}</span>
                          <div className="flex items-center gap-2">
                            <input
                              inputMode="numeric"
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
                              value={transactionForm.amount}
                              onChange={(event) => {
                                const digits = event.target.value.replace(/\D/g, "");
                                setTransactionForm((prev) => ({
                                  ...prev,
                                  amount: formatCurrencyInput(digits, prev.currency),
                                }));
                              }}
                            />
                            <select
                              value={transactionForm.currency}
                              onChange={(event) => {
                                const currency = event.target.value as "BRL" | "USD";
                                const digits = transactionForm.amount.replace(/\D/g, "");
                                setTransactionForm((prev) => ({
                                  ...prev,
                                  currency,
                                  amount: formatCurrencyInput(digits, currency),
                                }));
                              }}
                              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm"
                            >
                              <option value="BRL">BRL</option>
                              <option value="USD">USD</option>
                            </select>
                          </div>
                        </div>
                        <Input
                          label={t.finance.dateLabel}
                          type="datetime-local"
                          value={transactionForm.occurredAt}
                          onChange={(event) =>
                            setTransactionForm((prev) => ({
                              ...prev,
                              occurredAt: event.target.value,
                            }))
                          }
                        />
                        <label className="flex flex-col gap-2 text-sm text-zinc-600">
                          {t.finance.groupLabel}
                          <select
                            value={transactionForm.group}
                            onChange={(event) =>
                              setTransactionForm((prev) => ({
                                ...prev,
                                group: event.target.value as "INCOME" | "EXPENSE",
                              }))
                            }
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          >
                            <option value="INCOME">{t.finance.groupIncome}</option>
                            <option value="EXPENSE">{t.finance.groupExpense}</option>
                          </select>
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-zinc-600">
                          {t.finance.statusLabel}
                          <select
                            value={transactionForm.status}
                            onChange={(event) =>
                              setTransactionForm((prev) => ({
                                ...prev,
                                status: event.target.value as "PAID" | "PENDING",
                              }))
                            }
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          >
                            <option value="PAID">{t.finance.statusPaid}</option>
                            <option value="PENDING">{t.finance.statusPending}</option>
                          </select>
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-zinc-600">
                          {t.finance.accountLabel}
                          <select
                            value={transactionForm.accountId}
                            onChange={(event) =>
                              setTransactionForm((prev) => ({
                                ...prev,
                                accountId: event.target.value,
                              }))
                            }
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          >
                            <option value="">{t.finance.accountAll}</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-zinc-600">
                          {t.finance.typeLabel}
                          <select
                            value={transactionForm.categoryId}
                            onChange={(event) =>
                              setTransactionForm((prev) => ({
                                ...prev,
                                categoryId: event.target.value,
                              }))
                            }
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          >
                            <option value="">{t.finance.typeAll}</option>
                            {categories.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <Input
                        label={t.finance.descriptionLabel}
                        value={transactionForm.description}
                        onChange={(event) =>
                          setTransactionForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                      <div className="grid gap-3">
                        <div>
                          <p className="text-sm text-zinc-600">{t.finance.tagsLabel}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tags.length > 0
                              ? tags.map((tag) => (
                                  <Button
                                    key={tag.id}
                                    type="button"
                                    variant={
                                      transactionForm.tagIds.includes(tag.id)
                                        ? "primary"
                                        : "secondary"
                                    }
                                    onClick={() =>
                                      setTransactionForm((prev) => ({
                                        ...prev,
                                        tagIds: prev.tagIds.includes(tag.id)
                                          ? prev.tagIds.filter((item) => item !== tag.id)
                                          : [...prev.tagIds, tag.id],
                                      }))
                                    }
                                  >
                                    {tag.name}
                                  </Button>
                                ))
                              : suggestedTags.map((tag) => (
                                  <Button
                                    key={tag}
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleSuggestedTag(tag)}
                                  >
                                    {tag}
                                  </Button>
                                ))}
                          </div>
                          {tags.length === 0 ? (
                            <p className="mt-2 text-xs text-zinc-500">
                              {t.finance.tagsEmpty}
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Input
                            value={tagDraft}
                            placeholder={t.finance.tagsPlaceholder}
                            onChange={(event) => setTagDraft(event.target.value)}
                          />
                          <Button variant="secondary" onClick={handleCreateTag}>
                            {t.finance.addTagAction}
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm text-zinc-600">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={transactionForm.isRecurring}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setTransactionForm((prev) => ({
                                ...prev,
                                isRecurring: checked,
                                addToCalendar: checked ? prev.addToCalendar : false,
                              }));
                              if (checked) {
                                setTransactionTab("recurrence");
                              } else {
                                setTransactionTab("details");
                              }
                            }}
                          />
                          {t.finance.recurringLabel}
                        </label>
                      </div>
                    </>
                  ) : null}
                  {transactionTab === "recurrence" && transactionForm.isRecurring ? (
                    <div className="grid gap-4 rounded-2xl border border-[var(--border)] px-4 py-4 text-sm text-zinc-600">
                      <label className="flex flex-col gap-2">
                        {t.finance.recurrenceFrequencyLabel}
                        <select
                          value={transactionForm.recurrenceFrequency}
                          onChange={(event) =>
                            setTransactionForm((prev) => ({
                              ...prev,
                              recurrenceFrequency: event.target.value as
                                | "DAILY"
                                | "WEEKLY"
                                | "MONTHLY"
                                | "YEARLY",
                            }))
                          }
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        >
                          <option value="DAILY">{t.finance.cadenceDaily}</option>
                          <option value="WEEKLY">{t.finance.cadenceWeekly}</option>
                          <option value="MONTHLY">{t.finance.cadenceMonthly}</option>
                          <option value="YEARLY">{t.finance.cadenceYearly}</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={transactionForm.addToCalendar}
                          onChange={(event) =>
                            setTransactionForm((prev) => ({
                              ...prev,
                              addToCalendar: event.target.checked,
                            }))
                          }
                        />
                        {t.finance.addToCalendarLabel}
                      </label>
                    </div>
                  ) : null}
                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setTransactionModalOpen(false)}>
                      {t.finance.cancel}
                    </Button>
                    <Button onClick={handleSaveTransaction} disabled={isSaving}>
                      {isSaving ? t.finance.saving : t.finance.save}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {recurringModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setRecurringModalOpen(false)}
              />
              <Card className="relative z-10 w-full max-w-xl">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.finance.recurringTitle}</h3>
                    <Button variant="secondary" onClick={() => setRecurringModalOpen(false)}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>
                  <Input
                    label={t.finance.titleLabel}
                    value={recurringForm.title}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      label={t.finance.amountLabel}
                      value={recurringForm.amount}
                      onChange={(event) =>
                        setRecurringForm((prev) => ({
                          ...prev,
                          amount: event.target.value,
                        }))
                      }
                    />
                    <Input
                      label={t.finance.nextDueLabel}
                      type="date"
                      value={recurringForm.nextDue}
                      onChange={(event) =>
                        setRecurringForm((prev) => ({
                          ...prev,
                          nextDue: event.target.value,
                        }))
                      }
                    />
                    <label className="flex flex-col gap-2 text-sm text-zinc-600">
                      {t.finance.groupLabel}
                      <select
                        value={recurringForm.group}
                        onChange={(event) =>
                          setRecurringForm((prev) => ({
                            ...prev,
                            group: event.target.value as "INCOME" | "EXPENSE",
                          }))
                        }
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      >
                        <option value="INCOME">{t.finance.groupIncome}</option>
                        <option value="EXPENSE">{t.finance.groupExpense}</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-600">
                      {t.finance.recurrenceFrequencyLabel}
                      <select
                        value={recurringForm.frequency}
                        onChange={(event) =>
                          setRecurringForm((prev) => ({
                            ...prev,
                            frequency: event.target.value as
                              | "DAILY"
                              | "WEEKLY"
                              | "MONTHLY"
                              | "YEARLY",
                          }))
                        }
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </label>
                  </div>
                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setRecurringModalOpen(false)}>
                      {t.finance.cancel}
                    </Button>
                    <Button onClick={handleSaveRecurring} disabled={isSaving}>
                      {isSaving ? t.finance.saving : t.finance.save}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {categoryModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setCategoryModalOpen(false)}
              />
              <Card className="relative z-10 w-full max-w-lg">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.finance.newType}</h3>
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>
                  <Input
                    label={t.finance.typeLabel}
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.finance.groupLabel}
                    <select
                      value={categoryForm.group}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          group: event.target.value as "INCOME" | "EXPENSE",
                        }))
                      }
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="INCOME">{t.finance.groupIncome}</option>
                      <option value="EXPENSE">{t.finance.groupExpense}</option>
                    </select>
                  </label>
                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>
                      {t.finance.cancel}
                    </Button>
                    <Button onClick={handleCreateCategory} disabled={isSaving}>
                      {isSaving ? t.finance.saving : t.finance.save}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {accountModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setAccountModalOpen(false)}
              />
              <Card className="relative z-10 w-full max-w-lg">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.finance.newAccount ?? t.finance.accountLabel}</h3>
                    <Button variant="secondary" onClick={() => setAccountModalOpen(false)}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>
                  <Input
                    label={t.finance.accountLabel}
                    value={accountForm.name}
                    onChange={(event) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.finance.accountTypeLabel}
                    <select
                      value={accountForm.type}
                      onChange={(event) =>
                        setAccountForm((prev) => ({
                          ...prev,
                          type: event.target.value as "CASH" | "BANK" | "CARD",
                        }))
                      }
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="BANK">Bank</option>
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                    </select>
                  </label>
                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setAccountModalOpen(false)}>
                      {t.finance.cancel}
                    </Button>
                    <Button onClick={handleCreateAccount} disabled={isSaving}>
                      {isSaving ? t.finance.saving : t.finance.save}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      );
    }

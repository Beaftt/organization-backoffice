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
  createFinancePaymentMethod,
  createFinanceRecurring,
  createFinanceTag,
  createFinanceTransaction,
  deleteFinanceRecurring,
  deleteFinanceTransaction,
  deleteFinanceAccount,
  deleteFinancePaymentMethod,
  getFinanceCardBill,
  listFinanceAccounts,
  listFinanceCategories,
  listFinancePaymentMethods,
  listFinanceRecurring,
  listFinanceTags,
  listFinanceTransactions,
  payFinanceCardBill,
  toggleFinanceRecurring,
  updateFinanceAccount,
  updateFinancePaymentMethod,
  updateFinanceRecurring,
  updateFinanceTransaction,
  type FinanceCardBill,
  type FinanceAccount,
  type FinanceCategory,
  type FinancePaymentMethod,
  type FinancePaymentMethodType,
  type FinanceRecurring,
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
  const chartMonthRange = 6;
  const [query, setQuery] = useState(initialQuery);
  const [groupFilter, setGroupFilter] = useState(initialGroup);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<FinancePaymentMethod[]>([]);
  const [cardBills, setCardBills] = useState<Record<string, FinanceCardBill>>({});
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [recurring, setRecurring] = useState<FinanceRecurring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionTab, setTransactionTab] = useState<"details" | "recurrence">("details");
  const [linkedRecurringId, setLinkedRecurringId] = useState<string | null>(null);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<FinancePaymentMethod | null>(null);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billTarget, setBillTarget] = useState<FinancePaymentMethod | null>(null);
  const [billAmount, setBillAmount] = useState("");
  const [cardDetailOpen, setCardDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FinancePaymentMethod | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    title: "",
    amount: "",
    currency: "BRL" as "BRL" | "USD",
    group: "INCOME" as "INCOME" | "EXPENSE",
    status: "PAID" as "PAID" | "PENDING",
    occurredAt: "",
    accountId: "",
    paymentMethodId: "",
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
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    name: "",
    type: "CREDIT" as FinancePaymentMethodType,
    accountId: "",
    currency: "BRL",
    limit: "",
    closingDay: "",
    dueDay: "",
    balance: "",
  });
  const [tagDraft, setTagDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cardMonthIndex, setCardMonthIndex] = useState(() => chartMonthRange - 1);

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

      const loadCardBills = useCallback(async (methods: FinancePaymentMethod[]) => {
        const creditMethods = methods.filter((method) => method.type === "CREDIT");
        if (creditMethods.length === 0) {
          setCardBills({});
          return;
        }
        const results = await Promise.allSettled(
          creditMethods.map((method) =>
            getFinanceCardBill({ paymentMethodId: method.id }),
          ),
        );
        const map: Record<string, FinanceCardBill> = {};
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            map[creditMethods[index].id] = result.value;
          }
        });
        setCardBills(map);
      }, []);

      const loadBase = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [
            tagsResult,
            categoriesResult,
            accountsResult,
            paymentMethodsResult,
            recurringResult,
          ] = await Promise.all([
            listFinanceTags(),
            listFinanceCategories(),
            listFinanceAccounts(),
            listFinancePaymentMethods(),
            listFinanceRecurring(),
          ]);

          setTags(tagsResult);
          setCategories(categoriesResult);
          setAccounts(accountsResult);
          setPaymentMethods(paymentMethodsResult);
          setRecurring(recurringResult);
          void loadCardBills(paymentMethodsResult);
        } catch (err) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError(t.finance.loadError);
          }
        } finally {
          setIsLoading(false);
        }
      }, [loadCardBills, t]);

      useEffect(() => {
        void loadCardBills(paymentMethods);
      }, [loadCardBills, paymentMethods]);

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

      const visibleCount = page * pageSize;
      const paged = sortedTransactions.slice(0, visibleCount);
      const hasMoreTransactions = visibleCount < sortedTransactions.length;

      const cardMethods = useMemo(
        () => paymentMethods.filter((method) => method.type !== "INVEST"),
        [paymentMethods],
      );

      const cardMonthKeys = useMemo(() => {
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
        setCardMonthIndex((current) => {
          if (current < 0) return 0;
          if (current > cardMonthKeys.length - 1) return cardMonthKeys.length - 1;
          return current;
        });
      }, [cardMonthKeys.length]);

      const selectedCardTransactions = useMemo(() => {
        if (!selectedCard) return [];
        return transactions.filter((transaction) => transaction.paymentMethodId === selectedCard.id);
      }, [selectedCard, transactions]);

      const cardMonthlyTotals = useMemo(() => {
        const monthMap = new Map(
          cardMonthKeys.map((key) => [key, { income: 0, expense: 0 }]),
        );

        selectedCardTransactions.forEach((transaction) => {
          const monthKey = transaction.occurredAt.slice(0, 7);
          const monthBucket = monthMap.get(monthKey);
          if (!monthBucket) return;

          if (transaction.group === "INCOME") {
            monthBucket.income += transaction.amount;
          } else {
            monthBucket.expense += transaction.amount;
          }
        });

        return cardMonthKeys.map((key) => {
          const monthDate = new Date(`${key}-01T00:00:00`);
          const label = monthDate.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          });
          const totals = monthMap.get(key) ?? { income: 0, expense: 0 };
          return { key, label, ...totals };
        });
      }, [cardMonthKeys, selectedCardTransactions]);

      const activeCardMonth = cardMonthlyTotals[cardMonthIndex];

      const activeCardTransactions = useMemo(() => {
        if (!selectedCard) return [];
        const activeKey = cardMonthKeys[cardMonthIndex];
        if (!activeKey) return [];
        return selectedCardTransactions.filter((transaction) =>
          transaction.occurredAt.startsWith(activeKey),
        );
      }, [cardMonthIndex, cardMonthKeys, selectedCard, selectedCardTransactions]);

      const cardMaxValue = useMemo(() => {
        let max = 0;
        cardMonthlyTotals.forEach((month) => {
          max = Math.max(max, month.income, month.expense);
        });
        return max || 1;
      }, [cardMonthlyTotals]);

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

      const dateFromDay = (day?: number | null) => {
        if (!day) return "";
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear());
        const dayValue = String(day).padStart(2, "0");
        return `${year}-${month}-${dayValue}`;
      };

      const dayFromDateString = (value: string) => {
        if (!value) return null;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return null;
        return parsed.getDate();
      };

      const shiftRecurringDate = (
        value: string,
        frequency: FinanceRecurring["frequency"],
        interval: number,
      ) => {
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        switch (frequency) {
          case "DAILY":
            date.setUTCDate(date.getUTCDate() + interval);
            break;
          case "WEEKLY":
            date.setUTCDate(date.getUTCDate() + interval * 7);
            break;
          case "MONTHLY":
            date.setUTCMonth(date.getUTCMonth() + interval);
            break;
          case "YEARLY":
            date.setUTCFullYear(date.getUTCFullYear() + interval);
            break;
          default:
            break;
        }
        return date.toISOString().slice(0, 10);
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
          paymentMethodId: item?.paymentMethodId ?? "",
          categoryId: item?.categoryId ?? "",
          tagIds: item?.tagIds ?? [],
          description: item?.description ?? "",
          isRecurring: Boolean(matchedRecurring ?? item?.recurringId),
          addToCalendar: false,
          recurrenceFrequency: matchedRecurring?.frequency ?? "MONTHLY",
        });
        setTransactionModalOpen(true);
      };

      const handleOpenBill = (method: FinancePaymentMethod) => {
        setBillTarget(method);
        setBillAmount("");
        setBillModalOpen(true);
      };

      const handleOpenCardDetails = (method: FinancePaymentMethod) => {
        setSelectedCard(method);
        setCardMonthIndex(cardMonthKeys.length - 1);
        setCardDetailOpen(true);
      };

      const handleCloseCardDetails = () => {
        setCardDetailOpen(false);
        setSelectedCard(null);
      };

      const handlePayBill = async () => {
        if (!billTarget) return;
        const amount = billAmount ? parseCurrencyInput(billAmount) : undefined;
        try {
          const updated = await payFinanceCardBill({
            paymentMethodId: billTarget.id,
            amount,
            paidAt: new Date().toISOString().slice(0, 10),
          });
          setCardBills((prev) => ({ ...prev, [billTarget.id]: updated }));
          setBillModalOpen(false);
          await loadBase();
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.saveError);
          }
        }
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
            paymentMethodId: transactionForm.paymentMethodId || null,
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

      const handleOpenAccount = (account?: FinanceAccount) => {
        setFormError(null);
        if (account) {
          setEditingAccount(account);
          setAccountForm({
            name: account.name,
            type: account.type,
            currency: account.currency ?? "BRL",
          });
        } else {
          setEditingAccount(null);
          setAccountForm({ name: "", type: "BANK", currency: "BRL" });
        }
        setAccountModalOpen(true);
      };

      const handleSaveAccount = async () => {
        if (!accountForm.name.trim()) {
          setFormError(t.finance.accountRequired ?? t.finance.accountLabel);
          return;
        }
        setIsSaving(true);
        setFormError(null);
        try {
          if (editingAccount) {
            const updated = await updateFinanceAccount({
              id: editingAccount.id,
              name: accountForm.name.trim(),
              type: accountForm.type,
              currency: accountForm.currency,
            });
            setAccounts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          } else {
            const created = await createFinanceAccount({
              name: accountForm.name.trim(),
              type: accountForm.type,
              currency: accountForm.currency,
            });
            setAccounts((prev) => [...prev, created]);
          }
          setAccountModalOpen(false);
          setEditingAccount(null);
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

      const handleDeleteAccount = async (account: FinanceAccount) => {
        const confirmed = window.confirm(
          t.finance.deleteAccountConfirm ?? "Deseja excluir esta conta?",
        );
        if (!confirmed) return;
        setIsSaving(true);
        setFormError(null);
        try {
          await deleteFinanceAccount({ id: account.id });
          setAccounts((prev) => prev.filter((item) => item.id !== account.id));
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

      const handleOpenPaymentMethod = (method?: FinancePaymentMethod) => {
        setFormError(null);
        if (method) {
          setEditingPaymentMethod(method);
          setPaymentMethodForm({
            name: method.name,
            type: method.type,
            accountId: method.accountId ?? "",
            currency: method.currency ?? "BRL",
            limit: method.limit
              ? formatCurrencyInput(String(Math.round(method.limit * 100)), method.currency ?? "BRL")
              : "",
            closingDay: dateFromDay(method.closingDay),
            dueDay: dateFromDay(method.dueDay),
            balance: method.balance != null ? String(method.balance) : "",
          });
        } else {
          setEditingPaymentMethod(null);
          setPaymentMethodForm({
            name: "",
            type: "CREDIT",
            accountId: "",
            currency: "BRL",
            limit: "",
            closingDay: "",
            dueDay: "",
            balance: "",
          });
        }
        setPaymentMethodModalOpen(true);
      };

      const handleSavePaymentMethod = async () => {
        if (!paymentMethodForm.name.trim()) {
          setFormError(t.finance.paymentMethodNameRequired ?? t.finance.paymentMethodNameLabel ?? t.finance.titleLabel);
          return;
        }
        setIsSaving(true);
        setFormError(null);
        const parsedLimit = paymentMethodForm.limit ? parseCurrencyInput(paymentMethodForm.limit) : null;
        const parsedClosing = dayFromDateString(paymentMethodForm.closingDay);
        const parsedDue = dayFromDateString(paymentMethodForm.dueDay);
        const parsedBalance = paymentMethodForm.balance ? Number(paymentMethodForm.balance) : null;
        try {
          if (editingPaymentMethod) {
            const updated = await updateFinancePaymentMethod({
              id: editingPaymentMethod.id,
              name: paymentMethodForm.name.trim(),
              type: paymentMethodForm.type,
              accountId: paymentMethodForm.accountId || null,
              currency: paymentMethodForm.currency,
              limit: parsedLimit,
              closingDay: parsedClosing,
              dueDay: parsedDue,
              balance: parsedBalance,
            });
            setPaymentMethods((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item)),
            );
          } else {
            const created = await createFinancePaymentMethod({
              name: paymentMethodForm.name.trim(),
              type: paymentMethodForm.type,
              accountId: paymentMethodForm.accountId || null,
              currency: paymentMethodForm.currency,
              limit: parsedLimit,
              closingDay: parsedClosing,
              dueDay: parsedDue,
              balance: parsedBalance,
            });
            setPaymentMethods((prev) => [...prev, created]);
          }
          setPaymentMethodModalOpen(false);
          setEditingPaymentMethod(null);
          setPaymentMethodForm({
            name: "",
            type: "CREDIT",
            accountId: "",
            currency: "BRL",
            limit: "",
            closingDay: "",
            dueDay: "",
            balance: "",
          });
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

      const handleDeletePaymentMethod = async (method: FinancePaymentMethod) => {
        const confirmed = window.confirm(
          t.finance.deletePaymentMethodConfirm ?? "Deseja excluir este cartão?",
        );
        if (!confirmed) return;
        setIsSaving(true);
        setFormError(null);
        try {
          await deleteFinancePaymentMethod({ id: method.id });
          setPaymentMethods((prev) => prev.filter((item) => item.id !== method.id));
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

      const handleToggleRecurringPayment = async (item: FinanceRecurring, paid: boolean) => {
        setIsSaving(true);
        setFormError(null);
        try {
          await toggleFinanceRecurring({ id: item.id, paid });
          await loadBase();
          await loadTransactions();
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
              <Button variant="secondary" onClick={() => handleOpenAccount()}>
                {t.finance.newAccount ?? t.finance.typeLabel}
              </Button>
              <Button variant="secondary" onClick={() => handleOpenPaymentMethod()}>
                {t.finance.paymentMethodAdd ?? t.finance.paymentMethodsTitle ?? "Novo cartão"}
              </Button>
              <Button variant="secondary" onClick={() => setRecurringModalOpen(true)}>
                {t.finance.recurringTitle}
              </Button>
              <Button onClick={() => handleOpenTransaction()}>{t.finance.newTransaction}</Button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.finance.accountsTitle ?? t.finance.accountLabel ?? "Contas"}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    {t.finance.accountsSubtitle ?? "Total"}: {accounts.length}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => handleOpenAccount()}>
                  {t.finance.newAccount ?? t.finance.accountLabel}
                </Button>
              </div>
              <div className="mt-4 grid gap-3">
                {accounts.length === 0 ? (
                  <p className="text-sm text-zinc-500">{t.finance.empty}</p>
                ) : (
                  accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {account.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {account.type} · {account.currency ?? "BRL"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => handleOpenAccount(account)}>
                          {t.finance.editAction ?? t.calendar.editAction}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDeleteAccount(account)}
                          disabled={isSaving}
                        >
                          {t.finance.deleteAction ?? t.calendar.deleteAction}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.finance.paymentMethodsTitle ?? "Cartões"}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    {t.finance.cardsSubtitle ?? "Total"}: {paymentMethods.length}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => handleOpenPaymentMethod()}>
                  {t.finance.paymentMethodAdd ?? "Adicionar"}
                </Button>
              </div>
              <div className="mt-4 grid gap-3">
                {paymentMethods.length === 0 ? (
                  <p className="text-sm text-zinc-500">{t.finance.paymentMethodEmpty ?? t.finance.empty}</p>
                ) : (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {method.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {method.type} · {method.currency ?? "BRL"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => handleOpenPaymentMethod(method)}>
                          {t.finance.editAction ?? t.calendar.editAction}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDeletePaymentMethod(method)}
                          disabled={isSaving}
                        >
                          {t.finance.deleteAction ?? t.calendar.deleteAction}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.finance.cardsTitle ?? "Cartões"}
                </h3>
                <p className="text-sm text-zinc-600">
                  {t.finance.cardsSubtitle ?? "Selecione um cartão para ver detalhes"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {cardMethods.length === 0 ? (
                <p className="text-sm text-zinc-500">{t.finance.empty}</p>
              ) : (
                cardMethods.map((method) => {
                  const bill = cardBills[method.id];
                  const typeLabel =
                    method.type === "CREDIT"
                      ? t.finance.paymentMethodCredit ?? "Crédito"
                      : method.type === "DEBIT"
                        ? t.finance.paymentMethodDebit ?? "Débito"
                        : method.type === "PIX"
                          ? t.finance.paymentMethodPix ?? "Pix"
                          : t.finance.paymentMethodCard ?? "Cartão";

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleOpenCardDetails(method)}
                      className="min-w-[240px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-zinc-400"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {method.name}
                        </p>
                        <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] text-zinc-500">
                          {typeLabel}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-zinc-500">
                        {t.finance.balanceLabel ?? "Saldo"}: {" "}
                        {formatCurrency(method.balance ?? 0, method.currency)}
                      </p>
                      {method.type === "CREDIT" ? (
                        <p className="mt-1 text-xs text-zinc-500">
                          {t.finance.billRemaining ?? "Saldo da fatura"}: {" "}
                          {bill ? formatCurrency(bill.remainingAmount, method.currency) : "-"}
                        </p>
                      ) : null}
                      {method.type === "CREDIT" && bill?.bill.dueDate ? (
                        <p className="mt-1 text-xs text-zinc-500">
                          {t.finance.billDue ?? "Vencimento"}: {bill.bill.dueDate}
                        </p>
                      ) : null}
                    </button>
                  );
                })
              )}
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
                  const interval = item.interval ?? 1;
                  const previousDue = shiftRecurringDate(item.nextDue, item.frequency, -interval);
                  const isPaid = transactions.some(
                    (entry) => entry.recurringId === item.id && entry.occurredAt === previousDue,
                  );
                  const displayDue = isPaid ? previousDue : item.nextDue;
                  return (
                    <div
                      key={item.id}
                      className="list-item-animate rounded-2xl border border-[var(--border)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={isPaid}
                              onChange={(event) =>
                                handleToggleRecurringPayment(item, event.target.checked)
                              }
                              disabled={isSaving}
                            />
                          </label>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {item.title}
                          </p>
                        </div>
                        <span className="text-xs text-zinc-500">{item.frequency}</span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {category?.name ?? t.finance.tagsEmpty} · {displayDue}
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
                      className="list-item-animate flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] px-4 py-3"
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
                  {t.finance.showing ?? "Exibindo"} {paged.length} {t.finance.of ?? "de"} {sortedTransactions.length}
                </span>
                {hasMoreTransactions ? (
                  <Button variant="secondary" onClick={() => setPage((prev) => prev + 1)}>
                    {t.finance.loadMore ?? "Carregar mais"}
                  </Button>
                ) : null}
              </div>
            </Card>

          {transactionModalOpen ? (
            <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setTransactionModalOpen(false)}
              />
              <Card className="modal-content relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
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
                          {t.finance.methodLabel}
                          <select
                            value={transactionForm.paymentMethodId}
                            onChange={(event) => {
                              const value = event.target.value;
                              const selected = paymentMethods.find(
                                (method) => method.id === value,
                              );
                              setTransactionForm((prev) => ({
                                ...prev,
                                paymentMethodId: value,
                                accountId: selected?.accountId ?? prev.accountId,
                              }));
                            }}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          >
                            <option value="">{t.finance.none}</option>
                            {paymentMethods
                              .filter((method) => method.type !== "INVEST")
                              .map((method) => (
                                <option key={method.id} value={method.id}>
                                  {method.name}
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

          {cardDetailOpen && selectedCard ? (
            <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={handleCloseCardDetails}
              />
              <Card className="modal-content relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedCard.name}</h3>
                      <p className="text-sm text-zinc-600">
                        {t.finance.cardDetailsTitle ?? "Detalhes do cartão"}
                      </p>
                    </div>
                    <Button variant="secondary" onClick={handleCloseCardDetails}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>

                  {selectedCard.type === "CREDIT" ? (
                    <div className="rounded-2xl border border-[var(--border)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-zinc-500">
                            {t.finance.billRemaining ?? "Saldo da fatura"}
                          </p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(
                              cardBills[selectedCard.id]?.remainingAmount ?? 0,
                              selectedCard.currency,
                            )}
                          </p>
                          {cardBills[selectedCard.id]?.bill.dueDate ? (
                            <p className="text-xs text-zinc-500">
                              {t.finance.billDue ?? "Vencimento"}: {" "}
                              {cardBills[selectedCard.id]?.bill.dueDate}
                            </p>
                          ) : null}
                        </div>
                        <Button variant="secondary" onClick={() => handleOpenBill(selectedCard)}>
                          {t.finance.billPay ?? "Pagar"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-[var(--border)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.finance.monthTitle ?? "Mês"}
                        </p>
                        <p className="text-sm text-zinc-600">
                          {t.finance.cardTransactionsTitle ?? "Movimentações"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <button
                          type="button"
                          onClick={() => setCardMonthIndex((current) => Math.max(0, current - 1))}
                          disabled={cardMonthIndex <= 0}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-sm text-zinc-600 disabled:opacity-40"
                          aria-label="Previous month"
                        >
                          ←
                        </button>
                        <span className="rounded-full border border-[var(--border)] px-3 py-1">
                          {activeCardMonth?.label ?? "-"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCardMonthIndex((current) =>
                              Math.min(cardMonthKeys.length - 1, current + 1),
                            )
                          }
                          disabled={cardMonthIndex >= cardMonthKeys.length - 1}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-sm text-zinc-600 disabled:opacity-40"
                          aria-label="Next month"
                        >
                          →
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-4 overflow-x-auto pb-2">
                      {cardMonthlyTotals.map((month) => (
                        <div key={month.key} className="flex min-w-[72px] flex-col items-center gap-2">
                          <div className="flex items-end gap-1">
                            <div
                              className="w-3 rounded-full bg-emerald-500"
                              style={{
                                height: Math.max(8, (month.income / cardMaxValue) * 80),
                              }}
                            />
                            <div
                              className="w-3 rounded-full bg-red-400"
                              style={{
                                height: Math.max(8, (month.expense / cardMaxValue) * 80),
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-500">{month.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-zinc-500">
                      {t.finance.groupIncome}: {" "}
                      {formatCurrency(activeCardMonth?.income ?? 0, selectedCard.currency)} · {" "}
                      {t.finance.groupExpense}: {" "}
                      {formatCurrency(activeCardMonth?.expense ?? 0, selectedCard.currency)}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <h4 className="text-sm font-semibold">
                        {t.finance.cardTransactionsTitle ?? "Transações do mês"}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {t.finance.cardTransactionsSubtitle ?? "Detalhes do período selecionado"}
                      </p>
                    </div>
                    {activeCardTransactions.length === 0 ? (
                      <p className="text-sm text-zinc-500">
                        {t.finance.cardTransactionsEmpty ?? t.finance.empty}
                      </p>
                    ) : (
                      activeCardTransactions.map((item) => {
                        const category = categories.find((type) => type.id === item.categoryId);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[var(--foreground)]">
                                {item.title}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {category?.name ?? t.finance.tagsEmpty} · {item.occurredAt}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {formatCurrency(item.amount, item.currency ?? selectedCard.currency)}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {recurringModalOpen ? (
            <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setRecurringModalOpen(false)}
              />
              <Card className="modal-content relative z-10 w-full max-w-xl">
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
            <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setCategoryModalOpen(false)}
              />
              <Card className="modal-content relative z-10 w-full max-w-lg">
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
            <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setAccountModalOpen(false)}
              />
              <Card className="modal-content relative z-10 w-full max-w-lg">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {editingAccount ? t.finance.editAction ?? t.calendar.editAction : t.finance.newAccount ?? t.finance.accountLabel}
                    </h3>
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
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.finance.currencyLabel ?? "Moeda"}
                    <select
                      value={accountForm.currency}
                      onChange={(event) =>
                        setAccountForm((prev) => ({
                          ...prev,
                          currency: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="BRL">BRL</option>
                      <option value="USD">USD</option>
                    </select>
                  </label>
                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  <div className="flex flex-wrap justify-end gap-2">
                    {editingAccount ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleDeleteAccount(editingAccount)}
                        disabled={isSaving}
                      >
                        {t.finance.deleteAction ?? t.calendar.deleteAction}
                      </Button>
                    ) : null}
                    <Button variant="secondary" onClick={() => setAccountModalOpen(false)}>
                      {t.finance.cancel}
                    </Button>
                    <Button onClick={handleSaveAccount} disabled={isSaving}>
                      {isSaving ? t.finance.saving : t.finance.save}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {paymentMethodModalOpen ? (
            <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setPaymentMethodModalOpen(false)}
              />
              <Card className="modal-content relative z-10 w-full max-w-2xl">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {editingPaymentMethod
                        ? t.finance.editAction ?? t.calendar.editAction
                        : t.finance.paymentMethodTitle ?? t.finance.paymentMethodsTitle ?? "Novo cartão"}
                    </h3>
                    <Button variant="secondary" onClick={() => setPaymentMethodModalOpen(false)}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>
                  <Input
                    label={t.finance.paymentMethodNameLabel ?? t.finance.titleLabel}
                    value={paymentMethodForm.name}
                    onChange={(event) =>
                      setPaymentMethodForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-zinc-600">
                      {t.finance.paymentMethodTypeLabel ?? t.finance.typeLabel}
                      <select
                        value={paymentMethodForm.type}
                        onChange={(event) =>
                          setPaymentMethodForm((prev) => ({
                            ...prev,
                            type: event.target.value as FinancePaymentMethodType,
                          }))
                        }
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      >
                        <option value="CREDIT">{t.finance.paymentMethodCredit ?? "Crédito"}</option>
                        <option value="DEBIT">{t.finance.paymentMethodDebit ?? "Débito"}</option>
                        <option value="PIX">{t.finance.paymentMethodPix ?? "Pix"}</option>
                        <option value="INVEST">{t.finance.paymentMethodInvest ?? "Investimento"}</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-600">
                      {t.finance.paymentMethodAccountLabel ?? t.finance.accountLabel}
                      <select
                        value={paymentMethodForm.accountId}
                        onChange={(event) =>
                          setPaymentMethodForm((prev) => ({
                            ...prev,
                            accountId: event.target.value,
                          }))
                        }
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      >
                        <option value="">{t.finance.none}</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-600">
                      {t.finance.currencyLabel ?? "Moeda"}
                      <select
                        value={paymentMethodForm.currency}
                        onChange={(event) =>
                          setPaymentMethodForm((prev) => ({
                            ...prev,
                            currency: event.target.value,
                          }))
                        }
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      >
                        <option value="BRL">BRL</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                    <Input
                      label={t.finance.balanceLabel ?? "Saldo"}
                      value={paymentMethodForm.balance}
                      onChange={(event) =>
                        setPaymentMethodForm((prev) => ({
                          ...prev,
                          balance: event.target.value,
                        }))
                      }
                    />
                  </div>

                  {paymentMethodForm.type === "CREDIT" ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      <Input
                        label={t.finance.paymentMethodLimitLabel ?? "Limite"}
                        value={paymentMethodForm.limit}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "");
                          setPaymentMethodForm((prev) => ({
                            ...prev,
                            limit: formatCurrencyInput(digits, prev.currency),
                          }));
                        }}
                      />
                      <Input
                        label={t.finance.paymentMethodClosingDayLabel ?? "Fechamento"}
                        type="date"
                        value={paymentMethodForm.closingDay}
                        onChange={(event) =>
                          setPaymentMethodForm((prev) => ({
                            ...prev,
                            closingDay: event.target.value,
                          }))
                        }
                      />
                      <Input
                        label={t.finance.paymentMethodDueDayLabel ?? "Vencimento"}
                        type="date"
                        value={paymentMethodForm.dueDay}
                        onChange={(event) =>
                          setPaymentMethodForm((prev) => ({
                            ...prev,
                            dueDay: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ) : null}

                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  <div className="flex flex-wrap justify-end gap-2">
                    {editingPaymentMethod ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleDeletePaymentMethod(editingPaymentMethod)}
                        disabled={isSaving}
                      >
                        {t.finance.deleteAction ?? t.calendar.deleteAction}
                      </Button>
                    ) : null}
                    <Button variant="secondary" onClick={() => setPaymentMethodModalOpen(false)}>
                      {t.finance.cancel}
                    </Button>
                    <Button onClick={handleSavePaymentMethod} disabled={isSaving}>
                      {isSaving ? t.finance.saving : t.finance.save}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {billModalOpen ? (
            <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setBillModalOpen(false)}
              />
              <Card className="modal-content relative z-10 w-full max-w-lg">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {t.finance.billTitle ?? "Pagamento de fatura"}
                    </h3>
                    <Button variant="secondary" onClick={() => setBillModalOpen(false)}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>
                  {billTarget ? (
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {billTarget.name}
                      </p>
                      {cardBills[billTarget.id] ? (
                        <p className="text-xs text-zinc-500">
                          {t.finance.billRemaining ?? "Saldo"}: {" "}
                          {formatCurrency(
                            cardBills[billTarget.id].remainingAmount,
                            billTarget.currency,
                          )}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <Input
                    label={t.finance.billAmountLabel ?? t.finance.amountLabel}
                    value={billAmount}
                    onChange={(event) => setBillAmount(event.target.value)}
                  />
                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setBillModalOpen(false)}>
                      {t.finance.cancel}
                    </Button>
                    <Button onClick={handlePayBill} disabled={isSaving}>
                      {t.finance.billPay ?? t.finance.save}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

        </div>
      );
    }

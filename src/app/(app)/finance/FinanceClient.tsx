"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useFinanceCompatibilityRouteState } from '@/components/finance/hooks/useFinanceCompatibilityRouteState';
import { FinanceStatsRow } from "@/components/finance/FinanceStatsRow";
import { RecurringBillsChecklist } from "@/components/finance/RecurringBillsChecklist";
import { FinanceCategoriesPanel } from "@/components/finance/FinanceCategoriesPanel";
import { FinanceTransactionsWorkspace } from "@/components/finance/entries/FinanceTransactionsWorkspace";
import { FinanceModeHeader } from "@/components/finance/scaffold/FinanceModeHeader";
import { FinancePageRail } from "@/components/finance/scaffold/FinancePageRail";
import { AccountsList } from "@/components/finance/accounts/AccountsList";
import { InvestmentsSection } from "@/components/finance/payment-methods/InvestmentsSection";
import { CardsSection } from "@/components/finance/payment-methods/CardsSection";
import { AccountDrawer } from "@/components/finance/drawers/AccountDrawer";
import { PaymentMethodDrawer } from "@/components/finance/drawers/PaymentMethodDrawer";
import { TypeDrawer } from "@/components/finance/drawers/TypeDrawer";
import { TagDrawer } from "@/components/finance/drawers/TagDrawer";
import { ManageRecordsModal } from "@/components/finance/drawers/ManageRecordsModal";
import { ApiError } from "@/lib/api/client";
import {
  loadFinanceBaseSnapshot,
  loadFinanceCardBillsSnapshot,
  loadFinanceTransactionsSnapshot,
  payFinanceCardBillAction,
  runFinanceInvestmentMovement,
} from '@/lib/finance/finance-action-adapter';
import type {
  FinanceCompatibilitySurface,
  FinanceRouteState,
} from '@/lib/navigation/finance-route-state';
import { getWorkspaceId } from "@/lib/storage/workspace";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { getMyProfile } from "@/lib/api/user-profile";
import {
  createFinanceAccount,
  createFinanceCategory,
  createFinancePaymentMethod,
  createFinanceRecurring,
  createFinanceTag,
  deleteFinanceCategory,
  deleteFinanceTag,
  deleteFinanceAccount,
  deleteFinancePaymentMethod,
  listFinanceRecurring,
  toggleFinanceRecurring,
  updateFinanceAccount,
  updateFinanceCategory,
  updateFinancePaymentMethod,
  updateFinanceTag,
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

type FinanceClientProps = {
  initialRouteState?: FinanceRouteState;
  surface?: FinanceCompatibilitySurface;
};

export default function FinanceClient({
  initialRouteState,
  surface = 'legacy',
}: FinanceClientProps) {
  const { t, language } = useLanguage();
  const chartMonthRange = 6;
  const chartFutureRange = 6;
  const {
    activeTab,
    groupFilter,
    handleMonthNext,
    handleMonthPrev,
    handleMonthReset,
    page,
    query,
    selectedMonth,
    selectedYear,
    setActiveTab,
    setGroupFilter,
    setPage,
    setQuery,
    setSortBy,
    setStatusFilter,
    setTypeFilter,
    sortBy,
    statusFilter,
    typeFilter,
  } = useFinanceCompatibilityRouteState({
    surface,
    initialRouteState,
  });

  const now = new Date();

  const dateFrom = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  const dateTo = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth + 1, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<FinancePaymentMethod[]>([]);
  const [cardBills, setCardBills] = useState<Record<string, FinanceCardBill>>({});
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [recurring, setRecurring] = useState<FinanceRecurring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [members, setMembers] = useState<{ userId: string; label: string; photoUrl: string | null }[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [recurringForm, setRecurringForm] = useState({
    title: "",
    amount: "",
    group: "INCOME" as "INCOME" | "EXPENSE",
    frequency: "MONTHLY" as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "SEMIANNUAL",
    interval: "1",
    nextDue: "",
    endDate: "",
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
    isPrimary: false,
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
    isPrimary: false,
  });
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [manageRecordsOpen, setManageRecordsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cardMonthIndex, setCardMonthIndex] = useState(() => chartMonthRange - 1);
  const [investWithdrawModalOpen, setInvestWithdrawModalOpen] = useState(false);
  const [investWithdrawTarget, setInvestWithdrawTarget] = useState<FinancePaymentMethod | null>(null);
  const [investWithdrawAmount, setInvestWithdrawAmount] = useState('');
  const [investWithdrawError, setInvestWithdrawError] = useState<string | null>(null);
  const [investMovementMode, setInvestMovementMode] = useState<'deposit' | 'withdraw'>('withdraw');

  const loadMembers = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;

    try {
      const [membershipsResult, myProfileResult] = await Promise.allSettled([
        getWorkspaceMemberships(workspaceId),
        getMyProfile(),
      ]);

      const myProfile =
        myProfileResult.status === 'fulfilled' ? myProfileResult.value : null;
      if (myProfile?.userId) {
        setCurrentUserId(myProfile.userId);
      }

      const memberships =
        membershipsResult.status === 'fulfilled' ? membershipsResult.value : null;
      setMembers(
        (memberships?.items ?? []).map((member) => ({
          userId: member.userId,
          label: member.displayName || `${member.userId.slice(0, 8)}...`,
          photoUrl: member.photoUrl,
        })),
      );
    } catch {
      // Members are optional — failures are non-fatal
    }
  }, []);

  const loadCardBills = useCallback(async (methods: FinancePaymentMethod[]) => {
    const nextCardBills = await loadFinanceCardBillsSnapshot(methods);
    setCardBills(nextCardBills);
  }, []);

  const loadBase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await loadFinanceBaseSnapshot();

      setTags(snapshot.tags);
      setCategories(snapshot.categories);
      setAccounts(snapshot.accounts);
      setPaymentMethods(snapshot.paymentMethods);
      setRecurring(snapshot.recurring);
      setCardBills(snapshot.cardBills);
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
      const response = await loadFinanceTransactionsSnapshot({
        q: query || undefined,
        group: groupFilter !== 'all' ? (groupFilter as 'INCOME' | 'EXPENSE') : undefined,
        status:
          statusFilter !== 'all'
            ? (statusFilter as 'PAID' | 'PENDING')
            : undefined,
        categoryId: typeFilter !== 'all' ? typeFilter : undefined,
        from: dateFrom,
        to: dateTo,
      });
      setTransactions(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.finance.loadError);
      }
    }
  }, [query, groupFilter, statusFilter, typeFilter, dateFrom, dateTo, t]);

  useEffect(() => {
    void loadBase();
  }, [loadBase]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    void loadCardBills(paymentMethods);
  }, [loadCardBills, paymentMethods]);

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

      const totalIncome = useMemo(
        () =>
          sortedTransactions
            .filter((item) => item.group === "INCOME")
            .reduce((sum, item) => sum + item.amount, 0),
        [sortedTransactions],
      );

      const totalExpense = useMemo(
        () =>
          sortedTransactions
            .filter((item) => item.group === "EXPENSE")
            .reduce((sum, item) => sum + item.amount, 0),
        [sortedTransactions],
      );

      const cardMethods = useMemo(
        () => paymentMethods.filter((method) => method.type !== "INVEST"),
        [paymentMethods],
      );

      const investMethods = useMemo(
        () => paymentMethods.filter((method) => method.type === "INVEST"),
        [paymentMethods],
      );

      const cardMonthKeys = useMemo(() => {
        const now = new Date();
        return Array.from({ length: chartMonthRange + chartFutureRange }, (_, index) => {
          const monthDate = new Date(
            now.getFullYear(),
            now.getMonth() - (chartMonthRange - 1 - index),
            1,
          );
          return monthDate.toISOString().slice(0, 7);
        });
      }, [chartMonthRange, chartFutureRange]);

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

      const handleOpenBill = (method: FinancePaymentMethod) => {
        setBillTarget(method);
        setBillAmount("");
        setBillModalOpen(true);
      };

      const handleOpenCardDetails = (method: FinancePaymentMethod) => {
        setSelectedCard(method);
        setCardMonthIndex(chartMonthRange - 1);
        setCardDetailOpen(true);
      };

      const handleCloseCardDetails = () => {
        setCardDetailOpen(false);
        setSelectedCard(null);
      };

      const handleOpenInvestWithdraw = (method: FinancePaymentMethod) => {
        setInvestMovementMode('withdraw');
        setInvestWithdrawTarget(method);
        setInvestWithdrawAmount('');
        setInvestWithdrawError(null);
        setInvestWithdrawModalOpen(true);
      };

      const handleInvestMovement = async () => {
        if (!investWithdrawTarget) return;
        const amount = parseCurrencyInput(investWithdrawAmount);
        if (!amount || amount <= 0) {
          setInvestWithdrawError(t.finance.amountRequired ?? 'Informe um valor valido');
          return;
        }
        const currentBalance = investWithdrawTarget.balance ?? 0;
        if (investMovementMode === 'withdraw' && amount > currentBalance) {
          setInvestWithdrawError(t.finance.insufficientBalance ?? 'Saldo insuficiente');
          return;
        }
        setIsSaving(true);
        setInvestWithdrawError(null);
        try {
          const movement = await runFinanceInvestmentMovement({
            mode: investMovementMode,
            paymentMethod: investWithdrawTarget,
            amount,
            occurredAt: new Date().toISOString().slice(0, 10),
          });
          setPaymentMethods((prev) =>
            prev.map((method) =>
              method.id === movement.updatedPaymentMethod.id
                ? movement.updatedPaymentMethod
                : method,
            ),
          );
          if (movement.movementTransaction) {
            await loadTransactions();
          }
          setInvestWithdrawModalOpen(false);
          setInvestWithdrawTarget(null);
        } catch (err) {
          if (err instanceof ApiError) {
            setInvestWithdrawError(err.message);
          } else {
            setInvestWithdrawError(t.finance.saveError);
          }
        } finally {
          setIsSaving(false);
        }
      };

      const handleInvestDeposit = (method: FinancePaymentMethod) => {
        setInvestMovementMode('deposit');
        setInvestWithdrawTarget(method);
        setInvestWithdrawAmount('');
        setInvestWithdrawError(null);
        setInvestWithdrawModalOpen(true);
      };

      const handlePayBill = async () => {
        if (!billTarget) return;
        const amount = billAmount ? parseCurrencyInput(billAmount) : undefined;
        try {
          const updated = await payFinanceCardBillAction({
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

      const handleOpenTagModal = () => {
        setFormError(null);
        setTagName("");
        setTagModalOpen(true);
      };

      const handleSaveTagStandalone = async () => {
        const value = tagName.trim();
        if (!value) return;
        setIsSaving(true);
        setFormError(null);
        try {
          const created = await createFinanceTag({ name: value });
          setTags((prev) => [...prev, created]);
          setTagModalOpen(false);
          setTagName("");
        } catch (err) {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError(t.finance.tagError ?? t.finance.loadError);
          }
        } finally {
          setIsSaving(false);
        }
      };

      const handleUpdateTag = async (id: string, name: string) => {
        const updated = await updateFinanceTag({ id, name });
        setTags((prev) => prev.map((tag) => (tag.id === id ? updated : tag)));
      };

      const handleDeleteTagRecord = async (id: string) => {
        await deleteFinanceTag({ id });
        setTags((prev) => prev.filter((tag) => tag.id !== id));
      };

      const handleUpdateCategory = async (id: string, name: string, group: 'INCOME' | 'EXPENSE') => {
        const updated = await updateFinanceCategory({ id, name, group });
        setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
      };

      const handleDeleteCategoryRecord = async (id: string) => {
        await deleteFinanceCategory({ id });
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
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
          const isSemiannual = recurringForm.frequency === "SEMIANNUAL";
          await createFinanceRecurring({
            title: recurringForm.title.trim(),
            amount: Number(recurringForm.amount),
            group: recurringForm.group,
            frequency: (isSemiannual ? "MONTHLY" : recurringForm.frequency) as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
            interval: isSemiannual ? 6 : (Number(recurringForm.interval) || 1),
            nextDue: recurringForm.nextDue,
            endDate: recurringForm.endDate || null,
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
            isPrimary: account.isPrimary ?? false,
          });
        } else {
          setEditingAccount(null);
          setAccountForm({ name: "", type: "BANK", currency: "BRL", isPrimary: false });
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
              isPrimary: accountForm.isPrimary,
            });
            setAccounts((prev) => {
              const list = prev.map((item) =>
                item.id === updated.id
                  ? updated
                  : updated.isPrimary
                    ? { ...item, isPrimary: false }
                    : item,
              );
              return list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
            });
          } else {
            const created = await createFinanceAccount({
              name: accountForm.name.trim(),
              type: accountForm.type,
              currency: accountForm.currency,
              isPrimary: accountForm.isPrimary,
            });
            setAccounts((prev) => {
              const list = accountForm.isPrimary
                ? prev.map((item) => ({ ...item, isPrimary: false }))
                : [...prev];
              return [...list, created].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
            });
          }
          setAccountModalOpen(false);
          setEditingAccount(null);
          setAccountForm({ name: "", type: "BANK", currency: "BRL", isPrimary: false });
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
            isPrimary: method.isPrimary ?? false,
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
            isPrimary: false,
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
              isPrimary: paymentMethodForm.isPrimary,
            });
            setPaymentMethods((prev) => {
              const list = prev.map((item) =>
                item.id === updated.id
                  ? updated
                  : updated.isPrimary
                    ? { ...item, isPrimary: false }
                    : item,
              );
              return list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
            });
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
              isPrimary: paymentMethodForm.isPrimary,
            });
            setPaymentMethods((prev) => {
              const list = paymentMethodForm.isPrimary
                ? prev.map((item) => ({ ...item, isPrimary: false }))
                : [...prev];
              return [...list, created].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
            });
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
            isPrimary: false,
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

      const paidIds = new Set(
        recurring
          .filter((item) => {
            const interval = item.interval ?? 1;
            const prevDue = shiftRecurringDate(item.nextDue, item.frequency, -interval);
            return transactions.some((tx) => tx.recurringId === item.id && tx.occurredAt === prevDue);
          })
          .map((item) => item.id),
      );

      const showOverview = surface === 'insights' || activeTab === 'overview';
      const showEntries = surface !== 'insights' && activeTab === 'entries';
      const showAccounts = surface !== 'insights' && activeTab === 'accounts';
      const showPaymentMethods =
        surface !== 'insights' && activeTab === 'paymentMethods';
      const showRail = surface !== 'insights';
      const railMode =
        surface === 'setup'
          ? 'setup'
          : surface === 'legacy'
            ? 'full'
            : 'activity';
      const showMonthControls =
        showRail && (activeTab === 'overview' || activeTab === 'entries');

      return (
        <div className="flex flex-col gap-6">
          {showRail ? (
            <FinancePageRail
              activeTab={activeTab}
              mode={railMode}
              monthLabel={monthLabel}
              isCurrentMonth={isCurrentMonth}
              showMonthControls={showMonthControls}
              onTabChange={setActiveTab}
              onMonthPrev={handleMonthPrev}
              onMonthNext={handleMonthNext}
              onMonthReset={handleMonthReset}
              todayLabel={language === 'pt' ? 'Hoje' : 'Today'}
            />
          ) : null}

          {error ? <p className="text-sm text-[var(--expense)]">{error}</p> : null}

          {/* Overview tab */}
          {showOverview ? (
            <div className="grid gap-4">
              <FinanceModeHeader
                eyebrow={t.finance.activityGroupLabel ?? 'Atividade'}
                title={t.finance.tabsOverview ?? 'Visão Geral'}
                meta={[
                  `${recurring.length} ${recurring.length === 1 ? 'recorrência ativa' : 'recorrências ativas'}`,
                  `${categories.length} ${categories.length === 1 ? 'categoria' : 'categorias'}`,
                ]}
                actions={
                  <>
                    <Button variant="secondary" onClick={() => setManageRecordsOpen(true)}>
                      {t.finance.manageRecords ?? 'Gerenciar base'}
                    </Button>
                    <Button variant="secondary" onClick={handleOpenTagModal}>
                      + {t.finance.addTagAction ?? 'Nova tag'}
                    </Button>
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                      {t.finance.newType}
                    </Button>
                    <Button onClick={() => setRecurringModalOpen(true)}>
                      + {t.finance.recurringTitle}
                    </Button>
                  </>
                }
              />

              <FinanceStatsRow
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                investmentsTotal={investMethods.reduce((s, m) => s + (m.balance ?? 0), 0)}
                investmentsCount={investMethods.length}
              />

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <Card>
                  <RecurringBillsChecklist
                    recurring={recurring}
                    categories={categories}
                    paidIds={paidIds}
                    disabled={isSaving}
                    onToggle={handleToggleRecurringPayment}
                    onAdd={() => setRecurringModalOpen(true)}
                  />
                </Card>
                <FinanceCategoriesPanel transactions={transactions} categories={categories} />
              </div>
            </div>
          ) : null}

          {/* Entries tab */}
          {showEntries ? (
            <FinanceTransactionsWorkspace
              query={query}
              groupFilter={groupFilter}
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              sortBy={sortBy}
              categories={categories}
              accounts={accounts}
              paymentMethods={paymentMethods}
              tags={tags}
              recurring={recurring}
              members={members}
              currentUserId={currentUserId}
              totalTransactions={sortedTransactions.length}
              visibleTransactions={paged}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              isLoading={isLoading}
              hasMore={hasMoreTransactions}
              onQuery={(value) => {
                setQuery(value);
                setPage(1);
              }}
              onGroup={(value) => {
                setGroupFilter(value);
                setPage(1);
              }}
              onType={(value) => {
                setTypeFilter(value);
                setPage(1);
              }}
              onStatus={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              onSort={setSortBy}
              onLoadMore={() => setPage((prev) => prev + 1)}
              reloadTransactions={loadTransactions}
              onTagsUpdated={(next) => setTags(next)}
              onRecurringUpdated={(next) => setRecurring(next)}
            />
          ) : null}

          {/* Accounts tab */}
          {showAccounts ? (
            <div className="grid gap-4">
              <FinanceModeHeader
                eyebrow={t.finance.setupGroupLabel ?? 'Configuração'}
                title={t.finance.tabsAccounts ?? t.finance.accountsTitle ?? 'Contas'}
                meta={[
                  `${accounts.length} ${accounts.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}`,
                  `${accounts.filter((account) => account.isPrimary).length} ${accounts.filter((account) => account.isPrimary).length === 1 ? 'principal' : 'principais'}`,
                ]}
                actions={
                  <Button onClick={() => handleOpenAccount()}>
                    + {t.finance.newAccount ?? t.finance.accountLabel}
                  </Button>
                }
              />

              <Card>
                <AccountsList
                  accounts={accounts}
                  isSaving={isSaving}
                  showAddAction={false}
                  onAdd={() => handleOpenAccount()}
                  onEdit={handleOpenAccount}
                  onDelete={handleDeleteAccount}
                />
              </Card>
            </div>
          ) : null}

          {/* Payment methods tab */}
          {showPaymentMethods ? (
            <div className="grid gap-4">
              <FinanceModeHeader
                eyebrow={t.finance.setupGroupLabel ?? 'Configuração'}
                title={t.finance.tabsPaymentMethods ?? 'Métodos de Pagamento'}
                meta={[
                  `${paymentMethods.length} ${paymentMethods.length === 1 ? 'método ativo' : 'métodos ativos'}`,
                  `${investMethods.length} ${investMethods.length === 1 ? 'investimento' : 'investimentos'}`,
                ]}
                actions={
                  <Button onClick={() => handleOpenPaymentMethod()}>
                    + {t.finance.paymentMethodAdd ?? 'Adicionar'}
                  </Button>
                }
              />

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:items-start">
                <Card>
                  <CardsSection
                    cardMethods={cardMethods}
                    cardBills={cardBills}
                    isSaving={isSaving}
                    showAddAction={false}
                    onAdd={() => handleOpenPaymentMethod()}
                    onEdit={handleOpenPaymentMethod}
                    onDelete={handleDeletePaymentMethod}
                    onPayBill={handleOpenBill}
                    onViewDetails={handleOpenCardDetails}
                  />
                </Card>
                <Card>
                  <InvestmentsSection
                    investMethods={investMethods}
                    isSaving={isSaving}
                    showAddAction={false}
                    onAdd={() => handleOpenPaymentMethod()}
                    onEdit={handleOpenPaymentMethod}
                    onDelete={handleDeletePaymentMethod}
                    onDeposit={handleInvestDeposit}
                    onWithdraw={handleOpenInvestWithdraw}
                  />
                </Card>
              </div>
            </div>
          ) : null}

          {/* === DRAWERS === */}

          {/* Account drawer */}
          <AccountDrawer
            open={accountModalOpen}
            editing={editingAccount}
            form={accountForm}
            formError={formError}
            isSaving={isSaving}
            onClose={() => setAccountModalOpen(false)}
            onChange={(patch) => setAccountForm((prev) => ({ ...prev, ...patch }))}
            onSave={handleSaveAccount}
            onDelete={handleDeleteAccount}
          />

          {/* Payment method drawer */}
          <PaymentMethodDrawer
            open={paymentMethodModalOpen}
            editing={editingPaymentMethod}
            form={paymentMethodForm}
            accounts={accounts}
            formError={formError}
            isSaving={isSaving}
            onClose={() => setPaymentMethodModalOpen(false)}
            onChange={(patch) => setPaymentMethodForm((prev) => ({ ...prev, ...patch }))}
            onSave={handleSavePaymentMethod}
            onDelete={handleDeletePaymentMethod}
            formatCurrencyInput={formatCurrencyInput}
          />

          {/* Type/category drawer */}
          <TypeDrawer
            open={categoryModalOpen}
            name={categoryForm.name}
            group={categoryForm.group}
            formError={formError}
            isSaving={isSaving}
            onClose={() => setCategoryModalOpen(false)}
            onNameChange={(v) => setCategoryForm((prev) => ({ ...prev, name: v }))}
            onGroupChange={(v) => setCategoryForm((prev) => ({ ...prev, group: v }))}
            onSave={handleCreateCategory}
          />

          {/* Tag drawer */}
          <TagDrawer
            open={tagModalOpen}
            name={tagName}
            formError={formError}
            isSaving={isSaving}
            onClose={() => setTagModalOpen(false)}
            onNameChange={setTagName}
            onSave={handleSaveTagStandalone}
          />

          {/* Manage records modal */}
          <ManageRecordsModal
            open={manageRecordsOpen}
            tags={tags}
            categories={categories}
            onClose={() => setManageRecordsOpen(false)}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTagRecord}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategoryRecord}
          />

          {/* === CENTERED MODALS (kept as-is) === */}

          {/* Card detail modal */}
          {cardDetailOpen && selectedCard ? (
            <div className="modal-overlay fixed inset-0 z-50 overflow-y-auto">
              <button
                type="button"
                className="fixed inset-0 bg-black/40"
                onClick={handleCloseCardDetails}
              />
              <div className="flex min-h-full items-center justify-center px-4 py-4">
              <Card className="modal-content relative z-10 w-full max-w-3xl">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedCard.name}</h3>
                      <p className="text-sm text-[var(--foreground)]/60">
                        {t.finance.cardDetailsTitle ?? 'Detalhes do cartão'}
                      </p>
                    </div>
                    <Button variant="secondary" onClick={handleCloseCardDetails}>
                      {t.finance.close ?? t.calendar.closeAction}
                    </Button>
                  </div>

                  {selectedCard.type === 'CREDIT' ? (
                    <div className="rounded-2xl border [border-color:var(--border)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-[var(--foreground)]/50">{t.finance.billRemaining ?? 'Saldo da fatura'}</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(cardBills[selectedCard.id]?.remainingAmount ?? 0, selectedCard.currency)}
                          </p>
                          {cardBills[selectedCard.id]?.bill.dueDate ? (
                            <p className="text-xs text-[var(--foreground)]/50">
                              {t.finance.billDue ?? 'Vencimento'}: {cardBills[selectedCard.id]?.bill.dueDate}
                            </p>
                          ) : null}
                        </div>
                        <Button variant="secondary" onClick={() => handleOpenBill(selectedCard)}>
                          {t.finance.billPay ?? 'Pagar'}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border [border-color:var(--border)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/50">
                          {t.finance.monthTitle ?? 'Mês'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--foreground)]/50">
                        <button type="button" onClick={() => setCardMonthIndex((c) => Math.max(0, c - 1))} disabled={cardMonthIndex <= 0}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border [border-color:var(--border)] disabled:opacity-40" aria-label="Previous month">←</button>
                        <span className="rounded-full border [border-color:var(--border)] px-3 py-1">{activeCardMonth?.label ?? '-'}</span>
                        <button type="button" onClick={() => setCardMonthIndex((c) => Math.min(cardMonthKeys.length - 1, c + 1))} disabled={cardMonthIndex >= cardMonthKeys.length - 1}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border [border-color:var(--border)] disabled:opacity-40" aria-label="Next month">→</button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-4 overflow-x-auto pb-2">
                      {cardMonthlyTotals.map((month) => (
                        <div key={month.key} className="flex min-w-[72px] flex-col items-center gap-2">
                          <div className="flex items-end gap-1">
                            <div className="w-3 rounded-full bg-[var(--income)]" style={{ height: Math.max(8, (month.income / cardMaxValue) * 80) }} />
                            <div className="w-3 rounded-full bg-[var(--expense)]" style={{ height: Math.max(8, (month.expense / cardMaxValue) * 80) }} />
                          </div>
                          <span className="text-[10px] text-[var(--foreground)]/50">{month.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-[var(--foreground)]/50">
                      ↑ {formatCurrency(activeCardMonth?.income ?? 0, selectedCard.currency)} · ↓ {formatCurrency(activeCardMonth?.expense ?? 0, selectedCard.currency)}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <h4 className="text-sm font-semibold">{t.finance.cardTransactionsTitle ?? 'Transações do mês'}</h4>
                    {activeCardTransactions.length === 0 ? (
                      <p className="text-sm text-[var(--foreground)]/50">{t.finance.cardTransactionsEmpty ?? t.finance.empty}</p>
                    ) : (
                      activeCardTransactions.map((item) => {
                        const category = categories.find((c) => c.id === item.categoryId);
                        return (
                          <div key={item.id} className="flex items-center justify-between rounded-2xl border [border-color:var(--border)] px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                              <p className="text-xs text-[var(--foreground)]/50">{category?.name ?? t.finance.tagsEmpty} · {item.occurredAt.slice(0, 10)}</p>
                            </div>
                            <p className="text-sm font-semibold">{formatCurrency(item.amount, item.currency ?? selectedCard.currency)}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </Card>
              </div>
            </div>
          ) : null}

          {/* Recurring creation modal */}
          {recurringModalOpen ? createPortal(
            <>
              {/* Overlay */}
              <button
                type="button"
                aria-label={t.finance.close}
                className="modal-overlay fixed inset-0 z-40 bg-black/40"
                onClick={() => setRecurringModalOpen(false)}
              />

              {/* Centered modal panel */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="modal-content w-full max-w-xl flex flex-col bg-[var(--surface)] rounded-2xl shadow-2xl"
                style={{ maxHeight: '90vh', overflow: 'hidden' }}
                role="dialog"
                aria-modal="true"
                aria-label={t.finance.recurringTitle}
              >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b [border-color:var(--border)] px-5 py-4">
                  <h2 className="text-base font-semibold text-[var(--foreground)]">{t.finance.recurringTitle}</h2>
                  <button
                    type="button"
                    onClick={() => setRecurringModalOpen(false)}
                    aria-label={t.finance.close ?? 'Fechar'}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]/50 transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="grid gap-4">
                    <Input label={t.finance.titleLabel} value={recurringForm.title} onChange={(e) => setRecurringForm((prev) => ({ ...prev, title: e.target.value }))} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input label={t.finance.amountLabel} value={recurringForm.amount} onChange={(e) => setRecurringForm((prev) => ({ ...prev, amount: e.target.value }))} />
                      <Input label={t.finance.nextDueLabel} type="date" value={recurringForm.nextDue} onChange={(e) => setRecurringForm((prev) => ({ ...prev, nextDue: e.target.value }))} />
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                        {t.finance.groupLabel}
                        <select value={recurringForm.group} onChange={(e) => setRecurringForm((prev) => ({ ...prev, group: e.target.value as 'INCOME' | 'EXPENSE' }))}
                          className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
                          <option value="INCOME">{t.finance.groupIncome}</option>
                          <option value="EXPENSE">{t.finance.groupExpense}</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                        {t.finance.recurrenceFrequencyLabel}
                        <select value={recurringForm.frequency} onChange={(e) => setRecurringForm((prev) => ({ ...prev, frequency: e.target.value as typeof recurringForm.frequency }))}
                          className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
                          <option value="DAILY">{t.finance.cadenceDaily}</option>
                          <option value="WEEKLY">{t.finance.cadenceWeekly}</option>
                          <option value="MONTHLY">{t.finance.cadenceMonthly}</option>
                          <option value="SEMIANNUAL">{t.finance.cadenceSemiannual}</option>
                          <option value="YEARLY">{t.finance.cadenceYearly}</option>
                        </select>
                      </label>
                      {recurringForm.frequency !== 'SEMIANNUAL' ? (
                        <Input label={t.finance.recurrenceIntervalLabel} type="number" value={recurringForm.interval} onChange={(e) => setRecurringForm((prev) => ({ ...prev, interval: e.target.value }))} />
                      ) : null}
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                        {t.finance.recurrenceEndDateLabel}
                        <input type="date" value={recurringForm.endDate} onChange={(e) => setRecurringForm((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm" />
                        {!recurringForm.endDate ? <span className="text-xs text-[var(--foreground)]/40">{t.finance.recurrenceNoEndDate}</span> : null}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t [border-color:var(--border)] px-5 py-4">
                  {formError ? <p className="mb-3 text-sm text-[var(--expense)]">{formError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setRecurringModalOpen(false)} disabled={isSaving}>{t.finance.cancel}</Button>
                    <Button onClick={handleSaveRecurring} disabled={isSaving}>{isSaving ? t.finance.saving : t.finance.save}</Button>
                  </div>
                </div>
              </div>
              </div>
            </>,
            document.body
          ) : null}

          {/* Bill payment modal */}
          {billModalOpen ? (
            <div className="modal-overlay fixed inset-0 z-50 overflow-y-auto">
              <button type="button" className="fixed inset-0 bg-black/40" onClick={() => setBillModalOpen(false)} />
              <div className="flex min-h-full items-center justify-center px-4 py-4">
              <Card className="modal-content relative z-10 w-full max-w-lg">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.finance.billTitle ?? 'Pagamento de fatura'}</h3>
                    <Button variant="secondary" onClick={() => setBillModalOpen(false)}>{t.finance.close ?? t.calendar.closeAction}</Button>
                  </div>
                  {billTarget ? (
                    <div>
                      <p className="text-sm font-semibold">{billTarget.name}</p>
                      {cardBills[billTarget.id] ? (
                        <p className="text-xs text-[var(--foreground)]/50">
                          {t.finance.billRemaining ?? 'Saldo'}: {formatCurrency(cardBills[billTarget.id].remainingAmount, billTarget.currency)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <Input label={t.finance.billAmountLabel ?? t.finance.amountLabel} value={billAmount} onChange={(e) => setBillAmount(e.target.value)} />
                  {formError ? <p className="text-sm text-[var(--expense)]">{formError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setBillModalOpen(false)}>{t.finance.cancel}</Button>
                    <Button onClick={handlePayBill} disabled={isSaving}>{t.finance.billPay ?? t.finance.save}</Button>
                  </div>
                </div>
              </Card>
              </div>
            </div>
          ) : null}

          {/* Invest withdraw modal */}
          {investWithdrawModalOpen && investWithdrawTarget ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm">
                <Card>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold">
                        {investMovementMode === 'deposit'
                          ? t.finance.investDeposit ?? 'Depositar'
                          : t.finance.investWithdraw ?? 'Resgatar'}{' '}
                        — {investWithdrawTarget.name}
                      </h2>
                      <button type="button" aria-label={t.finance.close} onClick={() => setInvestWithdrawModalOpen(false)}
                        className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">✕</button>
                    </div>
                    <p className="text-sm text-[var(--foreground)]/50">
                      {t.finance.balanceLabel ?? 'Saldo'}:{' '}
                      <span className="font-semibold text-[var(--sidebar)]">
                        {formatCurrency(investWithdrawTarget.balance ?? 0, investWithdrawTarget.currency)}
                      </span>
                    </p>
                    <label className="flex flex-col gap-2 text-sm">
                      {investMovementMode === 'deposit'
                        ? t.finance.investDepositAmount ?? t.finance.amountLabel ?? 'Valor a depositar'
                        : t.finance.amountLabel ?? 'Valor a resgatar'}
                      <input type="text" value={investWithdrawAmount}
                        onChange={(e) => setInvestWithdrawAmount(formatCurrencyInput(e.target.value.replace(/\D/g, ''), investWithdrawTarget.currency ?? 'BRL'))}
                        placeholder="0,00"
                        className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
                    </label>
                    {investWithdrawError ? <p className="text-sm text-[var(--expense)]">{investWithdrawError}</p> : null}
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => setInvestWithdrawModalOpen(false)}>{t.finance.cancel}</Button>
                      <Button onClick={handleInvestMovement} disabled={isSaving}>
                        {investMovementMode === 'deposit'
                          ? t.finance.investDeposit ?? 'Depositar'
                          : t.finance.investWithdraw ?? 'Resgatar'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      );
    }


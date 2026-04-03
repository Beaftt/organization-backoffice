'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiError } from '@/lib/api/client';
import {
  getMyProfile,
  type UserProfile,
} from '@/lib/api/user-profile';
import { getWorkspaceMemberships } from '@/lib/api/workspace-memberships';
import type {
  FinanceAccount,
  FinanceCardBill,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceRecurring,
  FinanceTag,
  FinanceTransaction,
} from '@/lib/api/finance';
import {
  getFinanceTotals,
  matchesFinanceOperationalRoute,
  sortFinanceTransactions,
  type FinanceTransactionSort,
} from '@/lib/finance/finance-analytics';
import {
  loadFinanceBaseSnapshot,
  loadFinanceTransactionsSnapshot,
} from '@/lib/finance/finance-action-adapter';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';
import { getWorkspaceId } from '@/lib/storage/workspace';

type FinanceMemberOption = {
  userId: string;
  label: string;
  photoUrl: string | null;
};

type FinanceMonthlyDataState = {
  accounts: FinanceAccount[];
  cardBills: Record<string, FinanceCardBill>;
  categories: FinanceCategory[];
  currentUserId: string;
  error: string | null;
  isLoading: boolean;
  loadTransactions: () => Promise<void>;
  members: FinanceMemberOption[];
  paymentMethods: FinancePaymentMethod[];
  recurring: FinanceRecurring[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<FinancePaymentMethod[]>>;
  setRecurring: React.Dispatch<React.SetStateAction<FinanceRecurring[]>>;
  setTags: React.Dispatch<React.SetStateAction<FinanceTag[]>>;
  sortedTransactions: FinanceTransaction[];
  tags: FinanceTag[];
  totalExpense: number;
  totalIncome: number;
  transactions: FinanceTransaction[];
};

export function useFinanceMonthlyData(
  routeState: FinanceRouteState,
): FinanceMonthlyDataState {
  const { t } = useLanguage();
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<FinancePaymentMethod[]>([]);
  const [cardBills, setCardBills] = useState<Record<string, FinanceCardBill>>({});
  const [recurring, setRecurring] = useState<FinanceRecurring[]>([]);
  const [allTransactions, setAllTransactions] = useState<FinanceTransaction[]>([]);
  const [members, setMembers] = useState<FinanceMemberOption[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(() => {
    const from = new Date(routeState.month.year, routeState.month.month, 1);
    const to = new Date(routeState.month.year, routeState.month.month + 1, 0);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, [routeState.month.month, routeState.month.year]);

  const loadBaseData = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    const [snapshot, membershipsResult, profileResult] = await Promise.all([
      loadFinanceBaseSnapshot(),
      workspaceId ? getWorkspaceMemberships(workspaceId) : Promise.resolve(null),
      getMyProfile().catch(() => null as UserProfile | null),
    ]);

    setTags(snapshot.tags);
    setCategories(snapshot.categories);
    setAccounts(snapshot.accounts);
    setPaymentMethods(snapshot.paymentMethods);
    setCardBills(snapshot.cardBills);
    setRecurring(snapshot.recurring);
    setMembers(
      (membershipsResult?.items ?? []).map((member) => ({
        userId: member.userId,
        label: member.displayName || `${member.userId.slice(0, 8)}...`,
        photoUrl: member.photoUrl,
      })),
    );
    setCurrentUserId(profileResult?.userId ?? '');
  }, []);

  const loadTransactions = useCallback(async () => {
    const nextTransactions = await loadFinanceTransactionsSnapshot({
      accountId: routeState.accountId !== 'all' ? routeState.accountId : undefined,
      paymentMethodId: routeState.cardId !== 'all' ? routeState.cardId : undefined,
      q: routeState.query || undefined,
      group:
        routeState.group !== 'all'
          ? (routeState.group as 'INCOME' | 'EXPENSE')
          : undefined,
      status:
        routeState.status !== 'all'
          ? (routeState.status as 'PAID' | 'PENDING')
          : undefined,
      categoryId: routeState.type !== 'all' ? routeState.type : undefined,
      from: dateRange.from,
      to: dateRange.to,
    });
    setAllTransactions(nextTransactions);
  }, [
    dateRange.from,
    dateRange.to,
    routeState.accountId,
    routeState.cardId,
    routeState.group,
    routeState.query,
    routeState.status,
    routeState.type,
  ]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([loadBaseData(), loadTransactions()]);
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : t.finance.loadError);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [loadBaseData, loadTransactions, t]);

  const transactions = useMemo(
    () =>
      allTransactions.filter((transaction) =>
        matchesFinanceOperationalRoute(
          transaction,
          paymentMethods,
          routeState.route,
        ),
      ),
    [allTransactions, paymentMethods, routeState.route],
  );
  const sortedTransactions = useMemo(
    () => sortFinanceTransactions(transactions, routeState.sort as FinanceTransactionSort),
    [routeState.sort, transactions],
  );
  const totals = useMemo(
    () => getFinanceTotals(sortedTransactions),
    [sortedTransactions],
  );

  return {
    accounts,
    cardBills,
    categories,
    currentUserId,
    error,
    isLoading,
    loadTransactions,
    members,
    paymentMethods,
    recurring,
    setPaymentMethods,
    setRecurring,
    setTags,
    sortedTransactions,
    tags,
    totalExpense: totals.totalExpense,
    totalIncome: totals.totalIncome,
    transactions,
  };
}
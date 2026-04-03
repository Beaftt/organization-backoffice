'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { updateFinanceWorkspaceState } from '@/lib/finance/finance-workspace-store';
import {
  buildFinanceDeskHref,
  type FinanceComposerIntent,
  type FinanceComposerRouteState,
} from '@/lib/navigation/finance-composer-route-state';
import {
  createDefaultFinanceRouteState,
  formatFinanceMonthParam,
  type FinanceRouteState,
} from '@/lib/navigation/finance-route-state';

type UseFinanceDeskRouteStateParams = {
  initialRouteState?: FinanceRouteState;
  initialComposerState?: FinanceComposerRouteState | null;
};

export function useFinanceDeskRouteState({
  initialRouteState,
  initialComposerState = null,
}: UseFinanceDeskRouteStateParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultRouteState = useMemo(
    () => ({
      ...createDefaultFinanceRouteState('desk'),
      ...initialRouteState,
    }),
    [initialRouteState],
  );
  const [selectedYear, setSelectedYear] = useState(defaultRouteState.month.year);
  const [selectedMonth, setSelectedMonth] = useState(defaultRouteState.month.month);
  const [accountFilter, setAccountFilter] = useState(defaultRouteState.accountId);
  const [cardFilter, setCardFilter] = useState(defaultRouteState.cardId);
  const [query, setQuery] = useState(defaultRouteState.query);
  const [groupFilter, setGroupFilter] = useState(defaultRouteState.group);
  const [routeFilter, setRouteFilter] = useState(defaultRouteState.route);
  const [typeFilter, setTypeFilter] = useState(defaultRouteState.type);
  const [statusFilter, setStatusFilter] = useState(defaultRouteState.status);
  const [sortBy, setSortBy] = useState(defaultRouteState.sort);
  const [page, setPage] = useState(defaultRouteState.page);
  const [composerState, setComposerState] = useState<FinanceComposerRouteState | null>(
    initialComposerState,
  );
  const [composerSessionId, setComposerSessionId] = useState(
    initialComposerState ? 1 : 0,
  );

  const routeState = useMemo<FinanceRouteState>(
    () => ({
      ...defaultRouteState,
      accountId: accountFilter,
      cardId: cardFilter,
      query,
      group: groupFilter,
      route: routeFilter,
      type: typeFilter,
      status: statusFilter,
      sort: sortBy,
      page,
      month: {
        year: selectedYear,
        month: selectedMonth,
      },
    }),
    [
      defaultRouteState,
      accountFilter,
      cardFilter,
      groupFilter,
      page,
      query,
      routeFilter,
      selectedMonth,
      selectedYear,
      sortBy,
      statusFilter,
      typeFilter,
    ],
  );

  useEffect(() => {
    const nextHref = buildFinanceDeskHref(routeState, composerState);
    const currentSearch = searchParams.toString();
    const currentHref = `${pathname}${currentSearch ? `?${currentSearch}` : ''}`;

    if (nextHref !== currentHref) {
      router.replace(nextHref);
    }
  }, [composerState, pathname, routeState, router, searchParams]);

  useEffect(() => {
    updateFinanceWorkspaceState({
      currentSurface: 'desk',
      lastMonth: formatFinanceMonthParam(selectedYear, selectedMonth),
      selectedTransactionId:
        composerState?.mode === 'edit' ? composerState.transactionId : null,
    });
  }, [composerState, selectedMonth, selectedYear]);

  const handleMonthPrev = () => {
    if (selectedMonth === 0) {
      setSelectedYear((currentYear) => currentYear - 1);
      setSelectedMonth(11);
      return;
    }

    setSelectedMonth((currentMonth) => currentMonth - 1);
  };

  const handleMonthNext = () => {
    if (selectedMonth === 11) {
      setSelectedYear((currentYear) => currentYear + 1);
      setSelectedMonth(0);
      return;
    }

    setSelectedMonth((currentMonth) => currentMonth + 1);
  };

  const handleMonthReset = () => {
    const currentMonthState = createDefaultFinanceRouteState('desk').month;
    setSelectedYear(currentMonthState.year);
    setSelectedMonth(currentMonthState.month);
  };

  const openComposer = (intent: FinanceComposerIntent = 'expense') => {
    setComposerSessionId((current) => current + 1);
    setComposerState({
      mode: 'create',
      intent,
      step: 1,
      transactionId: null,
    });
  };

  const openEditor = (transactionId: string, intent: FinanceComposerIntent) => {
    setComposerSessionId((current) => current + 1);
    setComposerState({
      mode: 'edit',
      intent,
      step: 1,
      transactionId,
    });
  };

  const closeComposer = () => {
    setComposerState(null);
  };

  return {
    accountFilter,
    cardFilter,
    closeComposer,
    composerState,
    composerSessionId,
    groupFilter,
    handleMonthNext,
    handleMonthPrev,
    handleMonthReset,
    openComposer,
    openEditor,
    page,
    query,
    routeFilter,
    routeState,
    selectedMonth,
    selectedYear,
    setAccountFilter,
    setCardFilter,
    setComposerState,
    setGroupFilter,
    setPage,
    setQuery,
    setRouteFilter,
    setSortBy,
    setStatusFilter,
    setTypeFilter,
    sortBy,
    statusFilter,
    typeFilter,
  };
}
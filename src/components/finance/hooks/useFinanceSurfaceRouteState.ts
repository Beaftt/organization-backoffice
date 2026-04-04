'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildFinanceHref,
  createDefaultFinanceRouteState,
  formatFinanceMonthParam,
  type FinanceRouteState,
  type FinanceSurface,
} from '@/lib/navigation/finance-route-state';
import { updateFinanceWorkspaceState } from '@/lib/finance/finance-workspace-store';

type UseFinanceSurfaceRouteStateParams = {
  surface: FinanceSurface;
  initialRouteState?: FinanceRouteState;
};

export function useFinanceSurfaceRouteState({
  surface,
  initialRouteState,
}: UseFinanceSurfaceRouteStateParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultRouteState = initialRouteState ?? createDefaultFinanceRouteState(surface);
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
    const nextHref = buildFinanceHref(surface, routeState);
    const currentSearch = searchParams.toString();
    const currentHref = `${pathname}${currentSearch ? `?${currentSearch}` : ''}`;

    if (nextHref !== currentHref) {
      router.replace(nextHref);
    }
  }, [pathname, routeState, router, searchParams, surface]);

  useEffect(() => {
    updateFinanceWorkspaceState({
      currentSurface: surface,
      lastMonth: formatFinanceMonthParam(selectedYear, selectedMonth),
    });
  }, [selectedMonth, selectedYear, surface]);

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
    const currentMonthState = createDefaultFinanceRouteState(surface).month;
    setSelectedYear(currentMonthState.year);
    setSelectedMonth(currentMonthState.month);
  };

  return {
    accountFilter,
    cardFilter,
    groupFilter,
    handleMonthNext,
    handleMonthPrev,
    handleMonthReset,
    page,
    query,
    routeFilter,
    routeState,
    selectedMonth,
    selectedYear,
    setAccountFilter,
    setCardFilter,
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
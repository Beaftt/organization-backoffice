import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildFinanceHref,
  createDefaultFinanceRouteState,
  formatFinanceMonthParam,
  normalizeFinanceTab,
  resolveFinanceSurface,
  type FinanceCompatibilitySurface,
  type FinanceRouteState,
  type FinanceScaffoldTab,
} from '@/lib/navigation/finance-route-state';
import { updateFinanceWorkspaceState } from '@/lib/finance/finance-workspace-store';

type UseFinanceCompatibilityRouteStateParams = {
  surface: FinanceCompatibilitySurface;
  initialRouteState?: FinanceRouteState;
};

export const useFinanceCompatibilityRouteState = ({
  surface,
  initialRouteState,
}: UseFinanceCompatibilityRouteStateParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedSurface = resolveFinanceSurface(surface);
  const defaultRouteState = useMemo(
    () => ({
      ...createDefaultFinanceRouteState(surface),
      ...initialRouteState,
    }),
    [initialRouteState, surface],
  );

  const [selectedYear, setSelectedYear] = useState(defaultRouteState.month.year);
  const [selectedMonth, setSelectedMonth] = useState(defaultRouteState.month.month);
  const [query, setQuery] = useState(defaultRouteState.query);
  const [groupFilter, setGroupFilter] = useState(defaultRouteState.group);
  const [typeFilter, setTypeFilter] = useState(defaultRouteState.type);
  const [statusFilter, setStatusFilter] = useState(defaultRouteState.status);
  const [sortBy, setSortBy] = useState(defaultRouteState.sort);
  const [page, setPage] = useState(defaultRouteState.page);
  const [activeTab, setActiveTabState] = useState<FinanceScaffoldTab>(
    normalizeFinanceTab(surface, defaultRouteState.tab),
  );

  const monthParam = useMemo(
    () => formatFinanceMonthParam(selectedYear, selectedMonth),
    [selectedMonth, selectedYear],
  );

  const routeState = useMemo<FinanceRouteState>(
    () => ({
      accountId: defaultRouteState.accountId,
      cardId: defaultRouteState.cardId,
      query,
      group: groupFilter,
      route: defaultRouteState.route,
      type: typeFilter,
      status: statusFilter,
      sort: sortBy,
      page,
      month: {
        year: selectedYear,
        month: selectedMonth,
      },
      tab: normalizeFinanceTab(surface, activeTab),
    }),
    [
      activeTab,
      defaultRouteState.accountId,
      defaultRouteState.cardId,
      defaultRouteState.route,
      groupFilter,
      page,
      query,
      selectedMonth,
      selectedYear,
      sortBy,
      statusFilter,
      surface,
      typeFilter,
    ],
  );

  useEffect(() => {
    updateFinanceWorkspaceState({
      currentSurface: resolvedSurface,
      lastMonth: monthParam,
    });
  }, [monthParam, resolvedSurface]);

  useEffect(() => {
    const nextHref = buildFinanceHref(surface, routeState);
    const currentSearch = searchParams.toString();
    const currentHref = `${pathname}${currentSearch ? `?${currentSearch}` : ''}`;

    if (nextHref !== currentHref) {
      router.replace(nextHref);
    }
  }, [pathname, routeState, router, searchParams, surface]);

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
    activeTab,
    groupFilter,
    monthParam,
    page,
    query,
    routeState,
    selectedMonth,
    selectedYear,
    setActiveTab: (nextTab: FinanceScaffoldTab) =>
      setActiveTabState(normalizeFinanceTab(surface, nextTab)),
    setGroupFilter,
    setPage,
    setQuery,
    setSelectedMonth,
    setSelectedYear,
    setSortBy,
    setStatusFilter,
    setTypeFilter,
    sortBy,
    statusFilter,
    surface: resolvedSurface,
    typeFilter,
    handleMonthNext,
    handleMonthPrev,
    handleMonthReset,
  };
};
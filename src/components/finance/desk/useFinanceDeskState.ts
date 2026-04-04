'use client';

import { useMemo } from 'react';

import { useFinanceDeskRouteState } from '@/components/finance/hooks/useFinanceDeskRouteState';
import { useFinanceMonthlyData } from '@/components/finance/hooks/useFinanceMonthlyData';
import { useFinanceSetupInvestments } from '@/components/finance/setup/useFinanceSetupInvestments';
import { useFinanceTransactionComposer } from '@/components/finance/transaction/useFinanceTransactionComposer';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatMonthLabelForLanguage } from '@/lib/i18n/locale';
import type { FinanceComposerRouteState } from '@/lib/navigation/finance-composer-route-state';
import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

import { inferComposerIntent } from '@/components/finance/transaction/transaction-composer-model';

type UseFinanceDeskStateParams = {
  initialComposerState?: FinanceComposerRouteState | null;
  initialRouteState: FinanceRouteState;
};

export function useFinanceDeskState({
  initialComposerState,
  initialRouteState,
}: UseFinanceDeskStateParams) {
  const { language } = useLanguage();
  const route = useFinanceDeskRouteState({ initialRouteState, initialComposerState });
  const data = useFinanceMonthlyData(route.routeState);
  const investments = useFinanceSetupInvestments({
    onMovementSaved: data.loadTransactions,
    paymentMethods: data.paymentMethods,
    setPaymentMethods: data.setPaymentMethods,
  });
  const composer = useFinanceTransactionComposer({
    composerState: route.composerState,
    composerSessionId: route.composerSessionId,
    currentUserId: data.currentUserId,
    onClose: route.closeComposer,
    onComposerStateChange: route.setComposerState,
    paymentMethods: data.paymentMethods,
    recurring: data.recurring,
    setRecurring: data.setRecurring,
    tags: data.tags,
    transactions: data.transactions,
    reloadTransactions: data.loadTransactions,
    setTags: data.setTags,
  });

  const monthLabel = formatMonthLabelForLanguage(
    language,
    new Date(route.selectedYear, route.selectedMonth, 1),
  );
  const isCurrentMonth = (() => {
    const currentDate = new Date();
    return (
      route.selectedYear === currentDate.getFullYear() &&
      route.selectedMonth === currentDate.getMonth()
    );
  })();
  const visibleTransactions = useMemo(
    () => data.sortedTransactions.slice(0, route.page * 8),
    [data.sortedTransactions, route.page],
  );
  const creditMethods = useMemo(
    () => data.paymentMethods.filter((method) => method.type === 'CREDIT'),
    [data.paymentMethods],
  );
  const investMethods = useMemo(
    () => data.paymentMethods.filter((method) => method.type === 'INVEST'),
    [data.paymentMethods],
  );

  return {
    ...data,
    ...investments,
    ...route,
    composer,
    activeTransactionId:
      route.composerState?.mode === 'edit' ? route.composerState.transactionId : null,
    creditMethods,
    hasMore: visibleTransactions.length < data.sortedTransactions.length,
    investMethods,
    isCurrentMonth,
    monthLabel,
    onEditTransaction: (transaction: (typeof data.transactions)[number]) =>
      route.openEditor(transaction.id, inferComposerIntent(transaction, data.paymentMethods)),
    visibleTransactions,
  };
}
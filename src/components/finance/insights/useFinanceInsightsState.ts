'use client';

import { useMemo, useState } from 'react';

import { useFinanceMonthlyData } from '@/components/finance/hooks/useFinanceMonthlyData';
import { useFinanceSurfaceRouteState } from '@/components/finance/hooks/useFinanceSurfaceRouteState';
import {
  getFinanceAccountMovement,
  getFinanceCategoryBreakdown,
  getFinanceCreditBurden,
  getFinanceRecurringBreakdown,
  getFinanceRouteBreakdown,
  resolveFinanceOperationalRoute,
} from '@/lib/finance/finance-analytics';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatMonthLabelForLanguage } from '@/lib/i18n/locale';
import { buildFinanceDeskHref } from '@/lib/navigation/finance-composer-route-state';
import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

type FinanceInsightsEvidenceState = {
  description: string;
  deskHref: string;
  title: string;
  transactionIds: string[];
} | null;

export function useFinanceInsightsState(initialRouteState: FinanceRouteState) {
  const { language } = useLanguage();
  const isPt = language === 'pt';
  const route = useFinanceSurfaceRouteState({ surface: 'insights', initialRouteState });
  const data = useFinanceMonthlyData(route.routeState);
  const [evidence, setEvidence] = useState<FinanceInsightsEvidenceState>(null);

  const monthLabel = formatMonthLabelForLanguage(
    language,
    new Date(route.selectedYear, route.selectedMonth, 1),
  );
  const currentDate = new Date();
  const isCurrentMonth =
    route.selectedYear === currentDate.getFullYear() &&
    route.selectedMonth === currentDate.getMonth();
  const categoryBreakdown = getFinanceCategoryBreakdown(data.transactions, data.categories);
  const routeBreakdown = getFinanceRouteBreakdown(
    data.transactions,
    data.paymentMethods,
  );
  const creditBurden = getFinanceCreditBurden(
    data.transactions,
    data.paymentMethods,
    data.cardBills,
  );
  const recurringBreakdown = getFinanceRecurringBreakdown(data.transactions);
  const accountMovement = getFinanceAccountMovement(data.transactions, data.accounts);
  const evidenceTransactions = useMemo(
    () =>
      evidence
        ? data.transactions.filter((transaction) => evidence.transactionIds.includes(transaction.id))
        : [],
    [data.transactions, evidence],
  );

  return {
    ...data,
    ...route,
    accountMovement,
    categoryBreakdown,
    closeEvidence: () => setEvidence(null),
    creditBurden,
    evidence,
    evidenceTransactions,
    isCurrentMonth,
    monthLabel,
    routeBreakdown,
    openAccountEvidence: (accountId: string, label: string) =>
      setEvidence({
        description: isPt
          ? 'Lançamentos vinculados a esta conta no mês.'
          : 'Entries tied to this account in the month.',
        deskHref: buildFinanceDeskHref(
          { ...route.routeState, accountId },
          null,
        ),
        title: isPt ? `Movimento em ${label}` : `Movement in ${label}`,
        transactionIds: data.transactions.filter((item) => item.accountId === accountId).map((item) => item.id),
      }),
    openCategoryEvidence: (categoryId: string, label: string) =>
      setEvidence({
        description: isPt
          ? 'Gastos que alimentam esta leitura de categoria.'
          : 'Expenses behind this category read.',
        deskHref: buildFinanceDeskHref(
          { ...route.routeState, group: 'EXPENSE', type: categoryId === 'uncategorized' ? 'all' : categoryId },
          null,
        ),
        title: isPt ? `Para onde foi: ${label}` : `Where it went: ${label}`,
        transactionIds: data.transactions.filter((item) => (item.categoryId ?? 'uncategorized') === categoryId).map((item) => item.id),
      }),
    openRouteEvidence: (routeId: string, label: string) =>
      setEvidence({
        description: isPt
          ? 'Lançamentos que usam este caminho de dinheiro.'
          : 'Entries using this money route.',
        deskHref: buildFinanceDeskHref(
          { ...route.routeState, route: routeId },
          null,
        ),
        title: isPt ? `Como o dinheiro passou: ${label}` : `How money moved: ${label}`,
        transactionIds: data.transactions.filter((item) => resolveFinanceOperationalRoute(item, data.paymentMethods) === routeId).map((item) => item.id),
      }),
    openCreditEvidence: () =>
      setEvidence({
        description: isPt
          ? 'Compras do mês que passaram pelo crédito.'
          : 'Month purchases that went through credit.',
        deskHref: buildFinanceDeskHref(
          { ...route.routeState, route: 'credit' },
          null,
        ),
        title: isPt ? 'Crédito do mês' : 'Month credit',
        transactionIds: creditBurden.creditTransactions.map((item) => item.id),
      }),
    openRecurringEvidence: (kind: 'recurring' | 'discretionary') =>
      setEvidence({
        description: isPt
          ? 'Recorte entre fluxo recorrente e gasto discricionário.'
          : 'Split between planned flow and discretionary spend.',
        deskHref: buildFinanceDeskHref(route.routeState, null),
        title:
          kind === 'recurring'
            ? isPt
              ? 'Fluxo recorrente'
              : 'Planned flow'
            : isPt
              ? 'Fluxo discricionário'
              : 'Discretionary flow',
        transactionIds:
          kind === 'recurring'
            ? recurringBreakdown.recurring.map((item) => item.id)
            : recurringBreakdown.discretionary.map((item) => item.id),
      }),
    recurringBreakdown,
  };
}
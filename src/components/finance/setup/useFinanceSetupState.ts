import { useCallback, useMemo } from 'react';

import type { FinanceRecurring } from '@/lib/api/finance';

import { useFinanceSetupAccounts } from './useFinanceSetupAccounts';
import { useFinanceSetupData } from './useFinanceSetupData';
import { useFinanceSetupInvestments } from './useFinanceSetupInvestments';
import { useFinanceSetupPaymentMethods } from './useFinanceSetupPaymentMethods';
import { useFinanceSetupRecurring } from './useFinanceSetupRecurring';
import { useFinanceSetupTaxonomy } from './useFinanceSetupTaxonomy';

export function useFinanceSetupState() {
  const data = useFinanceSetupData();
  const { isSaving: isAccountSaving, ...accountsState } = useFinanceSetupAccounts({
    setAccounts: data.setAccounts,
  });
  const { isSaving: isMethodSaving, ...paymentMethodsState } =
    useFinanceSetupPaymentMethods({
      setPaymentMethods: data.setPaymentMethods,
    });
  const { isSaving: isRecurringSaving, ...recurringState } = useFinanceSetupRecurring({
    setRecurring: data.setRecurring,
  });
  const { isSaving: isTaxonomySaving, ...taxonomyState } = useFinanceSetupTaxonomy({
    setCategories: data.setCategories,
    setTags: data.setTags,
  });
  const { isSaving: isInvestmentSaving, ...investmentsState } =
    useFinanceSetupInvestments({
      paymentMethods: data.paymentMethods,
      setPaymentMethods: data.setPaymentMethods,
    });

  const creditMethods = useMemo(
    () => data.paymentMethods.filter((method) => method.type === 'CREDIT'),
    [data.paymentMethods],
  );

  const immediateMethods = useMemo(
    () =>
      data.paymentMethods.filter(
        (method) => method.type === 'DEBIT' || method.type === 'PIX',
      ),
    [data.paymentMethods],
  );

  const investMethods = useMemo(
    () => data.paymentMethods.filter((method) => method.type === 'INVEST'),
    [data.paymentMethods],
  );

  const expenseCategories = useMemo(
    () => data.categories.filter((category) => category.group === 'EXPENSE'),
    [data.categories],
  );

  const incomeCategories = useMemo(
    () => data.categories.filter((category) => category.group === 'INCOME'),
    [data.categories],
  );

  const recurringStatus = useCallback(
    (item: FinanceRecurring) => {
      const missingAccount =
        item.accountId && !data.accounts.some((account) => account.id === item.accountId);
      const missingCategory =
        item.categoryId &&
        !data.categories.some((category) => category.id === item.categoryId);

      if (missingAccount || missingCategory) {
        return 'needs-review';
      }

      return item.active ? 'active' : 'paused';
    },
    [data.accounts, data.categories],
  );

  return {
    ...data,
    ...accountsState,
    ...paymentMethodsState,
    ...recurringState,
    ...taxonomyState,
    ...investmentsState,
    creditMethods,
    expenseCategories,
    immediateMethods,
    incomeCategories,
    investMethods,
    isSaving:
      isAccountSaving ||
      isMethodSaving ||
      isRecurringSaving ||
      isTaxonomySaving ||
      isInvestmentSaving,
    recurringStatus,
  };
}
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { ApiError } from '@/lib/api/client';
import {
  createFinancePaymentMethod,
  deleteFinancePaymentMethod,
  updateFinancePaymentMethod,
  type FinancePaymentMethod,
  type FinancePaymentMethodType,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';

import {
  dateFromDay,
  dayFromDateString,
  formatCurrencyDigits,
  parseCurrencyInput,
} from './setup-form-utils';
import {
  emptyPaymentMethodForm,
  type PaymentMethodFormState,
} from './setup-state-model';

type UseFinanceSetupPaymentMethodsParams = {
  setPaymentMethods: Dispatch<SetStateAction<FinancePaymentMethod[]>>;
};

export function useFinanceSetupPaymentMethods({
  setPaymentMethods,
}: UseFinanceSetupPaymentMethodsParams) {
  const { t } = useLanguage();
  const [paymentMethodForm, setPaymentMethodForm] =
    useState<PaymentMethodFormState>(emptyPaymentMethodForm);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<FinancePaymentMethod | null>(null);
  const [paymentMethodDrawerOpen, setPaymentMethodDrawerOpen] = useState(false);
  const [paymentMethodFormError, setPaymentMethodFormError] =
    useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openPaymentMethodDrawer = useCallback(
    (method?: FinancePaymentMethod, presetType?: FinancePaymentMethodType) => {
      setPaymentMethodFormError(null);
      if (method) {
        setEditingPaymentMethod(method);
        setPaymentMethodForm({
          name: method.name,
          type: method.type,
          accountId: method.accountId ?? '',
          currency: method.currency,
          limit: method.limit
            ? formatCurrencyDigits(String(Math.round(method.limit * 100)), method.currency)
            : '',
          closingDay: dateFromDay(method.closingDay),
          dueDay: dateFromDay(method.dueDay),
          balance: method.balance != null ? String(method.balance) : '',
          isPrimary: method.isPrimary,
        });
      } else {
        setEditingPaymentMethod(null);
        setPaymentMethodForm({
          ...emptyPaymentMethodForm,
          type: presetType ?? 'DEBIT',
        });
      }
      setPaymentMethodDrawerOpen(true);
    },
    [],
  );

  const closePaymentMethodDrawer = useCallback(() => {
    setPaymentMethodDrawerOpen(false);
    setEditingPaymentMethod(null);
    setPaymentMethodForm(emptyPaymentMethodForm);
    setPaymentMethodFormError(null);
  }, []);

  const savePaymentMethod = useCallback(async () => {
    if (!paymentMethodForm.name.trim()) {
      setPaymentMethodFormError(
        t.finance.paymentMethodNameRequired ??
          t.finance.paymentMethodNameLabel ??
          t.finance.titleLabel,
      );
      return;
    }

    setIsSaving(true);
    setPaymentMethodFormError(null);
    const parsedLimit = paymentMethodForm.limit
      ? parseCurrencyInput(paymentMethodForm.limit)
      : null;
    const parsedClosingDay = dayFromDateString(paymentMethodForm.closingDay);
    const parsedDueDay = dayFromDateString(paymentMethodForm.dueDay);
    const parsedBalance = paymentMethodForm.balance
      ? Number(paymentMethodForm.balance)
      : null;

    try {
      if (editingPaymentMethod) {
        const updated = await updateFinancePaymentMethod({
          id: editingPaymentMethod.id,
          name: paymentMethodForm.name.trim(),
          type: paymentMethodForm.type,
          accountId: paymentMethodForm.accountId || null,
          currency: paymentMethodForm.currency,
          limit: parsedLimit,
          closingDay: parsedClosingDay,
          dueDay: parsedDueDay,
          balance: parsedBalance,
          isPrimary: paymentMethodForm.isPrimary,
        });
        setPaymentMethods((current) =>
          current
            .map((method) =>
              method.id === updated.id
                ? updated
                : updated.isPrimary
                  ? { ...method, isPrimary: false }
                  : method,
            )
            .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary)),
        );
      } else {
        const created = await createFinancePaymentMethod({
          name: paymentMethodForm.name.trim(),
          type: paymentMethodForm.type,
          accountId: paymentMethodForm.accountId || null,
          currency: paymentMethodForm.currency,
          limit: parsedLimit,
          closingDay: parsedClosingDay,
          dueDay: parsedDueDay,
          balance: parsedBalance,
          isPrimary: paymentMethodForm.isPrimary,
        });
        setPaymentMethods((current) => {
          const normalized = paymentMethodForm.isPrimary
            ? current.map((method) => ({ ...method, isPrimary: false }))
            : current;
          return [...normalized, created].sort(
            (left, right) => Number(right.isPrimary) - Number(left.isPrimary),
          );
        });
      }

      closePaymentMethodDrawer();
    } catch (err) {
      setPaymentMethodFormError(
        err instanceof ApiError ? err.message : t.finance.saveError ?? 'Unable to save.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [closePaymentMethodDrawer, editingPaymentMethod, paymentMethodForm, setPaymentMethods, t]);

  const removePaymentMethod = useCallback(async (method: FinancePaymentMethod) => {
    const confirmed = window.confirm(
      t.finance.deletePaymentMethodConfirm ?? 'Delete this payment method?',
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteFinancePaymentMethod({ id: method.id });
      setPaymentMethods((current) => current.filter((item) => item.id !== method.id));
    } finally {
      setIsSaving(false);
    }
  }, [setPaymentMethods, t]);

  return {
    closePaymentMethodDrawer,
    editingPaymentMethod,
    isSaving,
    openPaymentMethodDrawer,
    paymentMethodDrawerOpen,
    paymentMethodForm,
    paymentMethodFormError,
    removePaymentMethod,
    savePaymentMethod,
    setPaymentMethodForm,
  };
}
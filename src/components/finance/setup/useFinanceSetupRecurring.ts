import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { ApiError } from '@/lib/api/client';
import {
  createFinanceRecurring,
  deleteFinanceRecurring,
  toggleFinanceRecurring,
  updateFinanceRecurring,
  type FinanceRecurring,
} from '@/lib/api/finance';
import {
  normalizeProgrammedChargeCadence,
  resolveProgrammedChargeEndDate,
} from '@/lib/finance/programmed-charge';
import { useLanguage } from '@/lib/i18n/language-context';

import { todayInput } from './setup-form-utils';
import { emptyRecurringForm, type RecurringFormState } from './setup-state-model';

type UseFinanceSetupRecurringParams = {
  setRecurring: Dispatch<SetStateAction<FinanceRecurring[]>>;
};

export function useFinanceSetupRecurring({
  setRecurring,
}: UseFinanceSetupRecurringParams) {
  const { t } = useLanguage();
  const [recurringForm, setRecurringForm] = useState<RecurringFormState>({
    ...emptyRecurringForm,
    nextDue: todayInput(),
  });
  const [editingRecurring, setEditingRecurring] = useState<FinanceRecurring | null>(null);
  const [recurringDrawerOpen, setRecurringDrawerOpen] = useState(false);
  const [recurringFormError, setRecurringFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openRecurringDrawer = useCallback((item?: FinanceRecurring) => {
    setRecurringFormError(null);
    if (item) {
      setEditingRecurring(item);
      setRecurringForm({
        title: item.title,
        amount: String(item.amount),
        group: item.group,
        occurrences: '',
        endMode: item.endDate ? 'end-date' : 'ongoing',
        frequency:
          item.frequency === 'MONTHLY' && (item.interval ?? 1) === 6
            ? 'SEMIANNUAL'
            : item.frequency,
        interval: String(item.interval ?? 1),
        nextDue: item.nextDue,
        endDate: item.endDate ?? '',
        accountId: item.accountId ?? '',
        paymentMethodId: item.paymentMethodId ?? '',
        isSubscription: item.isSubscription ?? false,
        categoryId: item.categoryId ?? '',
        tagIds: item.tagIds ?? [],
        active: item.active,
      });
    } else {
      setEditingRecurring(null);
      setRecurringForm({ ...emptyRecurringForm, nextDue: todayInput() });
    }
    setRecurringDrawerOpen(true);
  }, []);

  const closeRecurringDrawer = useCallback(() => {
    setRecurringDrawerOpen(false);
    setEditingRecurring(null);
    setRecurringForm({ ...emptyRecurringForm, nextDue: todayInput() });
    setRecurringFormError(null);
  }, []);

  const saveRecurring = useCallback(async () => {
    if (!recurringForm.title.trim()) {
      setRecurringFormError(t.finance.titleRequired ?? t.finance.titleLabel);
      return;
    }

    if (!recurringForm.amount) {
      setRecurringFormError(t.finance.amountRequired ?? t.finance.amountLabel);
      return;
    }

    if (!recurringForm.nextDue) {
      setRecurringFormError(t.finance.dateRequired ?? t.finance.dateLabel);
      return;
    }

    if (recurringForm.endMode === 'end-date' && !recurringForm.endDate) {
      setRecurringFormError('Informe quando essa cobrança programada termina');
      return;
    }

    if (
      recurringForm.endMode === 'times' &&
      (!Number.isInteger(Number(recurringForm.occurrences)) ||
        Number(recurringForm.occurrences) < 2)
    ) {
      setRecurringFormError('Informe quantas vezes essa cobrança programada vai acontecer');
      return;
    }

    setIsSaving(true);
    setRecurringFormError(null);
    const cadence = normalizeProgrammedChargeCadence(
      recurringForm.frequency,
      recurringForm.interval,
    );
    const resolvedEndDate = resolveProgrammedChargeEndDate({
      endDate: recurringForm.endDate,
      endMode: recurringForm.endMode,
      frequency: recurringForm.frequency,
      interval: recurringForm.interval,
      occurrences: recurringForm.occurrences,
      startDate: recurringForm.nextDue,
    });
    const payload = {
      title: recurringForm.title.trim(),
      amount: Number(recurringForm.amount),
      group: recurringForm.group,
      frequency: cadence.frequency,
      interval: cadence.interval,
      nextDue: recurringForm.nextDue,
      endDate: resolvedEndDate || null,
      isSubscription: recurringForm.isSubscription,
      accountId: recurringForm.accountId || null,
      paymentMethodId: recurringForm.paymentMethodId || null,
      categoryId: recurringForm.categoryId || null,
      tagIds: recurringForm.tagIds,
      active: recurringForm.active,
    };

    try {
      if (editingRecurring) {
        const updated = await updateFinanceRecurring({
          id: editingRecurring.id,
          ...payload,
        });
        setRecurring((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await createFinanceRecurring(payload);
        setRecurring((current) => [...current, created]);
      }

      closeRecurringDrawer();
    } catch (err) {
      setRecurringFormError(
        err instanceof ApiError ? err.message : t.finance.saveError ?? 'Unable to save.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [closeRecurringDrawer, editingRecurring, recurringForm, setRecurring, t]);

  const removeRecurring = useCallback(async (item: FinanceRecurring) => {
    const confirmed = window.confirm(
      t.finance.deleteConfirmation ?? 'Delete this recurring rule?',
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteFinanceRecurring({ id: item.id });
      setRecurring((current) => current.filter((rule) => rule.id !== item.id));
    } finally {
      setIsSaving(false);
    }
  }, [setRecurring, t]);

  const toggleRecurringActive = useCallback(async (item: FinanceRecurring) => {
    setIsSaving(true);
    try {
      const updated = await updateFinanceRecurring({
        id: item.id,
        active: !item.active,
      });
      setRecurring((current) =>
        current.map((rule) => (rule.id === updated.id ? updated : rule)),
      );
    } finally {
      setIsSaving(false);
    }
  }, [setRecurring]);

  const toggleRecurringPaid = useCallback(async (
    item: FinanceRecurring,
    paid: boolean,
    status?: 'PAID' | 'PENDING',
  ) => {
    setIsSaving(true);
    try {
      const updated = await toggleFinanceRecurring({
        id: item.id,
        paid,
        status,
      });
      setRecurring((current) =>
        current.map((rule) => (rule.id === updated.id ? updated : rule)),
      );
    } catch (err) {
      window.alert(
        err instanceof ApiError ? err.message : t.finance.saveError ?? 'Unable to save.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [setRecurring, t]);

  return {
    closeRecurringDrawer,
    editingRecurring,
    isSaving,
    openRecurringDrawer,
    recurringDrawerOpen,
    recurringForm,
    recurringFormError,
    removeRecurring,
    saveRecurring,
    setRecurringForm,
    toggleRecurringActive,
    toggleRecurringPaid,
  };
}
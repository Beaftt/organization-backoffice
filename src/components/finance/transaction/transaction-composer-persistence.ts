import { createCalendarEvent } from '@/lib/api/calendar';
import {
  createFinanceRecurring,
  createFinanceTransaction,
  deleteFinanceRecurring,
  deleteFinanceTransaction,
  type FinanceRecurring,
  updateFinanceRecurring,
  updateFinanceTransaction,
  type FinanceTag,
  type FinanceTransaction,
} from '@/lib/api/finance';
import {
  normalizeProgrammedChargeCadence,
  resolveProgrammedChargeEndDate,
} from '@/lib/finance/programmed-charge';

import {
  parseCurrencyInput,
  resolveRecurringPaymentMethodId,
} from './transaction-editor-model';
import type { FinanceTransactionComposerForm } from './transaction-composer-model';

type SaveFinanceComposerTransactionParams = {
  editingTransaction: FinanceTransaction | null;
  form: FinanceTransactionComposerForm;
  linkedRecurring: FinanceRecurring | null;
  linkedRecurringId: string | null;
  tags: FinanceTag[];
};

export async function saveFinanceComposerTransaction({
  editingTransaction,
  form,
  linkedRecurring,
  linkedRecurringId,
  tags,
}: SaveFinanceComposerTransactionParams) {
  const participantIds =
    editingTransaction && form.participantIds.length > 0
      ? form.participantIds
      : null;

  const payload = {
    title: form.title.trim(),
    amount: parseCurrencyInput(form.amount),
    currency: form.currency,
    group: form.group,
    status: form.route === 'CREDIT' && form.installments > 1 ? 'PENDING' : form.status,
    occurredAt: form.occurredAt,
    accountId: form.accountId || null,
    paymentMethodId:
      form.route === 'CREDIT'
        ? form.paymentMethodId || null
        : form.immediateBehavior === 'BALANCE'
          ? null
          : form.paymentMethodId || null,
    categoryId: form.intent === 'transfer' ? null : form.categoryId || null,
    tagIds: form.tagIds,
    participantIds,
    description: form.description.trim() || null,
  };

  const tagNames = tags
    .filter((tag) => payload.tagIds?.includes(tag.id))
    .map((tag) => tag.name);
  const canPersistRecurring = form.isRecurring && form.route !== 'CREDIT';
  const cadence = normalizeProgrammedChargeCadence(
    form.recurrenceFrequency,
    form.recurrenceInterval,
  );
  const resolvedEndDate = resolveProgrammedChargeEndDate({
    endDate: form.recurrenceEndDate,
    endMode: form.programmedChargeEndMode,
    frequency: form.recurrenceFrequency,
    interval: form.recurrenceInterval,
    occurrences: form.programmedChargeCount,
    startDate: form.occurredAt,
  });
  const recurringPayload = {
    title: payload.title,
    amount: payload.amount,
    currency: payload.currency,
    group: payload.group,
    frequency: cadence.frequency,
    interval: cadence.interval,
    nextDue: form.occurredAt,
    endDate: resolvedEndDate || null,
    isSubscription: form.isSubscription,
    accountId: payload.accountId,
    paymentMethodId: resolveRecurringPaymentMethodId(form, linkedRecurring),
    categoryId: payload.categoryId,
    tagIds: payload.tagIds,
  };

  if (editingTransaction) {
    let nextRecurringId = linkedRecurringId;

    if (canPersistRecurring) {
      if (linkedRecurringId) {
        await updateFinanceRecurring({ id: linkedRecurringId, ...recurringPayload });
      } else {
        nextRecurringId = (await createFinanceRecurring(recurringPayload)).id;
      }
    } else if (linkedRecurringId) {
      await deleteFinanceRecurring({ id: linkedRecurringId });
      nextRecurringId = null;
    }

    return updateFinanceTransaction({
      id: editingTransaction.id,
      ...payload,
      recurringId: nextRecurringId,
      installmentTotal:
        editingTransaction.installmentTotal && editingTransaction.installmentTotal > 1
          ? form.installments
          : undefined,
      isInstallmentValue:
        editingTransaction.installmentTotal && editingTransaction.installmentTotal > 1
          ? form.isInstallmentValue
          : undefined,
    });
  }

  const recurringId = canPersistRecurring
    ? (await createFinanceRecurring(recurringPayload)).id
    : null;
  const created = await createFinanceTransaction({
    ...payload,
    recurringId,
    installments: form.route === 'CREDIT' ? form.installments : undefined,
    isInstallmentValue: form.route === 'CREDIT' ? form.isInstallmentValue : undefined,
  });

  if (canPersistRecurring && form.addToCalendar) {
    const startAt = new Date(`${form.occurredAt}T09:00:00`);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
    await createCalendarEvent({
      title: payload.title,
      description: payload.description,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      allDay: false,
      tags: tagNames.length > 0 ? tagNames : null,
      recurrence: {
        frequency: recurringPayload.frequency,
        interval: recurringPayload.interval,
      },
    });
  }

  return created;
}

export async function deleteFinanceComposerTransaction(
  transaction: FinanceTransaction,
) {
  await deleteFinanceTransaction({ id: transaction.id });

  if (transaction.recurringId) {
    await deleteFinanceRecurring({ id: transaction.recurringId });
  }
}
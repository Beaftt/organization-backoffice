import type {
  FinancePaymentMethod,
  FinanceRecurring,
  FinanceTransaction,
} from '@/lib/api/finance';
import type { FinanceComposerIntent } from '@/lib/navigation/finance-composer-route-state';

import {
  buildTransactionEditorForm,
  createTransactionEditorForm,
  type TransactionEditorForm,
} from './transaction-editor-model';

export type FinanceComposerStepKey =
  | 'essential'
  | 'context'
  | 'installments'
  | 'details';

export type FinanceTransactionComposerForm = TransactionEditorForm & {
  intent: FinanceComposerIntent;
};

const transferTitle = 'Transferência';

export const hasComposerDetails = (form: FinanceTransactionComposerForm) => {
  return Boolean(
    form.description ||
      form.tagIds.length > 0 ||
      form.isRecurring ||
      form.recurrenceEndDate ||
      form.addToCalendar,
  );
};

export const getComposerSteps = (
  form: FinanceTransactionComposerForm,
  includeDetails: boolean,
): FinanceComposerStepKey[] => {
  const steps: FinanceComposerStepKey[] = ['essential', 'context'];

  if (form.intent === 'credit' && form.installments > 1) {
    steps.push('installments');
    return steps;
  }

  if (includeDetails || hasComposerDetails(form)) {
    steps.push('details');
  }

  return steps;
};

export const applyComposerIntent = (
  current: FinanceTransactionComposerForm,
  intent: FinanceComposerIntent,
): FinanceTransactionComposerForm => {
  const nextTitle =
    intent === 'transfer'
      ? current.title || transferTitle
      : current.title === transferTitle
        ? ''
        : current.title;

  return {
    ...current,
    intent,
    title: nextTitle,
    group: intent === 'income' ? 'INCOME' : 'EXPENSE',
    route: intent === 'credit' ? 'CREDIT' : 'IMMEDIATE',
    immediateBehavior: intent === 'credit' ? 'BALANCE' : 'BALANCE',
    paymentMethodId: intent === 'credit' ? current.paymentMethodId : '',
    categoryId: intent === 'transfer' ? '' : current.categoryId,
    isRecurring: intent === 'credit' || intent === 'transfer' ? false : current.isRecurring,
    isSubscription:
      intent === 'credit' || intent === 'transfer' ? false : current.isSubscription,
    installments: intent === 'credit' ? current.installments || 1 : 1,
    isInstallmentValue: intent === 'credit' ? current.isInstallmentValue : false,
  };
};

export const createFinanceTransactionComposerForm = (
  currentUserId: string,
  intent: FinanceComposerIntent,
) => {
  return applyComposerIntent(
    {
      ...createTransactionEditorForm(currentUserId),
      participantIds: [],
      intent: 'expense',
    },
    intent,
  );
};

export const inferComposerIntent = (
  transaction: FinanceTransaction,
  paymentMethods: FinancePaymentMethod[],
): FinanceComposerIntent => {
  if (transaction.group === 'INCOME') {
    return 'income';
  }

  const paymentMethod = paymentMethods.find(
    (item) => item.id === transaction.paymentMethodId,
  );

  if (paymentMethod?.type === 'CREDIT') {
    return 'credit';
  }

  if (transaction.title.toLowerCase().includes('transfer')) {
    return 'transfer';
  }

  return 'expense';
};

export const buildFinanceComposerFormFromTransaction = (input: {
  currentUserId: string;
  paymentMethods: FinancePaymentMethod[];
  recurring: FinanceRecurring | null;
  transaction: FinanceTransaction;
}) => {
  const intent = inferComposerIntent(input.transaction, input.paymentMethods);
  const form = buildTransactionEditorForm({
    transaction: input.transaction,
    recurring: input.recurring,
    paymentMethods: input.paymentMethods,
    currentUserId: input.currentUserId,
  });

  return applyComposerIntent(
    {
      ...form,
      intent,
    },
    intent,
  );
};

export const createFollowupComposerForm = (
  currentUserId: string,
  form: FinanceTransactionComposerForm,
) => {
  const next = createFinanceTransactionComposerForm(currentUserId, form.intent);

  return {
    ...next,
    accountId: form.accountId,
    categoryId: form.intent === 'transfer' ? '' : form.categoryId,
    currency: form.currency,
    immediateBehavior: form.immediateBehavior,
    occurredAt: form.occurredAt,
    paymentMethodId: form.paymentMethodId,
    route: form.route,
  };
};
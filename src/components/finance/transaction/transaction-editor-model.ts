import type {
  FinanceAccount,
  FinancePaymentMethod,
  FinanceRecurring,
  FinanceTransaction,
} from '@/lib/api/finance';
import type { ProgrammedChargeEndMode } from '@/lib/finance/programmed-charge';

export type TransactionRoute = 'IMMEDIATE' | 'CREDIT';
export type TransactionImmediateBehaviorKind =
  | 'BALANCE'
  | 'DEBIT'
  | 'PIX'
  | 'INVEST';
export type TransactionEditorSection =
  | 'core'
  | 'route'
  | 'schedule'
  | 'details';

export type TransactionEditorForm = {
  title: string;
  amount: string;
  currency: 'BRL' | 'USD';
  group: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING';
  occurredAt: string;
  accountId: string;
  paymentMethodId: string;
  categoryId: string;
  tagIds: string[];
  participantIds: string[];
  description: string;
  isRecurring: boolean;
  isSubscription: boolean;
  addToCalendar: boolean;
  programmedChargeCount: string;
  programmedChargeEndMode: ProgrammedChargeEndMode;
  recurrenceFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'SEMIANNUAL';
  recurrenceInterval: string;
  recurrenceEndDate: string;
  installments: number;
  isInstallmentValue: boolean;
  route: TransactionRoute;
  immediateBehavior: TransactionImmediateBehaviorKind;
};

export type TransactionImmediateBehaviorOption = {
  id: string;
  kind: TransactionImmediateBehaviorKind;
  label: string;
  paymentMethodId?: string;
};

export const resolveTodayInput = (date: Date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

export const formatCurrencyInput = (digits: string, currency: string) => {
  if (!digits) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(digits) / 100);
};

export const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
};

export const createTransactionEditorForm = (
  currentUserId: string,
): TransactionEditorForm => ({
  title: '',
  amount: '',
  currency: 'BRL',
  group: 'EXPENSE',
  status: 'PAID',
  occurredAt: resolveTodayInput(),
  accountId: '',
  paymentMethodId: '',
  categoryId: '',
  tagIds: [],
  participantIds: currentUserId ? [currentUserId] : [],
  description: '',
  isRecurring: false,
  isSubscription: false,
  addToCalendar: false,
  programmedChargeCount: '',
  programmedChargeEndMode: 'ongoing',
  recurrenceFrequency: 'MONTHLY',
  recurrenceInterval: '1',
  recurrenceEndDate: '',
  installments: 1,
  isInstallmentValue: false,
  route: 'IMMEDIATE',
  immediateBehavior: 'BALANCE',
});

export const getSelectableAccounts = (accounts: FinanceAccount[]) =>
  accounts.filter((account) => account.type !== 'CARD');

export const getCreditPaymentMethods = (paymentMethods: FinancePaymentMethod[]) =>
  paymentMethods.filter((paymentMethod) => paymentMethod.type === 'CREDIT');

const isAllowedImmediateMethod = (
  paymentMethod: FinancePaymentMethod,
  group: TransactionEditorForm['group'],
  selectedPaymentMethodId: string,
) => {
  if (paymentMethod.type === 'CREDIT') {
    return false;
  }

  if (paymentMethod.type === 'INVEST') {
    return paymentMethod.id === selectedPaymentMethodId;
  }

  if (group === 'INCOME') {
    return paymentMethod.type === 'PIX';
  }

  return paymentMethod.type === 'DEBIT' || paymentMethod.type === 'PIX';
};

export const getImmediateBehaviorOptions = (
  accountId: string,
  paymentMethods: FinancePaymentMethod[],
  group: TransactionEditorForm['group'],
  selectedPaymentMethodId: string,
): TransactionImmediateBehaviorOption[] => {
  if (!accountId) {
    return [];
  }

  const linkedMethods = paymentMethods.filter(
    (paymentMethod) =>
      paymentMethod.accountId === accountId &&
      isAllowedImmediateMethod(paymentMethod, group, selectedPaymentMethodId),
  );

  return [
    { id: `balance:${accountId}`, kind: 'BALANCE', label: 'Saldo da conta' },
    ...linkedMethods.map((paymentMethod) => ({
      id: paymentMethod.id,
      kind: paymentMethod.type as TransactionImmediateBehaviorKind,
      label:
        paymentMethod.type === 'DEBIT'
          ? 'Debito'
          : paymentMethod.type === 'PIX'
            ? 'Pix'
            : 'Investimento',
      paymentMethodId: paymentMethod.id,
    })),
  ];
};

const resolveImmediateBehavior = (
  paymentMethod?: FinancePaymentMethod,
): TransactionImmediateBehaviorKind => {
  if (!paymentMethod) {
    return 'BALANCE';
  }

  if (paymentMethod.type === 'DEBIT') {
    return 'DEBIT';
  }

  if (paymentMethod.type === 'PIX') {
    return 'PIX';
  }

  if (paymentMethod.type === 'INVEST') {
    return 'INVEST';
  }

  return 'BALANCE';
};

export const buildTransactionEditorForm = (input: {
  transaction: FinanceTransaction | null;
  recurring: FinanceRecurring | null;
  paymentMethods: FinancePaymentMethod[];
  currentUserId: string;
}) => {
  const { transaction, recurring, paymentMethods, currentUserId } = input;

  if (!transaction) {
    return createTransactionEditorForm(currentUserId);
  }

  const selectedPaymentMethod = paymentMethods.find(
    (paymentMethod) => paymentMethod.id === transaction.paymentMethodId,
  );
  const isCreditRoute =
    selectedPaymentMethod?.type === 'CREDIT' && transaction.group === 'EXPENSE';

  return {
    title: transaction.title,
    amount: formatCurrencyInput(
      String(
        Math.round(
          transaction.amount *
            (transaction.installmentTotal && transaction.installmentTotal > 1
              ? transaction.installmentTotal
              : 1) *
            100,
        ),
      ),
      transaction.currency ?? 'BRL',
    ),
    currency: (transaction.currency ?? 'BRL') as 'BRL' | 'USD',
    group: transaction.group,
    status: transaction.status,
    occurredAt: transaction.occurredAt.slice(0, 10),
    accountId: transaction.accountId ?? selectedPaymentMethod?.accountId ?? '',
    paymentMethodId: transaction.paymentMethodId ?? '',
    categoryId: transaction.categoryId ?? '',
    tagIds: transaction.tagIds ?? [],
    participantIds:
      transaction.participantIds ?? (currentUserId ? [currentUserId] : []),
    description: transaction.description ?? '',
    isRecurring: Boolean(recurring ?? transaction.recurringId),
    isSubscription: recurring?.isSubscription ?? false,
    addToCalendar: false,
    programmedChargeCount:
      transaction.installmentTotal && transaction.installmentTotal > 1
        ? String(transaction.installmentTotal)
        : '',
    programmedChargeEndMode:
      transaction.installmentTotal && transaction.installmentTotal > 1
        ? 'times'
        : recurring?.endDate
          ? 'end-date'
          : 'ongoing',
    recurrenceFrequency: recurring?.frequency ?? 'MONTHLY',
    recurrenceInterval: String(recurring?.interval ?? 1),
    recurrenceEndDate: recurring?.endDate ?? '',
    installments: transaction.installmentTotal ?? 1,
    isInstallmentValue: false,
    route: isCreditRoute ? 'CREDIT' : 'IMMEDIATE',
    immediateBehavior: resolveImmediateBehavior(selectedPaymentMethod),
  } satisfies TransactionEditorForm;
};

export const resolveRecurringPaymentMethodId = (
  form: Pick<TransactionEditorForm, 'route' | 'immediateBehavior' | 'paymentMethodId'>,
  linkedRecurring: FinanceRecurring | null,
) => {
  if (linkedRecurring?.paymentMethodId) {
    return linkedRecurring.paymentMethodId;
  }

  if (form.route === 'IMMEDIATE' && form.immediateBehavior !== 'BALANCE') {
    return form.paymentMethodId || null;
  }

  return null;
};

export const getDefaultExpandedSections = (editing: boolean) =>
  editing
    ? (['core', 'schedule', 'details'] as TransactionEditorSection[])
    : (['core', 'route', 'schedule'] as TransactionEditorSection[]);
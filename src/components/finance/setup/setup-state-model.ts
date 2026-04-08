import type {
  FinanceAccount,
  FinanceCardBill,
  FinanceCategory,
  FinancePaymentMethod,
  FinancePaymentMethodType,
  FinanceRecurring,
  FinanceTag,
} from '@/lib/api/finance';
import type { ProgrammedChargeEndMode } from '@/lib/finance/programmed-charge';

export type AccountFormState = {
  name: string;
  type: 'CASH' | 'BANK' | 'CARD';
  currency: string;
  isPrimary: boolean;
};

export type PaymentMethodFormState = {
  name: string;
  type: FinancePaymentMethodType;
  accountId: string;
  currency: string;
  limit: string;
  closingDay: string;
  dueDay: string;
  balance: string;
  isPrimary: boolean;
};

export type RecurringFormFrequency = FinanceRecurring['frequency'] | 'SEMIANNUAL';

export type RecurringFormState = {
  title: string;
  amount: string;
  group: 'INCOME' | 'EXPENSE';
  occurrences: string;
  endMode: ProgrammedChargeEndMode;
  frequency: RecurringFormFrequency;
  interval: string;
  nextDue: string;
  endDate: string;
  accountId: string;
  paymentMethodId: string;
  isSubscription: boolean;
  categoryId: string;
  tagIds: string[];
  active: boolean;
};

export type TaxonomyOverlayState = {
  kind: 'category' | 'tag' | null;
  editingCategory: FinanceCategory | null;
  editingTag: FinanceTag | null;
  name: string;
  group: 'INCOME' | 'EXPENSE';
  error: string | null;
};

export type InvestmentActionState = {
  mode: 'deposit' | 'withdraw' | 'transfer' | null;
  step: 1 | 2;
  targetInvestmentId: string;
  fromInvestmentId: string;
  toInvestmentId: string;
  accountId: string;
  amount: string;
  occurredAt: string;
  error: string | null;
};

export type FinanceSetupDataState = {
  tags: FinanceTag[];
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  paymentMethods: FinancePaymentMethod[];
  cardBills: Record<string, FinanceCardBill>;
  recurring: FinanceRecurring[];
};

export const emptyAccountForm: AccountFormState = {
  name: '',
  type: 'BANK',
  currency: 'BRL',
  isPrimary: false,
};

export const emptyPaymentMethodForm: PaymentMethodFormState = {
  name: '',
  type: 'DEBIT',
  accountId: '',
  currency: 'BRL',
  limit: '',
  closingDay: '',
  dueDay: '',
  balance: '',
  isPrimary: false,
};

export const emptyRecurringForm: RecurringFormState = {
  title: '',
  amount: '',
  group: 'EXPENSE',
  occurrences: '',
  endMode: 'ongoing',
  frequency: 'MONTHLY',
  interval: '1',
  nextDue: '',
  endDate: '',
  accountId: '',
  paymentMethodId: '',
  isSubscription: false,
  categoryId: '',
  tagIds: [],
  active: true,
};

export const emptyTaxonomyOverlay: TaxonomyOverlayState = {
  kind: null,
  editingCategory: null,
  editingTag: null,
  name: '',
  group: 'EXPENSE',
  error: null,
};

export const emptyInvestmentAction: InvestmentActionState = {
  mode: null,
  step: 1,
  targetInvestmentId: '',
  fromInvestmentId: '',
  toInvestmentId: '',
  accountId: '',
  amount: '',
  occurredAt: '',
  error: null,
};
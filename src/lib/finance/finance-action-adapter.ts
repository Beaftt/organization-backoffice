import {
  createFinanceTransaction,
  getFinanceCardBill,
  listFinanceAccounts,
  listFinanceCategories,
  listFinancePaymentMethods,
  listFinanceRecurring,
  listFinanceTags,
  listFinanceTransactions,
  payFinanceCardBill,
  transferFinanceInvestments,
  updateFinancePaymentMethod,
  type FinanceAccount,
  type FinanceCardBill,
  type FinanceCategory,
  type FinancePaymentMethod,
  type FinanceRecurring,
  type FinanceTag,
} from '@/lib/api/finance';

export type FinanceBaseSnapshot = {
  tags: FinanceTag[];
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  paymentMethods: FinancePaymentMethod[];
  recurring: FinanceRecurring[];
  cardBills: Record<string, FinanceCardBill>;
};

export type FinanceInvestmentMovementMode = 'deposit' | 'withdraw' | 'transfer';

export const loadFinanceCardBillsSnapshot = async (
  methods: FinancePaymentMethod[],
) => {
  const creditMethods = methods.filter((method) => method.type === 'CREDIT');

  if (creditMethods.length === 0) {
    return {};
  }

  const results = await Promise.allSettled(
    creditMethods.map((method) =>
      getFinanceCardBill({ paymentMethodId: method.id }),
    ),
  );

  return results.reduce<Record<string, FinanceCardBill>>((accumulator, result, index) => {
    if (result.status === 'fulfilled') {
      accumulator[creditMethods[index].id] = result.value;
    }

    return accumulator;
  }, {});
};

export const loadFinanceBaseSnapshot = async (): Promise<FinanceBaseSnapshot> => {
  const [tags, categories, accounts, paymentMethods, recurring] = await Promise.all([
    listFinanceTags(),
    listFinanceCategories(),
    listFinanceAccounts(),
    listFinancePaymentMethods(),
    listFinanceRecurring(),
  ]);

  const cardBills = await loadFinanceCardBillsSnapshot(paymentMethods);

  return {
    tags,
    categories,
    accounts,
    paymentMethods,
    recurring,
    cardBills,
  };
};

export const loadFinanceTransactionsSnapshot = (input: {
  accountId?: string;
  q?: string;
  group?: 'INCOME' | 'EXPENSE';
  paymentMethodId?: string;
  status?: 'PAID' | 'PENDING';
  categoryId?: string;
  from?: string;
  to?: string;
}) => listFinanceTransactions(input);

export const payFinanceCardBillAction = (input: {
  paymentMethodId: string;
  amount?: number;
  paidAt: string;
}) => payFinanceCardBill(input);

export const runFinanceInvestmentMovement = async (input: {
  mode: Exclude<FinanceInvestmentMovementMode, 'transfer'>;
  paymentMethod: FinancePaymentMethod;
  amount: number;
  occurredAt: string;
  accountId?: string | null;
}) => {
  const currentBalance = input.paymentMethod.balance ?? 0;
  const nextBalance =
    input.mode === 'deposit'
      ? currentBalance + input.amount
      : currentBalance - input.amount;

  const updatedPaymentMethod = await updateFinancePaymentMethod({
    id: input.paymentMethod.id,
    balance: nextBalance,
  });

  const movementTransaction = input.paymentMethod.accountId
    ? await createFinanceTransaction({
        accountId: input.accountId ?? input.paymentMethod.accountId,
        paymentMethodId: input.paymentMethod.id,
        group: input.mode === 'deposit' ? 'EXPENSE' : 'INCOME',
        amount: input.amount,
        status: 'PAID',
        occurredAt: input.occurredAt,
        title: `${input.mode === 'deposit' ? 'Depósito' : 'Resgate'} — ${input.paymentMethod.name}`,
      })
    : null;

  return {
    updatedPaymentMethod,
    movementTransaction,
  };
};

export const runFinanceInvestmentTransfer = (input: {
  fromInvestmentId: string;
  toInvestmentId: string;
  amount: number;
}) => transferFinanceInvestments(input);
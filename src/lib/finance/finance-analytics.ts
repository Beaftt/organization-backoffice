import type {
  FinanceAccount,
  FinanceCardBill,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTransaction,
} from '@/lib/api/finance';

export type FinanceTransactionSort = 'date' | 'amount';
export type FinanceChannel = 'balance' | 'credit' | 'debit' | 'pix' | 'invest';
export type FinanceOperationalRoute =
  | 'debit-pix'
  | 'credit'
  | 'income'
  | 'transfer'
  | 'investment';

export type FinanceBreakdownItem = {
  id: string;
  label: string;
  amount: number;
  count: number;
};

const channelLabels: Record<FinanceChannel, string> = {
  balance: 'Saldo',
  credit: 'Crédito',
  debit: 'Débito',
  pix: 'Pix',
  invest: 'Investimento',
};

const routeLabels: Record<FinanceOperationalRoute, string> = {
  'debit-pix': 'Débito / Pix',
  credit: 'Crédito',
  income: 'Receita',
  transfer: 'Transferência',
  investment: 'Investimento',
};

export const sortFinanceTransactions = (
  transactions: FinanceTransaction[],
  sortBy: FinanceTransactionSort,
) => {
  return [...transactions].sort((left, right) => {
    if (sortBy === 'amount') {
      return Math.abs(right.amount) - Math.abs(left.amount);
    }

    return (
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    );
  });
};

export const getFinanceTotals = (transactions: FinanceTransaction[]) => {
  return transactions.reduce(
    (totals, item) => {
      if (item.group === 'INCOME') {
        totals.totalIncome += item.amount;
      } else {
        totals.totalExpense += item.amount;
      }

      return totals;
    },
    { totalIncome: 0, totalExpense: 0 },
  );
};

export const resolveFinanceChannel = (
  transaction: FinanceTransaction,
  paymentMethods: FinancePaymentMethod[],
): FinanceChannel => {
  if (!transaction.paymentMethodId) {
    return 'balance';
  }

  const method = paymentMethods.find(
    (paymentMethod) => paymentMethod.id === transaction.paymentMethodId,
  );

  if (!method) {
    return 'balance';
  }

  if (method.type === 'CREDIT') {
    return 'credit';
  }

  if (method.type === 'DEBIT') {
    return 'debit';
  }

  if (method.type === 'PIX') {
    return 'pix';
  }

  return 'invest';
};

export const resolveFinanceOperationalRoute = (
  transaction: FinanceTransaction,
  paymentMethods: FinancePaymentMethod[],
): FinanceOperationalRoute => {
  const normalizedTitle = transaction.title.trim().toLowerCase();

  if (normalizedTitle.includes('transfer')) {
    return 'transfer';
  }

  const method = paymentMethods.find(
    (paymentMethod) => paymentMethod.id === transaction.paymentMethodId,
  );

  if (method?.type === 'INVEST') {
    return 'investment';
  }

  if (transaction.group === 'INCOME') {
    return 'income';
  }

  if (method?.type === 'CREDIT') {
    return 'credit';
  }

  return 'debit-pix';
};

export const getFinanceRouteBreakdown = (
  transactions: FinanceTransaction[],
  paymentMethods: FinancePaymentMethod[],
) => {
  const totals = new Map<FinanceOperationalRoute, FinanceBreakdownItem>();

  transactions.forEach((item) => {
    const route = resolveFinanceOperationalRoute(item, paymentMethods);
    const current = totals.get(route);

    totals.set(route, {
      id: route,
      label: routeLabels[route],
      amount: (current?.amount ?? 0) + item.amount,
      count: (current?.count ?? 0) + 1,
    });
  });

  return [...totals.values()].sort((left, right) => right.amount - left.amount);
};

export const matchesFinanceOperationalRoute = (
  transaction: FinanceTransaction,
  paymentMethods: FinancePaymentMethod[],
  routeFilter: string,
) => {
  if (routeFilter === 'all') {
    return true;
  }

  return resolveFinanceOperationalRoute(transaction, paymentMethods) === routeFilter;
};

export const getFinanceCategoryBreakdown = (
  transactions: FinanceTransaction[],
  categories: FinanceCategory[],
) => {
  const expenseMap = new Map(
    categories
      .filter((category) => category.group === 'EXPENSE')
      .map((category) => [category.id, category.name]),
  );
  const totals = new Map<string, FinanceBreakdownItem>();

  transactions
    .filter((item) => item.group === 'EXPENSE')
    .forEach((item) => {
      const label = item.categoryId
        ? expenseMap.get(item.categoryId) ?? 'Sem categoria'
        : 'Sem categoria';
      const id = item.categoryId ?? 'uncategorized';
      const current = totals.get(id);
      totals.set(id, {
        id,
        label,
        amount: (current?.amount ?? 0) + item.amount,
        count: (current?.count ?? 0) + 1,
      });
    });

  return [...totals.values()].sort((left, right) => right.amount - left.amount);
};

export const getFinanceChannelBreakdown = (
  transactions: FinanceTransaction[],
  paymentMethods: FinancePaymentMethod[],
) => {
  const totals = new Map<FinanceChannel, FinanceBreakdownItem>();

  transactions.forEach((item) => {
    const channel = resolveFinanceChannel(item, paymentMethods);
    const current = totals.get(channel);

    totals.set(channel, {
      id: channel,
      label: channelLabels[channel],
      amount: (current?.amount ?? 0) + item.amount,
      count: (current?.count ?? 0) + 1,
    });
  });

  return [...totals.values()].sort((left, right) => right.amount - left.amount);
};

export const getFinanceCreditBurden = (
  transactions: FinanceTransaction[],
  paymentMethods: FinancePaymentMethod[],
  cardBills: Record<string, FinanceCardBill>,
) => {
  const creditIds = new Set(
    paymentMethods
      .filter((paymentMethod) => paymentMethod.type === 'CREDIT')
      .map((paymentMethod) => paymentMethod.id),
  );
  const creditTransactions = transactions.filter(
    (item) => item.paymentMethodId && creditIds.has(item.paymentMethodId),
  );
  const cardsUsedCount = new Set(
    creditTransactions
      .map((item) => item.paymentMethodId)
      .filter((item): item is string => Boolean(item)),
  ).size;
  const totalCredit = creditTransactions.reduce((sum, item) => sum + item.amount, 0);
  const totalRemaining = Object.values(cardBills).reduce((sum, bill) => sum + bill.remainingAmount, 0);

  return { cardsUsedCount, creditTransactions, totalCredit, totalRemaining };
};

export const getFinanceRecurringBreakdown = (
  transactions: FinanceTransaction[],
) => {
  const recurring = transactions.filter((item) => Boolean(item.recurringId));
  const discretionary = transactions.filter((item) => !item.recurringId);
  return {
    recurring,
    recurringAmount: recurring.reduce((sum, item) => sum + item.amount, 0),
    discretionary,
    discretionaryAmount: discretionary.reduce((sum, item) => sum + item.amount, 0),
  };
};

export const getFinanceAccountMovement = (
  transactions: FinanceTransaction[],
  accounts: FinanceAccount[],
) => {
  const totals = new Map<string, FinanceBreakdownItem>();
  const labels = new Map(accounts.map((account) => [account.id, account.name]));

  transactions.forEach((item) => {
    const id = item.accountId ?? 'unassigned';
    const current = totals.get(id);
    totals.set(id, {
      id,
      label: item.accountId ? labels.get(item.accountId) ?? 'Conta desconhecida' : 'Sem conta',
      amount:
        (current?.amount ?? 0) +
        (item.group === 'INCOME' ? item.amount : item.amount * -1),
      count: (current?.count ?? 0) + 1,
    });
  });

  return [...totals.values()].sort(
    (left, right) => Math.abs(right.amount) - Math.abs(left.amount),
  );
};
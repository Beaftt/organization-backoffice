import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FinanceRecurring, FinanceTransaction } from '@/lib/api/finance';
import type { FinanceTransaction } from '@/lib/api/finance';
import * as financeApi from '@/lib/api/finance';

import { createFinanceTransactionComposerForm } from '../transaction-composer-model';
import { saveFinanceComposerTransaction } from '../transaction-composer-persistence';

vi.mock('@/lib/api/calendar', () => ({
  createCalendarEvent: vi.fn(),
}));

vi.mock('@/lib/api/finance', async (importOriginal) => {
  const original = await importOriginal<typeof financeApi>();

  return {
    ...original,
    createFinanceRecurring: vi.fn(),
    createFinanceTransaction: vi.fn(),
    deleteFinanceRecurring: vi.fn(),
    deleteFinanceTransaction: vi.fn(),
    updateFinanceRecurring: vi.fn(),
    updateFinanceTransaction: vi.fn(),
  };
});

const existingTransaction: FinanceTransaction = {
  id: 'tx-1',
  workspaceId: 'ws-1',
  title: 'Mercado',
  amount: 120,
  currency: 'BRL',
  group: 'EXPENSE',
  status: 'PAID',
  occurredAt: '2026-04-03',
  description: null,
  accountId: 'acc-1',
  categoryId: 'cat-1',
  tagIds: [],
  participantIds: ['user-1', 'user-2'],
  recurringId: null,
  createdAt: '',
  updatedAt: '',
  settledAt: null,
  paymentMethodId: null,
  installmentIndex: null,
  installmentTotal: null,
};

const linkedRecurring: FinanceRecurring = {
  id: 'rec-1',
  workspaceId: 'ws-1',
  title: 'Mercado mensal',
  amount: 120,
  currency: 'BRL',
  group: 'EXPENSE',
  frequency: 'MONTHLY',
  interval: 1,
  nextDue: '2026-04-03',
  endDate: null,
  active: true,
  isSubscription: true,
  accountId: 'acc-1',
  paymentMethodId: 'card-1',
  categoryId: 'cat-1',
  tagIds: [],
  createdAt: '',
  updatedAt: '',
  installmentTotal: null,
};

describe('transaction-composer-persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeApi.createFinanceTransaction).mockResolvedValue(existingTransaction);
    vi.mocked(financeApi.createFinanceRecurring).mockResolvedValue(linkedRecurring);
    vi.mocked(financeApi.updateFinanceTransaction).mockResolvedValue(existingTransaction);
    vi.mocked(financeApi.updateFinanceRecurring).mockResolvedValue(linkedRecurring);
  });

  it('omits hidden participant ids when creating a transaction', async () => {
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    form.title = 'Mercado';
    form.amount = '12345';
    form.accountId = 'acc-1';
    form.occurredAt = '2026-04-03';
    form.participantIds = ['user-1'];

    await saveFinanceComposerTransaction({
      editingTransaction: null,
      form,
      linkedRecurring: null,
      linkedRecurringId: null,
      tags: [],
    });

    expect(financeApi.createFinanceTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ participantIds: null }),
    );
  });

  it('preserves participant ids when updating an existing transaction', async () => {
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    form.title = 'Mercado';
    form.amount = '12345';
    form.accountId = 'acc-1';
    form.occurredAt = '2026-04-03';
    form.participantIds = ['user-1', 'user-2'];

    await saveFinanceComposerTransaction({
      editingTransaction: existingTransaction,
      form,
      linkedRecurring: null,
      linkedRecurringId: null,
      tags: [],
    });

    expect(financeApi.updateFinanceTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'tx-1',
        participantIds: ['user-1', 'user-2'],
      }),
    );
  });

  it('preserves subscription and recurring payment method when updating a linked recurring rule', async () => {
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    form.title = 'Mercado';
    form.amount = '12345';
    form.accountId = 'acc-1';
    form.occurredAt = '2026-04-03';
    form.isRecurring = true;
    form.isSubscription = true;

    await saveFinanceComposerTransaction({
      editingTransaction: existingTransaction,
      form,
      linkedRecurring,
      linkedRecurringId: linkedRecurring.id,
      tags: [],
    });

    expect(financeApi.updateFinanceRecurring).toHaveBeenCalledWith(
      expect.objectContaining({
        id: linkedRecurring.id,
        isSubscription: true,
        paymentMethodId: 'card-1',
      }),
    );
  });

  it('inherits the immediate payment method when creating a recurring rule from the composer', async () => {
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    form.title = 'Academia';
    form.amount = '9999';
    form.accountId = 'acc-1';
    form.occurredAt = '2026-04-10';
    form.isRecurring = true;
    form.immediateBehavior = 'PIX';
    form.paymentMethodId = 'pix-1';

    await saveFinanceComposerTransaction({
      editingTransaction: null,
      form,
      linkedRecurring: null,
      linkedRecurringId: null,
      tags: [],
    });

    expect(financeApi.createFinanceRecurring).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethodId: 'pix-1',
      }),
    );
  });
});
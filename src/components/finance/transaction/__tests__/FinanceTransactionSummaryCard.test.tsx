import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
} from '@/lib/api/finance';
import { FinanceTransactionSummaryCard } from '@/components/finance/transaction/FinanceTransactionSummaryCard';
import { createFinanceTransactionComposerForm } from '@/components/finance/transaction/transaction-composer-model';

const mockLanguage = { current: 'pt' as 'pt' | 'en' };

const financeText = {
  pt: {
    accountLabel: 'Conta',
    amountLabel: 'Valor',
    reviewLabel: 'Resumo',
    statusLabel: 'Status',
    statusPaid: 'Pago',
    statusPending: 'Pendente',
    typeLabel: 'Categoria',
  },
  en: {
    accountLabel: 'Account',
    amountLabel: 'Amount',
    reviewLabel: 'Summary',
    statusLabel: 'Status',
    statusPaid: 'Paid',
    statusPending: 'Pending',
    typeLabel: 'Category',
  },
};

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      finance: financeText[mockLanguage.current],
    },
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

const accounts: FinanceAccount[] = [];

const categories: FinanceCategory[] = [];

const paymentMethods: FinancePaymentMethod[] = [];

describe('FinanceTransactionSummaryCard', () => {
  it('renders localized English fallbacks and currency formatting', () => {
    mockLanguage.current = 'en';
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    form.amount = '24000';
    form.currency = 'BRL';

    render(
      <FinanceTransactionSummaryCard
        accounts={accounts}
        categories={categories}
        form={form}
        paymentMethods={paymentMethods}
      />,
    );

    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('No account')).toBeInTheDocument();
    expect(screen.getByText('No category')).toBeInTheDocument();
    expect(screen.getByText('This month only')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?240\.00/)).toBeInTheDocument();
  });

  it('renders localized Portuguese fallbacks', () => {
    mockLanguage.current = 'pt';
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    render(
      <FinanceTransactionSummaryCard
        accounts={accounts}
        categories={categories}
        form={form}
        paymentMethods={paymentMethods}
      />,
    );

    expect(screen.getByText('Resumo')).toBeInTheDocument();
    expect(screen.getByText('Sem conta')).toBeInTheDocument();
    expect(screen.getByText('Sem categoria')).toBeInTheDocument();
    expect(screen.getByText('Só este mês')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?0,00/)).toBeInTheDocument();
  });
});
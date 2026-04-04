import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CardsSection } from '@/components/finance/payment-methods/CardsSection';
import type { FinanceCardBill, FinancePaymentMethod } from '@/lib/api/finance';

const mockLanguage = { current: 'pt' as 'pt' | 'en' };

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      finance: {
        addTagAction: mockLanguage.current === 'pt' ? 'Nova tag' : 'New tag',
        billPay: mockLanguage.current === 'pt' ? 'Pagar' : 'Pay',
        cardsEmpty: mockLanguage.current === 'pt' ? 'Nenhum cartão cadastrado.' : 'No cards registered.',
        cardsEmptyHint:
          mockLanguage.current === 'pt'
            ? 'Adicione um cartão para rastrear gastos automaticamente.'
            : 'Add a card to track expenses automatically.',
        deleteAction: mockLanguage.current === 'pt' ? 'Excluir' : 'Delete',
        editAction: mockLanguage.current === 'pt' ? 'Editar' : 'Edit',
        empty: mockLanguage.current === 'pt' ? 'Vazio' : 'Empty',
        paymentMethodAdd: mockLanguage.current === 'pt' ? 'Adicionar método' : 'Add method',
        paymentMethodCredit: mockLanguage.current === 'pt' ? 'Crédito' : 'Credit',
        paymentMethodDebit: mockLanguage.current === 'pt' ? 'Débito' : 'Debit',
        paymentMethodPix: 'Pix',
        paymentMethodsTotal: mockLanguage.current === 'pt' ? 'Total' : 'Total',
      },
    },
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

const creditMethod = {
  id: 'card-1',
  name: 'Cartão 1',
  type: 'CREDIT',
  currency: 'BRL',
  isPrimary: true,
} as FinancePaymentMethod;

const pixMethod = {
  id: 'pix-1',
  name: 'Pix principal',
  type: 'PIX',
  currency: 'BRL',
  isPrimary: false,
} as FinancePaymentMethod;

const cardBills: Record<string, FinanceCardBill> = {
  'card-1': {
    id: 'bill-1',
    paymentMethodId: 'card-1',
    remainingAmount: 258.27,
  } as FinanceCardBill,
};

describe('CardsSection', () => {
  it('renders localized card cycle copy in Portuguese', () => {
    mockLanguage.current = 'pt';

    render(
      <CardsSection
        cardMethods={[creditMethod, pixMethod]}
        cardBills={cardBills}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onPayBill={vi.fn()}
      />,
    );

    expect(screen.getByText('Crédito do mês (1)')).toBeInTheDocument();
    expect(screen.getByText(/Em aberto no ciclo:\s*R\$\s*258,27/)).toBeInTheDocument();
    expect(screen.getByText('Outros métodos (1)')).toBeInTheDocument();
  });

  it('renders localized card cycle copy and values in English', () => {
    mockLanguage.current = 'en';

    render(
      <CardsSection
        cardMethods={[creditMethod]}
        cardBills={cardBills}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onPayBill={vi.fn()}
      />,
    );

    expect(screen.getByText('Month credit (1)')).toBeInTheDocument();
    expect(screen.getByText(/Still open in cycle:\s*R\$258\.27/)).toBeInTheDocument();
  });

  it('shows the empty state when there are no payment methods', () => {
    mockLanguage.current = 'pt';

    render(
      <CardsSection
        cardMethods={[]}
        cardBills={{}}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhum cartão cadastrado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar método' })).toBeInTheDocument();
  });

  it('calls payment and management actions when users interact with card controls', async () => {
    mockLanguage.current = 'pt';

    const user = userEvent.setup();
    const onPayBill = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CardsSection
        cardMethods={[creditMethod]}
        cardBills={cardBills}
        onAdd={vi.fn()}
        onDelete={onDelete}
        onEdit={onEdit}
        onPayBill={onPayBill}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Pagar' }));
    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onPayBill).toHaveBeenCalledWith(creditMethod);
    expect(onEdit).toHaveBeenCalledWith(creditMethod);
    expect(onDelete).toHaveBeenCalledWith(creditMethod);
  });
});
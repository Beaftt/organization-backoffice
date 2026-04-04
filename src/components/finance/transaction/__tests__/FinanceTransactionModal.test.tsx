import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceTransactionModal } from '@/components/finance/transaction/FinanceTransactionModal';
import { createFinanceTransactionComposerForm } from '@/components/finance/transaction/transaction-composer-model';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      finance: {
        cancel: 'Cancelar',
        details: 'Detalhes',
        newTransaction: 'Nova transação',
        save: 'Salvar',
        saving: 'Salvando...',
      },
    },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@/components/finance/transaction/FinanceTransactionEssentialStep', () => ({
  FinanceTransactionEssentialStep: () => <div>Essential step</div>,
}));

vi.mock('@/components/finance/transaction/FinanceTransactionContextStep', () => ({
  FinanceTransactionContextStep: () => <div>Context step</div>,
}));

vi.mock('@/components/finance/transaction/FinanceTransactionOptionalStep', () => ({
  FinanceTransactionOptionalStep: () => <div>Optional step</div>,
}));

vi.mock('@/components/finance/transaction/FinanceTransactionSummaryCard', () => ({
  FinanceTransactionSummaryCard: () => <aside>Summary card</aside>,
}));

const createProps = (
  overrides: Partial<Parameters<typeof FinanceTransactionModal>[0]> = {},
) => ({
  accounts: [],
  categories: [],
  composerState: { mode: 'create', intent: 'expense', step: 2, transactionId: null } as const,
  currentStep: 'context' as const,
  editing: false,
  error: null,
  form: {
    ...createFinanceTransactionComposerForm('user-1', 'expense'),
    amount: 'R$ 120,00',
    title: 'Mercado',
  },
  isSaving: false,
  paymentMethods: [],
  steps: ['essential', 'context'] as const,
  tagDraft: '',
  tags: [],
  onBack: vi.fn(),
  onClose: vi.fn(),
  onDelete: vi.fn(),
  onFieldChange: vi.fn(),
  onIntentChange: vi.fn(),
  onNext: vi.fn(),
  onOpenDetails: vi.fn(),
  onSave: vi.fn(),
  onTagAdd: vi.fn(),
  onTagDraftChange: vi.fn(),
  onTagSuggest: vi.fn(),
  onTagToggle: vi.fn(),
  ...overrides,
});

describe('FinanceTransactionModal', () => {
  it('renders the centered transaction shell when the composer route is open', () => {
    render(<FinanceTransactionModal {...createProps()} />);

    expect(
      screen.getByRole('dialog', { name: 'Nova transação' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1. Base')).toBeInTheDocument();
    expect(screen.getByText('2. Contexto')).toBeInTheDocument();
    expect(screen.getByText('Context step')).toBeInTheDocument();
    expect(screen.getByText('Summary card')).toBeInTheDocument();
  });

  it('opens details and saves both close and add-another modes on the last create step', async () => {
    const user = userEvent.setup();
    const onOpenDetails = vi.fn();
    const onSave = vi.fn();

    render(
      <FinanceTransactionModal
        {...createProps({ onOpenDetails, onSave })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Mais detalhes' }));
    await user.click(screen.getByRole('button', { name: 'Salvar e adicionar outra' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onOpenDetails).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenNthCalledWith(1, 'add-more');
    expect(onSave).toHaveBeenNthCalledWith(2, 'close');
  });

  it('shows edit-specific actions when editing an existing transaction', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <FinanceTransactionModal
        {...createProps({
          composerState: {
            mode: 'edit',
            intent: 'credit',
            step: 3,
            transactionId: 'tx-1',
          },
          currentStep: 'details',
          editing: true,
          form: {
            ...createFinanceTransactionComposerForm('user-1', 'credit'),
            title: 'Fatura supermercado',
          },
          onDelete,
          steps: ['essential', 'context', 'details'],
        })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(screen.getByRole('dialog', { name: 'Editar transação' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar + Adicionar' })).not.toBeInTheDocument();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
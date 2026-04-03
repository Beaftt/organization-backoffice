import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceInvestmentOverlay } from '@/components/finance/setup/FinanceInvestmentOverlay';
import {
  financeText,
  sampleAccount,
  sampleInvestment,
  samplePaymentMethod,
} from '@/components/finance/setup/__tests__/finance-test-data';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: { finance: financeText, modules: { finance: 'Financeiro' } },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceInvestmentOverlay', () => {
  it('renders the step one form for deposit actions', () => {
    render(
      <FinanceInvestmentOverlay
        open
        accounts={[sampleAccount]}
        investments={[sampleInvestment, { ...sampleInvestment, id: 'pm-3', name: 'Tesouro Selic' }]}
        isSaving={false}
        state={{ mode: 'deposit', step: 1, targetInvestmentId: sampleInvestment.id, fromInvestmentId: '', toInvestmentId: '', accountId: sampleAccount.id, amount: '', occurredAt: '2026-03-09', error: null }}
        onBack={vi.fn()}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onContinue={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Aplicar investimento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Conta')).toBeInTheDocument();
  });

  it('renders transfer fields for transfer mode', () => {
    render(
      <FinanceInvestmentOverlay
        open
        accounts={[sampleAccount]}
        investments={[sampleInvestment, { ...samplePaymentMethod, id: 'pm-3', type: 'INVEST', name: 'Tesouro Selic' }]}
        isSaving={false}
        state={{ mode: 'transfer', step: 1, targetInvestmentId: '', fromInvestmentId: '', toInvestmentId: '', accountId: '', amount: '', occurredAt: '2026-03-09', error: null }}
        onBack={vi.fn()}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onContinue={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Origem')).toBeInTheDocument();
    expect(screen.getByText('Destino')).toBeInTheDocument();
  });

  it('calls continue when the primary action is clicked', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();

    render(
      <FinanceInvestmentOverlay
        open
        accounts={[sampleAccount]}
        investments={[sampleInvestment]}
        isSaving={false}
        state={{ mode: 'withdraw', step: 1, targetInvestmentId: sampleInvestment.id, fromInvestmentId: '', toInvestmentId: '', accountId: sampleAccount.id, amount: 'R$ 20,00', occurredAt: '2026-03-09', error: 'Valor obrigatório' }}
        onBack={vi.fn()}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onContinue={onContinue}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Valor obrigatório')).toBeInTheDocument();
  });

  it('renders review mode on step two', () => {
    render(
      <FinanceInvestmentOverlay
        open
        accounts={[sampleAccount]}
        investments={[sampleInvestment]}
        isSaving={false}
        state={{ mode: 'deposit', step: 2, targetInvestmentId: sampleInvestment.id, fromInvestmentId: '', toInvestmentId: '', accountId: sampleAccount.id, amount: 'R$ 40,00', occurredAt: '2026-03-09', error: null }}
        onBack={vi.fn()}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onContinue={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Confirme antes de mover o dinheiro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });
});
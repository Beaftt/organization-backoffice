import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceDeskMonthBand } from '@/components/finance/desk/FinanceDeskMonthBand';

const mockLanguage = { current: 'pt' as 'pt' | 'en' };

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      finance: {
        investWithdraw: mockLanguage.current === 'pt' ? 'Resgatar' : 'Withdraw',
        newTransaction:
          mockLanguage.current === 'pt' ? 'Nova transação' : 'New transaction',
      },
    },
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceDeskMonthBand', () => {
  it('renders the month narrative and monthly totals when viewing the current month', () => {
    mockLanguage.current = 'pt';

    render(
      <FinanceDeskMonthBand
        hasInvestments
        isCurrentMonth
        monthLabel="abril de 2026"
        onOpenDeposit={vi.fn()}
        totalExpense={1800}
        totalIncome={3200}
        onMonthNext={vi.fn()}
        onMonthPrev={vi.fn()}
        onMonthReset={vi.fn()}
        onOpenComposer={vi.fn()}
        onOpenWithdraw={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'abril de 2026' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Painel financeiro')).toBeInTheDocument();
    expect(screen.getByText('Gasto do mês')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hoje' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova transação' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resgatar' })).toBeInTheDocument();
    expect(screen.getByText(/3\.200,00/)).toBeInTheDocument();
  });

  it('calls the month and composer actions when the controls are pressed', async () => {
    mockLanguage.current = 'pt';

    const user = userEvent.setup();
    const onMonthPrev = vi.fn();
    const onMonthNext = vi.fn();
    const onMonthReset = vi.fn();
    const onOpenComposer = vi.fn();
    const onOpenDeposit = vi.fn();
    const onOpenWithdraw = vi.fn();

    render(
      <FinanceDeskMonthBand
        hasInvestments
        isCurrentMonth={false}
        monthLabel="março de 2026"
        onOpenDeposit={onOpenDeposit}
        totalExpense={1800}
        totalIncome={3200}
        onMonthNext={onMonthNext}
        onMonthPrev={onMonthPrev}
        onMonthReset={onMonthReset}
        onOpenComposer={onOpenComposer}
        onOpenWithdraw={onOpenWithdraw}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));
    await user.click(screen.getByRole('button', { name: 'Hoje' }));
    await user.click(screen.getByRole('button', { name: 'Nova transação' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));
    await user.click(screen.getByRole('button', { name: 'Resgatar' }));

    expect(onMonthPrev).toHaveBeenCalledTimes(1);
    expect(onMonthNext).toHaveBeenCalledTimes(1);
    expect(onMonthReset).toHaveBeenCalledTimes(1);
    expect(onOpenComposer).toHaveBeenCalledTimes(1);
    expect(onOpenDeposit).toHaveBeenCalledTimes(1);
    expect(onOpenWithdraw).toHaveBeenCalledTimes(1);
  });

  it('renders English labels and amounts when language changes', () => {
    mockLanguage.current = 'en';

    render(
      <FinanceDeskMonthBand
        hasInvestments
        isCurrentMonth
        monthLabel="April 2026"
        onOpenDeposit={vi.fn()}
        totalExpense={1800}
        totalIncome={3200}
        onMonthNext={vi.fn()}
        onMonthPrev={vi.fn()}
        onMonthReset={vi.fn()}
        onOpenComposer={vi.fn()}
        onOpenWithdraw={vi.fn()}
      />,
    );

    expect(screen.getByText('Finance desk')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New transaction' })).toBeInTheDocument();
    expect(screen.getByText('R$3,200.00')).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceInsightsStoryBand } from '@/components/finance/insights/FinanceInsightsStoryBand';

const mockLanguage = { current: 'pt' as 'pt' | 'en' };

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {},
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceInsightsStoryBand', () => {
  it('renders the monthly explanation and hides the reset action for the current month', () => {
    mockLanguage.current = 'pt';

    render(
      <FinanceInsightsStoryBand
        isCurrentMonth
        monthLabel="abril de 2026"
        totalExpense={1700}
        totalIncome={3200}
        onMonthNext={vi.fn()}
        onMonthPrev={vi.fn()}
        onMonthReset={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'abril de 2026' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Análises financeiras')).toBeInTheDocument();
    expect(screen.getByText(/o mês terminou no azul/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hoje' })).not.toBeInTheDocument();
  });

  it('calls the month controls when navigating or resetting the narrative month', async () => {
    mockLanguage.current = 'pt';

    const user = userEvent.setup();
    const onMonthPrev = vi.fn();
    const onMonthNext = vi.fn();
    const onMonthReset = vi.fn();

    render(
      <FinanceInsightsStoryBand
        isCurrentMonth={false}
        monthLabel="março de 2026"
        totalExpense={2500}
        totalIncome={1800}
        onMonthNext={onMonthNext}
        onMonthPrev={onMonthPrev}
        onMonthReset={onMonthReset}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));
    await user.click(screen.getByRole('button', { name: 'Hoje' }));

    expect(onMonthPrev).toHaveBeenCalledTimes(1);
    expect(onMonthNext).toHaveBeenCalledTimes(1);
    expect(onMonthReset).toHaveBeenCalledTimes(1);
  });

  it('renders English copy when language changes', () => {
    mockLanguage.current = 'en';

    render(
      <FinanceInsightsStoryBand
        isCurrentMonth
        monthLabel="April 2026"
        totalExpense={1700}
        totalIncome={3200}
        onMonthNext={vi.fn()}
        onMonthPrev={vi.fn()}
        onMonthReset={vi.fn()}
      />,
    );

    expect(screen.getByText('Finance insights')).toBeInTheDocument();
    expect(screen.getByText(/the month ended positive/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$3,200\.00/)).toBeInTheDocument();
  });
});
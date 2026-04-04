import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FinancePageRail } from '@/components/finance/scaffold/FinancePageRail';

const financeText = {
  tabsOverview: 'Visão Geral',
  tabsEntries: 'Lançamentos',
  tabsAccounts: 'Contas',
  tabsPaymentMethods: 'Métodos de Pagamento',
  activityGroupLabel: 'Atividade',
  setupGroupLabel: 'Configuração',
  prev: 'Mês anterior',
  next: 'Próximo mês',
};

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      finance: financeText,
    },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('FinancePageRail', () => {
  it('renders grouped activity and setup tabs', () => {
    render(
      <FinancePageRail
        activeTab="overview"
        monthLabel="abril de 2026"
        isCurrentMonth={true}
        showMonthControls
        onTabChange={vi.fn()}
        onMonthPrev={vi.fn()}
        onMonthNext={vi.fn()}
        onMonthReset={vi.fn()}
        todayLabel="Hoje"
      />,
    );

    expect(screen.getByText('Atividade')).toBeInTheDocument();
    expect(screen.getByText('Configuração')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visão Geral' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows month controls only when the current mode needs them', async () => {
    const user = userEvent.setup();
    const onMonthReset = vi.fn();

    const { rerender } = render(
      <FinancePageRail
        activeTab="entries"
        monthLabel="abril de 2026"
        isCurrentMonth={false}
        showMonthControls
        onTabChange={vi.fn()}
        onMonthPrev={vi.fn()}
        onMonthNext={vi.fn()}
        onMonthReset={onMonthReset}
        todayLabel="Hoje"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Hoje' }));
    expect(onMonthReset).toHaveBeenCalledTimes(1);

    rerender(
      <FinancePageRail
        activeTab="accounts"
        monthLabel="abril de 2026"
        isCurrentMonth={false}
        showMonthControls={false}
        onTabChange={vi.fn()}
        onMonthPrev={vi.fn()}
        onMonthNext={vi.fn()}
        onMonthReset={vi.fn()}
        todayLabel="Hoje"
      />,
    );

    expect(screen.queryByRole('button', { name: 'Hoje' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mês anterior' })).not.toBeInTheDocument();
  });
});
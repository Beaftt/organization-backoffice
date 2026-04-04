import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceInsightsBreakdownPanel } from '@/components/finance/insights/FinanceInsightsBreakdownPanel';

const mockLanguage = { current: 'pt' as 'pt' | 'en' };

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {},
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceInsightsBreakdownPanel', () => {
  it('renders the empty state when there are no breakdown items', () => {
    mockLanguage.current = 'pt';

    render(
      <FinanceInsightsBreakdownPanel
        eyebrow="Where money went"
        title="Para onde o dinheiro foi"
        description="Leia primeiro o peso das categorias do mês."
        emptyLabel="Nenhuma despesa categorizada neste período."
        items={[]}
        onOpenEvidence={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Nenhuma despesa categorizada neste período.'),
    ).toBeInTheDocument();
  });

  it('opens evidence for the selected breakdown item when requested', async () => {
    mockLanguage.current = 'pt';
    const user = userEvent.setup();
    const onOpenEvidence = vi.fn();

    render(
      <FinanceInsightsBreakdownPanel
        eyebrow="How money moved"
        title="Como o dinheiro se moveu"
        description="Leia a mistura de canais do período."
        emptyLabel="Sem movimentos."
        items={[{ id: 'pix', label: 'Pix', amount: 240, count: 3 }]}
        onOpenEvidence={onOpenEvidence}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Ver itens' }));

    expect(onOpenEvidence).toHaveBeenCalledWith({
      id: 'pix',
      label: 'Pix',
      amount: 240,
      count: 3,
    });
  });

  it('formats amounts with the active language locale', () => {
    mockLanguage.current = 'en';

    render(
      <FinanceInsightsBreakdownPanel
        eyebrow="How money moved"
        title="How money moved"
        description="Read the category weight for the month first."
        emptyLabel="No movements."
        items={[{ id: 'pix', label: 'Pix', amount: 240, count: 3 }]}
        onOpenEvidence={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'View entries' })).toBeInTheDocument();
    expect(screen.getByText('R$240.00')).toBeInTheDocument();
  });
});
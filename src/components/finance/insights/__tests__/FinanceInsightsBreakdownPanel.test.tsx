import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceInsightsBreakdownPanel } from '@/components/finance/insights/FinanceInsightsBreakdownPanel';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {},
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceInsightsBreakdownPanel', () => {
  it('renders the empty state when there are no breakdown items', () => {
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
});
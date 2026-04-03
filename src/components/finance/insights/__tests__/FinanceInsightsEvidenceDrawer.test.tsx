import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceInsightsEvidenceDrawer } from '@/components/finance/insights/FinanceInsightsEvidenceDrawer';
import type { FinanceTransaction } from '@/lib/api/finance';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: { finance: { close: 'Fechar' } },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const transactions = [
  {
    id: 'tx-1',
    title: 'Mercado central',
    occurredAt: '2026-04-10T00:00:00.000Z',
    amount: 180,
    currency: 'BRL',
  } as FinanceTransaction,
];

describe('FinanceInsightsEvidenceDrawer', () => {
  it('renders the empty evidence state when there are no transactions', () => {
    render(
      <FinanceInsightsEvidenceDrawer
        deskHref="/finance/desk?month=2026-04"
        description="Recorte vazio"
        open
        title="Evidências"
        transactions={[]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Evidências' })).toBeInTheDocument();
    expect(screen.getByText('Nenhum item para este recorte.')).toBeInTheDocument();
  });

  it('shows transactions and closes when the secondary action is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <FinanceInsightsEvidenceDrawer
        deskHref="/finance/desk?month=2026-04"
        description="Recorte com evidências"
        open
        title="Evidências do mês"
        transactions={transactions}
        onClose={onClose}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'Fechar' })[0]);

    expect(screen.getByText('Mercado central')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir no painel' })).toHaveAttribute(
      'href',
      '/finance/desk?month=2026-04',
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
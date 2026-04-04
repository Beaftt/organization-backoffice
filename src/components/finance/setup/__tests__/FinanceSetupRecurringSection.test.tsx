import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceSetupRecurringSection } from '@/components/finance/setup/FinanceSetupRecurringSection';
import {
  financeText,
  sampleAccount,
  sampleCategory,
  sampleRecurring,
} from '@/components/finance/setup/__tests__/finance-test-data';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: { finance: financeText, modules: { finance: 'Financeiro' } },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceSetupRecurringSection', () => {
  it('renders recurring rules with their actions', () => {
    render(
      <FinanceSetupRecurringSection
        accounts={[sampleAccount]}
        categories={[sampleCategory]}
        recurring={[sampleRecurring]}
        recurringStatus={() => 'active'}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Cobranças programadas' })).toBeInTheDocument();
    expect(screen.getByText('Aluguel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('shows the empty state when there are no rules', () => {
    render(
      <FinanceSetupRecurringSection
        accounts={[]}
        categories={[]}
        recurring={[]}
        recurringStatus={() => 'paused'}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    expect(screen.getByText('Nada por aqui')).toBeInTheDocument();
  });

  it('calls interaction handlers when actions are clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onEdit = vi.fn();
    const onToggleActive = vi.fn();

    render(
      <FinanceSetupRecurringSection
        accounts={[sampleAccount]}
        categories={[sampleCategory]}
        recurring={[sampleRecurring]}
        recurringStatus={() => 'needs-review'}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onEdit={onEdit}
        onToggleActive={onToggleActive}
      />,
    );

    await user.click(screen.getByRole('button', { name: /nova cobrança programada/i }));
    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByRole('button', { name: 'Pausar' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(sampleRecurring);
    expect(onToggleActive).toHaveBeenCalledWith(sampleRecurring);
    expect(screen.getByText('needs review')).toBeInTheDocument();
  });
});
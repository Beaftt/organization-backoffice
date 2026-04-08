import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceSetupRecurringSection } from '@/components/finance/setup/FinanceSetupRecurringSection';
import {
  financeText,
  sampleAccount,
  sampleCategory,
  samplePaymentMethod,
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
        paymentMethods={[samplePaymentMethod]}
        categories={[sampleCategory]}
        recurring={[sampleRecurring]}
        recurringStatus={() => 'active'}
        selectedYear={2026}
        selectedMonth={2}
        isSaving={false}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggleActive={vi.fn()}
        onTogglePayment={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Cobranças programadas' })).toBeInTheDocument();
    expect(screen.getByText('Aluguel')).toBeInTheDocument();
    expect(screen.getByText('Assinatura')).toBeInTheDocument();
    expect(screen.getByText('Cartão azul')).toBeInTheDocument();
    expect(screen.getByText('Total do mês')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('shows the empty state when there are no rules', () => {
    render(
      <FinanceSetupRecurringSection
        accounts={[]}
        paymentMethods={[]}
        categories={[]}
        recurring={[]}
        recurringStatus={() => 'paused'}
        selectedYear={2026}
        selectedMonth={2}
        isSaving={false}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggleActive={vi.fn()}
        onTogglePayment={vi.fn()}
      />,
    );

    expect(screen.getByText('Nada por aqui')).toBeInTheDocument();
  });

  it('calls interaction handlers when actions are clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onEdit = vi.fn();
    const onToggleActive = vi.fn();
    const onTogglePayment = vi.fn();

    render(
      <FinanceSetupRecurringSection
        accounts={[sampleAccount]}
        paymentMethods={[samplePaymentMethod]}
        categories={[sampleCategory]}
        recurring={[sampleRecurring]}
        recurringStatus={() => 'needs-review'}
        selectedYear={2026}
        selectedMonth={2}
        isSaving={false}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onEdit={onEdit}
        onToggleActive={onToggleActive}
        onTogglePayment={onTogglePayment}
      />,
    );

    await user.click(screen.getByRole('button', { name: /nova cobrança programada/i }));
    await user.click(screen.getByRole('button', { name: 'Marcar Aluguel como paga' }));
    expect(screen.getByText('Como deseja registrar esta cobrança?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Registrar como pago' }));
    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByRole('button', { name: 'Pausar' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onTogglePayment).toHaveBeenCalledWith(sampleRecurring, true, 'PAID');
    expect(onEdit).toHaveBeenCalledWith(sampleRecurring);
    expect(onToggleActive).toHaveBeenCalledWith(sampleRecurring);
    expect(screen.getByText('needs review')).toBeInTheDocument();
  });

  it('keeps the legacy one-click behavior for non-credit recurring items', async () => {
    const user = userEvent.setup();
    const onTogglePayment = vi.fn();

    render(
      <FinanceSetupRecurringSection
        accounts={[sampleAccount]}
        paymentMethods={[{ ...samplePaymentMethod, type: 'PIX' }]}
        categories={[sampleCategory]}
        recurring={[{ ...sampleRecurring, paymentMethodId: 'pm-1' }]}
        recurringStatus={() => 'active'}
        selectedYear={2026}
        selectedMonth={2}
        isSaving={false}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggleActive={vi.fn()}
        onTogglePayment={onTogglePayment}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Marcar Aluguel como paga' }));

    expect(onTogglePayment).toHaveBeenCalledWith(
      expect.objectContaining({ id: sampleRecurring.id }),
      true,
    );
  });
});
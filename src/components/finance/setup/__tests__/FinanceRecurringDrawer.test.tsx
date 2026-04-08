import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceRecurringDrawer } from '@/components/finance/setup/FinanceRecurringDrawer';
import {
  financeText,
  sampleAccount,
  sampleCategory,
  samplePaymentMethod,
  sampleRecurring,
  sampleTag,
} from '@/components/finance/setup/__tests__/finance-test-data';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: { finance: financeText, modules: { finance: 'Financeiro' } },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceRecurringDrawer', () => {
  it('renders the recurring form when open', () => {
    render(
      <FinanceRecurringDrawer
        open
        editing={null}
        form={{ title: '', amount: '', group: 'EXPENSE', occurrences: '', endMode: 'ongoing', frequency: 'MONTHLY', interval: '1', nextDue: '2026-03-10', endDate: '', accountId: '', paymentMethodId: '', isSubscription: false, categoryId: '', tagIds: [], active: true }}
        accounts={[sampleAccount]}
        paymentMethods={[samplePaymentMethod]}
        categories={[sampleCategory]}
        tags={[sampleTag]}
        formError={null}
        isSaving={false}
        onClose={vi.fn()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onSave={vi.fn()}
        onToggleTag={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Nova cobrança programada' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
  });

  it('renders delete action when editing', () => {
    render(
      <FinanceRecurringDrawer
        open
        editing={sampleRecurring}
        form={{ title: sampleRecurring.title, amount: '1800', group: 'EXPENSE', occurrences: '', endMode: 'ongoing', frequency: 'MONTHLY', interval: '1', nextDue: '2026-03-10', endDate: '', accountId: sampleAccount.id, paymentMethodId: samplePaymentMethod.id, isSubscription: true, categoryId: sampleCategory.id, tagIds: [sampleTag.id], active: true }}
        accounts={[sampleAccount]}
        paymentMethods={[samplePaymentMethod]}
        categories={[sampleCategory]}
        tags={[sampleTag]}
        formError={null}
        isSaving={false}
        onClose={vi.fn()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onSave={vi.fn()}
        onToggleTag={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('forwards input and tag interactions', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onToggleTag = vi.fn();

    render(
      <FinanceRecurringDrawer
        open
        editing={null}
        form={{ title: '', amount: '', group: 'EXPENSE', occurrences: '', endMode: 'ongoing', frequency: 'MONTHLY', interval: '1', nextDue: '2026-03-10', endDate: '', accountId: '', paymentMethodId: '', isSubscription: false, categoryId: '', tagIds: [], active: true }}
        accounts={[sampleAccount]}
        paymentMethods={[samplePaymentMethod]}
        categories={[sampleCategory]}
        tags={[sampleTag]}
        formError="Valor obrigatório"
        isSaving={false}
        onClose={vi.fn()}
        onChange={onChange}
        onDelete={vi.fn()}
        onSave={vi.fn()}
        onToggleTag={onToggleTag}
      />,
    );
          await user.click(screen.getByLabelText('É uma assinatura?'));
          await user.selectOptions(screen.getByLabelText('Método de pagamento'), samplePaymentMethod.id);

    await user.type(screen.getByLabelText('Título'), 'Assinatura');
    await user.click(screen.getByRole('button', { name: 'Casa' }));
          expect(onChange).toHaveBeenCalledWith({ isSubscription: true });
          expect(onChange).toHaveBeenCalledWith({
            paymentMethodId: samplePaymentMethod.id,
            accountId: sampleAccount.id,
          });

    expect(onChange).toHaveBeenCalled();
    expect(onToggleTag).toHaveBeenCalledWith(sampleTag.id);
    expect(screen.getByText('Valor obrigatório')).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceSetupSurface } from '@/components/finance/setup/FinanceSetupSurface';
import { financeText, sampleAccount, sampleCardBill, sampleCategory, sampleIncomeCategory, sampleInvestment, samplePaymentMethod, sampleRecurring, sampleTag } from '@/components/finance/setup/__tests__/finance-test-data';
import type { useFinanceSetupState } from '@/components/finance/setup/useFinanceSetupState';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: { finance: financeText, modules: { finance: 'Financeiro' } },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

function createSetupState(overrides: Partial<ReturnType<typeof useFinanceSetupState>> = {}) {
  return {
    accounts: [sampleAccount],
    accountDrawerOpen: false,
    accountForm: { name: '', type: 'BANK', currency: 'BRL', isPrimary: false },
    accountFormError: null,
    cardBills: { [samplePaymentMethod.id]: sampleCardBill },
    categories: [sampleCategory, sampleIncomeCategory],
    closeAccountDrawer: vi.fn(),
    closeInvestmentAction: vi.fn(),
    closePaymentMethodDrawer: vi.fn(),
    closeRecurringDrawer: vi.fn(),
    closeTaxonomyOverlay: vi.fn(),
    continueInvestmentAction: vi.fn(),
    creditMethods: [samplePaymentMethod],
    editingAccount: null,
    editingPaymentMethod: null,
    editingRecurring: null,
    error: null,
    expenseCategories: [sampleCategory],
    immediateMethods: [],
    incomeCategories: [sampleIncomeCategory],
    investMethods: [sampleInvestment],
    investmentAction: { mode: null, step: 1, targetInvestmentId: '', fromInvestmentId: '', toInvestmentId: '', accountId: '', amount: '', occurredAt: '2026-03-10', error: null },
    isLoading: false,
    isSaving: false,
    openAccountDrawer: vi.fn(),
    openCategoryOverlay: vi.fn(),
    openInvestmentAction: vi.fn(),
    openPaymentMethodDrawer: vi.fn(),
    openRecurringDrawer: vi.fn(),
    openTagOverlay: vi.fn(),
    paymentMethods: [samplePaymentMethod, sampleInvestment],
    paymentMethodDrawerOpen: false,
    paymentMethodForm: { name: '', type: 'DEBIT', accountId: '', currency: 'BRL', limit: '', closingDay: '', dueDay: '', balance: '', isPrimary: false },
    paymentMethodFormError: null,
    recurring: [sampleRecurring],
    recurringDrawerOpen: false,
    recurringForm: { title: '', amount: '', group: 'EXPENSE', occurrences: '', endMode: 'ongoing', frequency: 'MONTHLY', interval: '1', nextDue: '2026-03-10', endDate: '', accountId: '', paymentMethodId: '', isSubscription: false, categoryId: '', tagIds: [], active: true },
    recurringFormError: null,
    recurringStatus: vi.fn(() => 'active'),
    removeAccount: vi.fn(),
    removeCategory: vi.fn(),
    removePaymentMethod: vi.fn(),
    removeRecurring: vi.fn(),
    removeTag: vi.fn(),
    saveAccount: vi.fn(),
    savePaymentMethod: vi.fn(),
    saveRecurring: vi.fn(),
    saveTaxonomyOverlay: vi.fn(),
    setAccountForm: vi.fn(),
    setInvestmentAction: vi.fn(),
    setPaymentMethodForm: vi.fn(),
    setRecurringForm: vi.fn(),
    setTaxonomyOverlay: vi.fn(),
    submitInvestmentAction: vi.fn(),
    tags: [sampleTag],
    taxonomyOverlay: { kind: null, editingCategory: null, editingTag: null, name: '', group: 'EXPENSE', error: null },
    toggleRecurringActive: vi.fn(),
    toggleRecurringPaid: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useFinanceSetupState>;
}

describe('FinanceSetupSurface', () => {
  it('renders the setup sections with loaded data', () => {
    render(<FinanceSetupSurface monthLabel="março de 2026" monthState={{ year: 2026, month: 2 }} setup={createSetupState()} />);

    expect(screen.getByRole('heading', { name: 'Ajustes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contas, meios de pagamento e investimentos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cobranças programadas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Categorias e tags' })).toBeInTheDocument();
  });

  it('shows loading placeholders when setup is loading', () => {
    render(<FinanceSetupSurface monthLabel="março de 2026" monthState={{ year: 2026, month: 2 }} setup={createSetupState({ isLoading: true })} />);

    expect(screen.queryByRole('heading', { name: 'Ajustes' })).not.toBeInTheDocument();
  });

  it('shows empty states when setup collections are empty', () => {
    render(
      <FinanceSetupSurface
        monthLabel="março de 2026"
        monthState={{ year: 2026, month: 2 }}
        setup={createSetupState({ accounts: [], categories: [], creditMethods: [], expenseCategories: [], immediateMethods: [], incomeCategories: [], investMethods: [], paymentMethods: [], recurring: [], tags: [] })}
      />,
    );

    expect(screen.getAllByText('Nada por aqui').length).toBeGreaterThan(1);
  });

  it('calls the add account action when the account CTA is clicked', async () => {
    const user = userEvent.setup();
    const openAccountDrawer = vi.fn();

    render(
      <FinanceSetupSurface
        monthLabel="março de 2026"
        monthState={{ year: 2026, month: 2 }}
        setup={createSetupState({ accounts: [], openAccountDrawer })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Nova conta' }));

    expect(openAccountDrawer).toHaveBeenCalledTimes(1);
  });
});
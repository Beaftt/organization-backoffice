import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FinanceClient from '@/app/(app)/finance/FinanceClient';
import * as financeApi from '@/lib/api/finance';
import * as userProfileApi from '@/lib/api/user-profile';
import * as membershipsApi from '@/lib/api/workspace-memberships';

const replace = vi.fn();

const financeText = {
  prev: 'Mês anterior',
  next: 'Próximo mês',
  tabsOverview: 'Visão Geral',
  tabsEntries: 'Lançamentos',
  tabsAccounts: 'Contas',
  tabsPaymentMethods: 'Métodos de Pagamento',
  activityGroupLabel: 'Atividade',
  setupGroupLabel: 'Configuração',
  recurringTitle: 'Recorrências',
  addTagAction: 'Nova tag',
  newType: 'Novo tipo',
  manageRecords: 'Gerenciar base',
  newAccount: 'Nova conta',
  accountLabel: 'Conta',
  paymentMethodAdd: 'Adicionar',
  loadError: 'Erro ao carregar',
  summaryIncome: 'Receitas',
  summaryExpense: 'Despesas',
  summaryNet: 'Saldo',
  investmentsTitle: 'Investimentos',
  statsMonthBadge: 'No mês',
  statsExpensesRate: '{rate}% da receita',
  statsPortfolios: '{n} carteiras ativas',
};

vi.mock('next/navigation', () => ({
  usePathname: () => '/finance',
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams('month=2026-04'),
}));

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      finance: financeText,
      modules: {
        finance: 'Financeiro',
      },
    },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@/lib/storage/workspace', () => ({
  getWorkspaceId: () => 'ws-1',
}));

vi.mock('@/components/finance/FinanceStatsRow', () => ({
  FinanceStatsRow: () => <div data-testid="finance-stats-row">stats</div>,
}));

vi.mock('@/components/finance/RecurringBillsChecklist', () => ({
  RecurringBillsChecklist: () => <div data-testid="recurring-checklist">recurring</div>,
}));

vi.mock('@/components/finance/FinanceCategoriesPanel', () => ({
  FinanceCategoriesPanel: () => <div data-testid="categories-panel">categories</div>,
}));

vi.mock('@/components/finance/entries/FinanceTransactionsWorkspace', () => ({
  FinanceTransactionsWorkspace: () => (
    <div data-testid="finance-transactions-workspace">transactions</div>
  ),
}));

vi.mock('@/components/finance/accounts/AccountsList', () => ({
  AccountsList: () => <div data-testid="accounts-list">accounts</div>,
}));

vi.mock('@/components/finance/payment-methods/CardsSection', () => ({
  CardsSection: () => <div data-testid="cards-section">cards</div>,
}));

vi.mock('@/components/finance/payment-methods/InvestmentsSection', () => ({
  InvestmentsSection: () => <div data-testid="investments-section">investments</div>,
}));

vi.mock('@/components/finance/drawers/AccountDrawer', () => ({
  AccountDrawer: () => null,
}));

vi.mock('@/components/finance/drawers/PaymentMethodDrawer', () => ({
  PaymentMethodDrawer: () => null,
}));

vi.mock('@/components/finance/drawers/TypeDrawer', () => ({
  TypeDrawer: () => null,
}));

vi.mock('@/components/finance/drawers/TagDrawer', () => ({
  TagDrawer: () => null,
}));

vi.mock('@/components/finance/drawers/ManageRecordsModal', () => ({
  ManageRecordsModal: () => null,
}));

vi.mock('@/lib/api/finance', async (importOriginal) => {
  const original = await importOriginal<typeof financeApi>();
  return {
    ...original,
    listFinanceTags: vi.fn(),
    listFinanceCategories: vi.fn(),
    listFinanceAccounts: vi.fn(),
    listFinancePaymentMethods: vi.fn(),
    listFinanceRecurring: vi.fn(),
    listFinanceTransactions: vi.fn(),
    getFinanceCardBill: vi.fn(),
  };
});

vi.mock('@/lib/api/user-profile', async (importOriginal) => {
  const original = await importOriginal<typeof userProfileApi>();
  return {
    ...original,
    getMyProfile: vi.fn(),
  };
});

vi.mock('@/lib/api/workspace-memberships', async (importOriginal) => {
  const original = await importOriginal<typeof membershipsApi>();
  return {
    ...original,
    getWorkspaceMemberships: vi.fn(),
  };
});

describe('FinanceClient scaffold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeApi.listFinanceTags).mockResolvedValue([]);
    vi.mocked(financeApi.listFinanceCategories).mockResolvedValue([
      {
        id: 'cat-1',
        workspaceId: 'ws-1',
        name: 'Mercado',
        group: 'EXPENSE',
        createdAt: '',
        updatedAt: '',
      },
    ]);
    vi.mocked(financeApi.listFinanceAccounts).mockResolvedValue([
      {
        id: 'acc-1',
        workspaceId: 'ws-1',
        name: 'Conta principal',
        type: 'BANK',
        currency: 'BRL',
        isPrimary: true,
        createdAt: '',
        updatedAt: '',
      },
    ]);
    vi.mocked(financeApi.listFinancePaymentMethods).mockResolvedValue([]);
    vi.mocked(financeApi.listFinanceRecurring).mockResolvedValue([]);
    vi.mocked(financeApi.listFinanceTransactions).mockResolvedValue([]);
    vi.mocked(financeApi.getFinanceCardBill).mockResolvedValue({
      paymentMethodId: 'card-1',
      closingDate: '2026-04-12',
      dueDate: '2026-04-20',
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      transactions: [],
    });
    vi.mocked(userProfileApi.getMyProfile).mockResolvedValue({
      userId: 'user-1',
      firstName: 'Lucas',
      lastName: 'Faria',
      photoUrl: null,
    } as Awaited<ReturnType<typeof userProfileApi.getMyProfile>>);
    vi.mocked(membershipsApi.getWorkspaceMemberships).mockResolvedValue({
      items: [],
      meta: {
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    });
  });

  it('renders the overview scaffold without a duplicated local finance title', async () => {
    render(<FinanceClient />);

    await waitFor(() => expect(financeApi.listFinanceTags).toHaveBeenCalled());

    expect(screen.queryByRole('heading', { name: 'Financeiro' })).not.toBeInTheDocument();
    expect(screen.getByTestId('finance-stats-row')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visão Geral' })).toBeInTheDocument();
  });

  it('switches scaffold behavior by tab mode', async () => {
    const user = userEvent.setup();

    render(<FinanceClient />);

    await waitFor(() => expect(financeApi.listFinanceTransactions).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Lançamentos' }));
    expect(screen.getByTestId('finance-transactions-workspace')).toBeInTheDocument();
    expect(screen.queryByTestId('finance-stats-row')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Contas' }));
    expect(screen.getByRole('heading', { name: 'Contas' })).toBeInTheDocument();
    expect(screen.getByTestId('accounts-list')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mês anterior' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('finance-stats-row')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Métodos de Pagamento' }));
    expect(screen.getByRole('heading', { name: 'Métodos de Pagamento' })).toBeInTheDocument();
    expect(screen.getByTestId('cards-section')).toBeInTheDocument();
    expect(screen.getByTestId('investments-section')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mês anterior' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('finance-stats-row')).not.toBeInTheDocument();
  });
});
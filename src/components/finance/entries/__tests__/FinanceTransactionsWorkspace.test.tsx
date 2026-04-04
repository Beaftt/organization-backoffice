import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FinanceTransactionsWorkspace } from '../FinanceTransactionsWorkspace';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceRecurring,
  FinanceTag,
  FinanceTransaction,
} from '@/lib/api/finance';
import * as calendarApi from '@/lib/api/calendar';
import * as financeApi from '@/lib/api/finance';

const financeText = {
  searchLabel: 'Buscar',
  searchPlaceholder: 'Pesquisar lançamento',
  groupLabel: 'Grupo',
  groupAll: 'Todos',
  groupIncome: 'Receita',
  groupExpense: 'Despesa',
  typeLabel: 'Categoria',
  typeAll: 'Todas',
  statusLabel: 'Status',
  statusAll: 'Todos',
  statusPaid: 'Pago',
  statusPending: 'Pendente',
  sortLabel: 'Ordenar',
  sortDate: 'Data',
  sortAmount: 'Valor',
  newTransaction: 'Nova transação',
  tabsEntries: 'Lançamentos',
  transactionWorkspaceTitle: 'Workspace de transações',
  transactionWorkspaceDescription: 'Fluxo contínuo de edição.',
  transactionWorkspaceEmpty: 'Selecione uma transação da lista ou inicie um novo lançamento para editar sem sair do contexto.',
  transactionWorkspaceHelper: 'Editor contextual.',
  empty: 'Nenhuma transação encontrada',
  entriesNoResults: 'Nenhuma transação encontrada com esses filtros.',
  entriesSummary: '{n} lançamentos',
  loadMore: 'Carregar mais',
  entriesEnd: 'Fim da lista',
  editAction: 'Editar transação',
  deleteAction: 'Excluir',
  deleteConfirmation: 'Excluir?',
  titleLabel: 'Título',
  amountLabel: 'Valor',
  accountLabel: 'Conta',
  creditTitle: 'Crédito',
  installmentsLabel: 'Parcelas',
  installmentsIsPerValueLabel: 'Valor informado por parcela',
  dateLabel: 'Data',
  recurringLabel: 'Recorrência',
  recurrenceFrequencyLabel: 'Frequência',
  cadenceDaily: 'Diária',
  cadenceWeekly: 'Semanal',
  cadenceMonthly: 'Mensal',
  cadenceSemiannual: 'Semestral',
  cadenceYearly: 'Anual',
  recurrenceIntervalLabel: 'Intervalo',
  recurrenceEndDateLabel: 'Até',
  addToCalendarLabel: 'Adicionar ao calendário',
  descriptionLabel: 'Descrição',
  tagsLabel: 'Tags',
  addTagAction: 'Adicionar tag',
  tagsPlaceholder: 'Nova tag',
  tagsEmpty: 'Sem tags',
  details: 'Contexto e anotações',
  transactionSectionEssential: 'Base',
  transactionRouteTitle: 'Rota financeira',
  transactionSectionDetails: 'Calendário e classificação',
  cancel: 'Cancelar',
  save: 'Salvar',
  saving: 'Salvando...',
  close: 'Fechar',
  reviewLabel: 'Resumo',
  amountRequired: 'Informe um valor válido',
  titleRequired: 'Informe um título',
  dateRequired: 'Informe uma data',
  accountRequired: 'Selecione uma conta',
  saveError: 'Erro ao salvar',
  deleteError: 'Erro ao excluir',
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

vi.mock('@/lib/api/calendar', async (importOriginal) => {
  const original = await importOriginal<typeof calendarApi>();
  return {
    ...original,
    createCalendarEvent: vi.fn(),
  };
});

vi.mock('@/lib/api/finance', async (importOriginal) => {
  const original = await importOriginal<typeof financeApi>();
  return {
    ...original,
    createFinanceTransaction: vi.fn(),
    listFinanceRecurring: vi.fn().mockResolvedValue([]),
    createFinanceRecurring: vi.fn(),
    updateFinanceRecurring: vi.fn(),
    updateFinanceTransaction: vi.fn(),
    deleteFinanceTransaction: vi.fn(),
    deleteFinanceRecurring: vi.fn(),
    createFinanceTag: vi.fn(),
  };
});

const accounts: FinanceAccount[] = [
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
];

const categories: FinanceCategory[] = [
  {
    id: 'cat-1',
    workspaceId: 'ws-1',
    name: 'Mercado',
    group: 'EXPENSE',
    createdAt: '',
    updatedAt: '',
  },
];

const paymentMethods: FinancePaymentMethod[] = [];
const tags: FinanceTag[] = [];
const recurring: FinanceRecurring[] = [];

const transactions: FinanceTransaction[] = [
  {
    id: 'tx-1',
    workspaceId: 'ws-1',
    title: 'Compra semanal',
    amount: 120,
    currency: 'BRL',
    group: 'EXPENSE',
    status: 'PAID',
    occurredAt: '2026-04-03',
    description: null,
    accountId: 'acc-1',
    categoryId: 'cat-1',
    tagIds: [],
    participantIds: [],
    recurringId: null,
    createdAt: '',
    updatedAt: '',
    settledAt: null,
    paymentMethodId: null,
    installmentIndex: null,
    installmentTotal: null,
  },
];

function renderWorkspace(overrides?: Partial<React.ComponentProps<typeof FinanceTransactionsWorkspace>>) {
  return render(
    <FinanceTransactionsWorkspace
      query=""
      groupFilter="all"
      typeFilter="all"
      statusFilter="all"
      sortBy="date"
      categories={categories}
      accounts={accounts}
      paymentMethods={paymentMethods}
      tags={tags}
      recurring={recurring}
      members={[]}
      currentUserId="user-1"
      totalTransactions={transactions.length}
      visibleTransactions={transactions}
      totalIncome={0}
      totalExpense={120}
      isLoading={false}
      hasMore={false}
      onQuery={vi.fn()}
      onGroup={vi.fn()}
      onType={vi.fn()}
      onStatus={vi.fn()}
      onSort={vi.fn()}
      onLoadMore={vi.fn()}
      reloadTransactions={vi.fn().mockResolvedValue(undefined)}
      onTagsUpdated={vi.fn()}
      onRecurringUpdated={vi.fn()}
      {...overrides}
    />,
  );
}

describe('FinanceTransactionsWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeApi.createFinanceTransaction).mockResolvedValue(transactions[0]);
    vi.mocked(financeApi.listFinanceRecurring).mockResolvedValue([]);
  });

  it('renders the workspace with the current ledger state', () => {
    renderWorkspace();

    expect(screen.getAllByText('Workspace de transações').length).toBeGreaterThan(0);
    expect(screen.getByText('Compra semanal')).toBeInTheDocument();
  });

  it('shows the empty state when there are no visible transactions', () => {
    renderWorkspace({ totalTransactions: 0, visibleTransactions: [] });

    expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
  });

  it('shows loading skeletons while the ledger is loading', () => {
    const { container } = renderWorkspace({ isLoading: true, totalTransactions: 0, visibleTransactions: [] });

    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('creates a new immediate transaction from the workspace editor', async () => {
    const user = userEvent.setup();
    const reloadTransactions = vi.fn().mockResolvedValue(undefined);
    const onRecurringUpdated = vi.fn();

    renderWorkspace({
      totalTransactions: 0,
      visibleTransactions: [],
      totalExpense: 0,
      reloadTransactions,
      onRecurringUpdated,
    });

    await user.click(screen.getAllByRole('button', { name: 'Nova transação' })[0]);
    await user.type(screen.getByLabelText('Título'), 'Almoço executivo');
    await user.type(screen.getByLabelText('Valor'), '12345');
    await user.click(screen.getByRole('button', { name: 'Conta principal' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(financeApi.createFinanceTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Almoço executivo',
          amount: 123.45,
          accountId: 'acc-1',
          paymentMethodId: null,
          group: 'EXPENSE',
        }),
      ),
    );
    expect(reloadTransactions).toHaveBeenCalledTimes(1);
    expect(onRecurringUpdated).toHaveBeenCalledWith([]);
  });
});
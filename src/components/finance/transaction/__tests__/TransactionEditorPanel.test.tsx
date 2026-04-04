import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionEditorPanel } from '../TransactionEditorPanel';
import { createTransactionEditorForm } from '../transaction-editor-model';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTag,
} from '@/lib/api/finance';

const financeText = {
  newTransaction: 'Nova transação',
  editAction: 'Editar transação',
  close: 'Fechar',
  cancel: 'Cancelar',
  save: 'Salvar',
  saving: 'Salvando...',
  tabsEntries: 'Lançamentos',
  transactionWorkspaceTitle: 'Editor fixo de transações',
  transactionWorkspaceEmpty: 'Selecione uma transação da lista ou inicie um novo lançamento para editar sem sair do contexto.',
  transactionWorkspaceHelper: 'Editor contextual.',
  transactionSectionEssential: 'Base',
  transactionRouteTitle: 'Rota financeira',
  transactionSectionDetails: 'Calendário e classificação',
  details: 'Contexto e anotações',
  groupExpense: 'Despesa',
  groupIncome: 'Receita',
  titleLabel: 'Título',
  amountLabel: 'Valor',
  accountLabel: 'Conta',
  creditTitle: 'Crédito',
  installmentsLabel: 'Parcelas',
  installmentsIsPerValueLabel: 'Valor informado por parcela',
  dateLabel: 'Data',
  statusLabel: 'Status',
  statusPaid: 'Pago',
  statusPending: 'Pendente',
  typeLabel: 'Categoria',
  typeAll: 'Todas',
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
  participantsLabel: 'Participantes',
  reviewLabel: 'Resumo',
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

const paymentMethods: FinancePaymentMethod[] = [
  {
    id: 'card-1',
    workspaceId: 'ws-1',
    accountId: 'acc-1',
    name: 'Cartão Azul',
    type: 'CREDIT',
    currency: 'BRL',
    limit: 5000,
    closingDay: 12,
    dueDay: 20,
    balance: null,
    isPrimary: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'pix-1',
    workspaceId: 'ws-1',
    accountId: 'acc-1',
    name: 'Pix principal',
    type: 'PIX',
    currency: 'BRL',
    limit: null,
    closingDay: null,
    dueDay: null,
    balance: null,
    isPrimary: false,
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

const tags: FinanceTag[] = [];

function renderPanel(overrides?: Partial<React.ComponentProps<typeof TransactionEditorPanel>>) {
  return render(
    <TransactionEditorPanel
      open
      editing={null}
      form={createTransactionEditorForm('user-1')}
      error={null}
      isSaving={false}
      accounts={accounts}
      paymentMethods={paymentMethods}
      categories={categories}
      tags={tags}
      members={[]}
      tagDraft=""
      expandedSections={['core', 'route', 'schedule', 'details']}
      onStart={vi.fn()}
      onClose={vi.fn()}
      onToggleSection={vi.fn()}
      onGroupChange={vi.fn()}
      onRouteChange={vi.fn()}
      onAccountChange={vi.fn()}
      onImmediateBehaviorChange={vi.fn()}
      onCreditMethodChange={vi.fn()}
      onFieldChange={vi.fn()}
      onToggleTag={vi.fn()}
      onTagDraftChange={vi.fn()}
      onTagAdd={vi.fn()}
      onTagSuggest={vi.fn()}
      onToggleParticipant={vi.fn()}
      onSave={vi.fn()}
      {...overrides}
    />,
  );
}

describe('TransactionEditorPanel', () => {
  it('renders empty state when editor is closed', () => {
    renderPanel({ open: false });

    expect(screen.getByText('Editor fixo de transações')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova transação' })).toBeInTheDocument();
  });

  it('calls route and account handlers when the user changes the route flow', async () => {
    const user = userEvent.setup();
    const onRouteChange = vi.fn();
    const onAccountChange = vi.fn();

    renderPanel({ onRouteChange, onAccountChange });

    await user.click(screen.getByRole('button', { name: 'Crédito' }));
    await user.click(screen.getByRole('button', { name: 'Conta principal' }));

    expect(onRouteChange).toHaveBeenCalledWith('CREDIT');
    expect(onAccountChange).toHaveBeenCalledWith('acc-1');
  });

  it('renders an accessible region and a disabled saving action when saving', () => {
    renderPanel({ isSaving: true });

    expect(screen.getAllByText('Nova transação').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
  });
});
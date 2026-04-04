import type {
  FinanceAccount,
  FinanceCardBill,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceRecurring,
  FinanceTag,
} from '@/lib/api/finance';

export const financeText = {
  accountLabel: 'Conta',
  accountRequired: 'Conta obrigatória',
  addTagAction: 'Nova tag',
  backAction: 'Voltar',
  amountLabel: 'Valor',
  amountRequired: 'Valor obrigatório',
  cancel: 'Cancelar',
  close: 'Fechar',
  continueAction: 'Continuar',
  dateLabel: 'Data',
  deleteAction: 'Excluir',
  deleteConfirmation: 'Confirmar exclusão',
  editAction: 'Editar',
  empty: 'Nada por aqui',
  pauseAction: 'Pausar',
  frequencyLabel: 'Frequência',
  groupExpense: 'Despesa',
  groupIncome: 'Receita',
  groupLabel: 'Grupo',
  investmentsTitle: 'Investimentos',
  newAccount: 'Nova conta',
  newType: 'Novo tipo',
  nextDueLabel: 'Próximo vencimento',
  none: 'Nenhum',
  recurringAdd: 'Nova cobrança programada',
  recurringTitle: 'Cobranças programadas',
  resumeAction: 'Retomar',
  paymentMethodAdd: 'Adicionar',
  paymentMethodCredit: 'Crédito',
  paymentMethodDebit: 'Débito',
  paymentMethodInvest: 'Investimento',
  paymentMethodNameLabel: 'Nome do método',
  paymentMethodNameRequired: 'Nome obrigatório',
  paymentMethodPix: 'Pix',
  paymentMethodTitle: 'Novo método',
  paymentMethodsTitle: 'Métodos',
  save: 'Salvar',
  saveError: 'Erro ao salvar',
  saving: 'Salvando',
  setPrimary: 'Principal',
  tagsLabel: 'Tags',
  titleLabel: 'Título',
  titleRequired: 'Título obrigatório',
  transferLabel: 'Transferir',
  typeLabel: 'Categoria',
  typesLabel: 'Categorias e tags',
};

export const sampleAccount: FinanceAccount = {
  id: 'acc-1',
  workspaceId: 'ws-1',
  name: 'Conta principal',
  type: 'BANK',
  currency: 'BRL',
  isPrimary: true,
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
};

export const sampleCategory: FinanceCategory = {
  id: 'cat-1',
  workspaceId: 'ws-1',
  name: 'Moradia',
  group: 'EXPENSE',
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
};

export const sampleIncomeCategory: FinanceCategory = {
  ...sampleCategory,
  id: 'cat-2',
  name: 'Salário',
  group: 'INCOME',
};

export const sampleTag: FinanceTag = {
  id: 'tag-1',
  workspaceId: 'ws-1',
  name: 'Casa',
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
};

export const samplePaymentMethod: FinancePaymentMethod = {
  id: 'pm-1',
  workspaceId: 'ws-1',
  name: 'Cartão azul',
  type: 'CREDIT',
  accountId: sampleAccount.id,
  currency: 'BRL',
  balance: 0,
  limit: 2500,
  closingDay: 8,
  dueDay: 15,
  isPrimary: true,
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
};

export const sampleInvestment: FinancePaymentMethod = {
  ...samplePaymentMethod,
  id: 'pm-2',
  name: 'Reserva CDI',
  type: 'INVEST',
  balance: 4200,
};

export const sampleRecurring: FinanceRecurring = {
  id: 'rec-1',
  workspaceId: 'ws-1',
  title: 'Aluguel',
  amount: 1800,
  group: 'EXPENSE',
  frequency: 'MONTHLY',
  interval: 1,
  nextDue: '2026-03-10',
  endDate: null,
  accountId: sampleAccount.id,
  categoryId: sampleCategory.id,
  tagIds: [sampleTag.id],
  active: true,
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
};

export const sampleCardBill: FinanceCardBill = {
  paymentMethodId: samplePaymentMethod.id,
  cycleReference: '2026-03',
  amount: 800,
  paidAmount: 100,
  remainingAmount: 700,
  dueDate: '2026-03-15',
  status: 'OPEN',
};
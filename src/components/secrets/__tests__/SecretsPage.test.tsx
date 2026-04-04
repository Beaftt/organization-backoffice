import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecretsPage } from '../SecretsPage';
import type { SecretSummary } from '../types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/lib/api/secrets', () => ({
  listSecrets: vi.fn(),
  getSecret: vi.fn(),
  createSecret: vi.fn(),
  updateSecret: vi.fn(),
  deleteSecret: vi.fn(),
}));

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      secrets: {
        title: 'Segredos',
        subtitle: 'Armazene segredos com segurança.',
        newSecret: 'Novo segredo',
        stored: 'armazenados',
        searchPlaceholder: 'Pesquisar…',
        tableTitle: 'Título',
        tableUser: 'Usuário/Chave',
        tableType: 'Tipo',
        tableUpdated: 'Atualizado',
        tableActions: 'Ações',
        view: 'Ver',
        loadError: 'Erro ao carregar.',
        saveError: 'Erro ao salvar.',
        updateError: 'Erro ao atualizar.',
        deleteError: 'Erro ao excluir.',
        deleteTitle: 'Excluir segredo',
        deleteConfirmMsg: 'Excluir "{{title}}"?',
        requiredError: 'Preencha o título e o segredo.',
        empty: 'Nenhum registro encontrado.',
        emptySearch: 'Nenhum segredo encontrado para esta busca.',
        page: 'Página',
        prev: 'Anterior',
        next: 'Próximo',
        showing: 'Mostrando {{from}}–{{to}} de {{total}} segredos',
        modalTitle: 'Novo segredo',
        editModalTitle: 'Editar segredo',
        cancel: 'Cancelar',
        save: 'Salvar',
        saving: 'Salvando...',
        updating: 'Atualizando...',
        deleting: 'Excluindo...',
        delete: 'Excluir',
        edit: 'Editar',
        update: 'Atualizar',
        viewTitle: 'Detalhes do segredo',
        close: 'Fechar',
        copy: 'Copiar',
        copied: 'Copiado!',
        show: 'Mostrar',
        hide: 'Ocultar',
        created: 'Criado em',
        updated: 'Atualizado',
        shareWarning: 'Nunca compartilhe.',
        typeAccount: 'Conta',
        typeServer: 'Servidor',
        typeApi: 'API',
        typeOther: 'Outro',
        types: { all: 'Todos', account: 'Conta', server: 'Servidor', api: 'API', other: 'Outro' },
        sort: { updated: 'Atualização', title: 'Título', oldest: 'Mais antigo' },
        strength: { weak: 'Fraca', medium: 'Média', strong: 'Forte', veryStrong: 'Muito forte' },
        form: {
          type: 'Tipo',
          title: 'Título',
          titlePlaceholder: 'Ex: Conta principal…',
          username: 'Usuário / Email',
          usernamePlaceholder: 'Ex: admin@org.com',
          url: 'URL',
          urlPlaceholder: 'https://…',
          password: 'Senha',
          passwordPlaceholder: 'Informe o valor secreto',
          keyName: 'Nome da chave',
          keyNamePlaceholder: 'Ex: STRIPE_SECRET_KEY',
          apiKey: 'Chave da API',
          apiEndpoint: 'Endpoint',
          host: 'Host / IP',
          hostPlaceholder: 'Ex: 192.168.1.100',
          port: 'Porta',
          portPlaceholder: '22',
          notes: 'Notas',
          notesPlaceholder: 'Observações…',
        },
      },
    },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

import * as secretsApi from '@/lib/api/secrets';

const makeSummary = (overrides: Partial<SecretSummary> = {}): SecretSummary => ({
  id: 'sec-1',
  workspaceId: 'ws-1',
  title: 'GitHub Token',
  type: 'API',
  username: 'ghp_test',
  url: 'https://github.com',
  notes: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  ...overrides,
});

describe('SecretsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', async () => {
    vi.mocked(secretsApi.listSecrets).mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 6 });

    render(<SecretsPage />);

    await waitFor(() => expect(screen.getByText('Segredos')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /novo segredo/i })).toBeInTheDocument();
  });

  it('shows loading skeletons while fetching', () => {
    vi.mocked(secretsApi.listSecrets).mockReturnValue(new Promise(() => {}));

    render(<SecretsPage />);

    // Table is rendered with skeleton rows during loading
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows records when load succeeds', async () => {
    const record = makeSummary({ title: 'GitHub Token', type: 'API' });
    vi.mocked(secretsApi.listSecrets).mockResolvedValueOnce({
      items: [record],
      total: 1,
      page: 1,
      pageSize: 6,
    });

    render(<SecretsPage />);

    await waitFor(() => expect(screen.getByText('GitHub Token')).toBeInTheDocument());
  });

  it('shows empty state when no records exist', async () => {
    vi.mocked(secretsApi.listSecrets).mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 6 });

    render(<SecretsPage />);

    await waitFor(() => expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument());
  });

  it('shows error message when loading fails', async () => {
    vi.mocked(secretsApi.listSecrets).mockRejectedValueOnce(new Error('Server error'));

    render(<SecretsPage />);

    await waitFor(() => expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument());
  });

  it('opens create modal when "Novo segredo" is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(secretsApi.listSecrets).mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 6 });

    render(<SecretsPage />);

    await waitFor(() => screen.getByRole('button', { name: /novo segredo/i }));
    await user.click(screen.getByRole('button', { name: /novo segredo/i }));

    // The modal form should appear — look for the save button
    await waitFor(() => expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument());
  });

  it('opens delete confirm when delete action is triggered', async () => {
    const user = userEvent.setup();
    const record = makeSummary({ title: 'My Secret' });
    vi.mocked(secretsApi.listSecrets).mockResolvedValue({
      items: [record],
      total: 1,
      page: 1,
      pageSize: 6,
    });

    render(<SecretsPage />);

    // Wait for the row to render and the delete button to appear
    const deleteButton = await screen.findByTitle(/excluir/i);
    await user.click(deleteButton);

    await waitFor(() =>
      expect(screen.getByText(/excluir "my secret"/i)).toBeInTheDocument(),
    );
  });

  it('resets to page 1 when search query changes', async () => {
    const user = userEvent.setup();
    vi.mocked(secretsApi.listSecrets).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 6 });

    render(<SecretsPage initialPage={2} />);

    await waitFor(() => screen.getByPlaceholderText('Pesquisar…'));
    await user.type(screen.getByPlaceholderText('Pesquisar…'), 'stripe');

    await waitFor(() =>
      expect(secretsApi.listSecrets).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, query: 'stripe' }),
      ),
    );
  });

  it('filters by type when a type pill is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(secretsApi.listSecrets).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 6 });

    render(<SecretsPage />);

    await waitFor(() => screen.getByRole('button', { name: /^api$/i }));
    await user.click(screen.getByRole('button', { name: /^api$/i }));

    await waitFor(() =>
      expect(secretsApi.listSecrets).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'API' }),
      ),
    );
  });

  it('is accessible — has a table with correct role', async () => {
    vi.mocked(secretsApi.listSecrets).mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 6 });

    render(<SecretsPage />);

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });
});

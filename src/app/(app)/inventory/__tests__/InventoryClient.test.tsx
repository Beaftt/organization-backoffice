import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { InventoryClient } from '../InventoryClient';
import type { InventoryLocation } from '@/lib/api/inventory';
import * as inventoryApi from '@/lib/api/inventory';

vi.mock('@/lib/api/inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryApi>();
  return {
    ...original,
    listInventoryItems: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 50 }),
    createInventoryLocation: vi.fn(),
    deleteInventoryLocation: vi.fn(),
  };
});

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      inventory: {
        title: 'Inventário',
        subtitle: 'Gerencie seu estoque.',
        locationsTitle: 'Locais',
        locationPlaceholder: 'Novo local...',
        itemsTitle: 'Itens',
        addItem: 'Adicionar item',
        emptyItems: 'Nenhum item ainda.',
        selectLocation: 'Selecione um local.',
        loadError: 'Erro ao carregar.',
        saveError: 'Erro ao salvar.',
        deleteError: 'Erro ao deletar.',
        deleteConfirm: 'Deletar?',
        statusInStock: 'Em estoque',
        statusLow: 'Baixo',
        statusOutOfStock: 'Sem estoque',
        consume: 'Consumir',
        restock: 'Repor',
        delete: 'Excluir',
        consumeTitle: 'Consumir item',
        restockTitle: 'Repor estoque',
        quantityLabel: 'Quantidade',
        notesLabel: 'Observações',
        notesPlaceholder: 'Opcional...',
        optional: 'opcional',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        saving: 'Salvando...',
        createItem: 'Criar item',
        nameLabel: 'Nome',
        namePlaceholder: 'Ex: Arroz',
        brandLabel: 'Marca',
        brandPlaceholder: 'Ex: Tio João',
        unitLabel: 'Unidade',
        minLabel: 'Mín',
        minQuantityLabel: 'Qtd mínima',
        lastPurchased: 'Última compra',
      },
    },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

const mockLocations: InventoryLocation[] = [
  { id: 'loc-1', workspaceId: 'ws-1', name: 'Cozinha', sortOrder: 0, createdAt: '', updatedAt: '' },
  { id: 'loc-2', workspaceId: 'ws-1', name: 'Banheiro', sortOrder: 1, createdAt: '', updatedAt: '' },
];

describe('InventoryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(inventoryApi.listInventoryItems).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders with default state', async () => {
    render(<InventoryClient initialLocations={mockLocations} />);
    await waitFor(() => expect(screen.getByText('Inventário')).toBeInTheDocument());
    expect(screen.getAllByText('Cozinha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Banheiro').length).toBeGreaterThan(0);
  });

  it('shows error banner when initialError is provided', () => {
    render(<InventoryClient initialLocations={[]} initialError="Workspace não selecionado" />);
    expect(screen.getByText('Workspace não selecionado')).toBeInTheDocument();
  });

  it('shows select location hint when no locations exist', () => {
    render(<InventoryClient initialLocations={[]} />);
    expect(screen.getAllByText('Selecione um local.').length).toBeGreaterThan(0);
  });

  it('loads items when a location is selected', async () => {
    render(<InventoryClient initialLocations={mockLocations} />);
    await waitFor(() =>
      expect(inventoryApi.listInventoryItems).toHaveBeenCalledWith(
        expect.objectContaining({ locationId: 'loc-1' }),
      ),
    );
  });

  it('switches location on click and reloads items', async () => {
    const user = userEvent.setup();
    render(<InventoryClient initialLocations={mockLocations} />);

    await user.click(screen.getByRole('button', { name: /banheiro/i }));

    await waitFor(() =>
      expect(inventoryApi.listInventoryItems).toHaveBeenLastCalledWith(
        expect.objectContaining({ locationId: 'loc-2' }),
      ),
    );
  });

  it('shows "add item" button when a location is selected', async () => {
    render(<InventoryClient initialLocations={mockLocations} />);
    await waitFor(() =>
      expect(screen.getByText('Adicionar item')).toBeInTheDocument(),
    );
  });

  it('shows empty state when location has no items', async () => {
    render(<InventoryClient initialLocations={mockLocations} />);
    await waitFor(() =>
      expect(screen.getByText('Nenhum item ainda.')).toBeInTheDocument(),
    );
  });

  it('shows loading skeletons while fetching items', () => {
    vi.mocked(inventoryApi.listInventoryItems).mockReturnValue(new Promise(() => {}));
    render(<InventoryClient initialLocations={mockLocations} />);
    expect(screen.getAllByRole('generic', { hidden: true })[0]).toBeInTheDocument();
  });

  it('adds a new location on button click', async () => {
    const user = userEvent.setup();
    vi.mocked(inventoryApi.createInventoryLocation).mockResolvedValue({
      id: 'loc-3',
      workspaceId: 'ws-1',
      name: 'Escritório',
      sortOrder: 2,
      createdAt: '',
      updatedAt: '',
    });

    render(<InventoryClient initialLocations={mockLocations} />);

    await user.click(screen.getByRole('button', { name: /novo local/i }));

    const input = await screen.findByPlaceholderText('Nome...');
    await user.type(input, 'Escritório');
    await user.click(screen.getByRole('button', { name: /✓/i }));

    await waitFor(() =>
      expect(screen.getAllByText('Escritório').length).toBeGreaterThan(0),
    );
  });
});

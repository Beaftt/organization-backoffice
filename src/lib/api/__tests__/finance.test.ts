import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  listFinanceTags,
  createFinanceTag,
  updateFinanceTag,
  deleteFinanceTag,
  listFinanceCategories,
  createFinanceCategory,
  deleteFinanceCategory,
  listFinanceAccounts,
  createFinanceAccount,
  deleteFinanceAccount,
  listFinanceTransactions,
  createFinanceTransaction,
  deleteFinanceTransaction,
} from '@/lib/api/finance';

const apiFetchMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

vi.mock('@/lib/storage/workspace', () => ({
  getWorkspaceId: () => 'ws-finance',
}));

describe('finance api', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  // ─── Tags ────────────────────────────────────────────────────────────────────

  describe('listFinanceTags', () => {
    it('calls the tags list endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listFinanceTags();

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/tags',
        expect.objectContaining({ workspaceId: 'ws-finance' }),
      );
    });

    it('accepts explicit workspace override', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listFinanceTags('ws-other');

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-other/finance/tags');
    });
  });

  describe('createFinanceTag', () => {
    it('posts to tags endpoint with name and color', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 't-1', name: 'Salary', color: '#00ff00' });

      await createFinanceTag({ name: 'Salary', color: '#00ff00' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/tags',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Salary', color: '#00ff00' }),
        }),
      );
    });
  });

  describe('updateFinanceTag', () => {
    it('puts to tag endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 't-1' });

      await updateFinanceTag({ id: 't-1', name: 'Food', color: '#ff0000' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/tags/t-1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('deleteFinanceTag', () => {
    it('deletes tag by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteFinanceTag({ id: 't-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/tags/t-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── Categories ──────────────────────────────────────────────────────────────

  describe('listFinanceCategories', () => {
    it('calls the categories list endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listFinanceCategories();

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/categories',
        expect.objectContaining({ workspaceId: 'ws-finance' }),
      );
    });
  });

  describe('createFinanceCategory', () => {
    it('posts to categories endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'cat-1', name: 'Food', group: 'EXPENSE' });

      await createFinanceCategory({ name: 'Food', group: 'EXPENSE' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/categories',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Food', group: 'EXPENSE' }),
        }),
      );
    });
  });

  describe('deleteFinanceCategory', () => {
    it('deletes category by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteFinanceCategory({ id: 'cat-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/categories/cat-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── Accounts ────────────────────────────────────────────────────────────────

  describe('listFinanceAccounts', () => {
    it('calls the accounts list endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listFinanceAccounts();

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/accounts',
        expect.objectContaining({ workspaceId: 'ws-finance' }),
      );
    });
  });

  describe('createFinanceAccount', () => {
    it('posts to accounts endpoint with defaults', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'acc-1', name: 'Checking', type: 'BANK' });

      await createFinanceAccount({ name: 'Checking', type: 'BANK' });

      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.name).toBe('Checking');
      expect(body.type).toBe('BANK');
      expect(body.currency).toBe('BRL');
    });
  });

  describe('deleteFinanceAccount', () => {
    it('deletes account by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteFinanceAccount({ id: 'acc-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/accounts/acc-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── Transactions ─────────────────────────────────────────────────────────────

  describe('listFinanceTransactions', () => {
    it('calls the transactions list endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listFinanceTransactions();

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-finance/finance/transactions');
    });

    it('appends date range filters when provided', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listFinanceTransactions({ from: '2025-01-01', to: '2025-01-31' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('from=2025-01-01');
      expect(url).toContain('to=2025-01-31');
    });

    it('appends group and status filters when provided', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listFinanceTransactions({ group: 'EXPENSE', status: 'PENDING' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('group=EXPENSE');
      expect(url).toContain('status=PENDING');
    });
  });

  describe('createFinanceTransaction', () => {
    it('posts to transactions endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'tx-1' });

      await createFinanceTransaction({
        title: 'Groceries',
        amount: 150,
        group: 'EXPENSE',
        occurredAt: '2025-01-15',
      });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/transactions',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.title).toBe('Groceries');
      expect(body.amount).toBe(150);
      expect(body.group).toBe('EXPENSE');
    });
  });

  describe('deleteFinanceTransaction', () => {
    it('deletes transaction by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteFinanceTransaction({ id: 'tx-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-finance/finance/transactions/tx-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});

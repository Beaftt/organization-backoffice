import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  listReminderLists,
  createReminderList,
  updateReminderList,
  deleteReminderList,
  listReminderItems,
  createReminderItem,
  updateReminderItem,
  deleteReminderItem,
} from '@/lib/api/reminders';

const apiFetchMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

vi.mock('@/lib/storage/workspace', () => ({
  getWorkspaceId: () => 'ws-rem',
}));

describe('reminders api', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  // ─── Lists ───────────────────────────────────────────────────────────────────

  describe('listReminderLists', () => {
    it('calls the reminder-lists endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20 });

      await listReminderLists();

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-rem/reminders/lists');
    });

    it('appends pagination params when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 2, pageSize: 5 });

      await listReminderLists({ page: 2, pageSize: 5 });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('page=2');
      expect(url).toContain('pageSize=5');
    });

    it('appends query search param when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20 });

      await listReminderLists({ query: 'shopping' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('q=shopping');
    });
  });

  describe('createReminderList', () => {
    it('posts to the reminder-lists endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'rl-1', title: 'Shopping' });

      await createReminderList({ title: 'Shopping' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-rem/reminders/lists',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.title).toBe('Shopping');
    });

    it('includes recurrence and linkToFinance when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'rl-2', title: 'Monthly Bills' });

      await createReminderList({
        title: 'Monthly Bills',
        recurrence: 'MONTHLY',
        linkToFinance: true,
        resetDay: 1,
      });

      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.recurrence).toBe('MONTHLY');
      expect(body.linkToFinance).toBe(true);
      expect(body.resetDay).toBe(1);
    });
  });

  describe('updateReminderList', () => {
    it('puts to the reminder list endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'rl-1', title: 'Updated List' });

      await updateReminderList({ id: 'rl-1', title: 'Updated List' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-rem/reminders/lists/rl-1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('deleteReminderList', () => {
    it('deletes reminder list by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteReminderList({ id: 'rl-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-rem/reminders/lists/rl-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── Items ───────────────────────────────────────────────────────────────────

  describe('listReminderItems', () => {
    it('calls the items endpoint for the given list', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 50 });

      await listReminderItems({ listId: 'rl-1' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-rem/reminders/lists/rl-1/items');
    });

    it('appends status filter when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 50 });

      await listReminderItems({ listId: 'rl-1', status: 'PENDING' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('status=PENDING');
    });
  });

  describe('createReminderItem', () => {
    it('posts to the items endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'ri-1', title: 'Buy milk' });

      await createReminderItem({ listId: 'rl-1', title: 'Buy milk' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-rem/reminders/lists/rl-1/items',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('updateReminderItem', () => {
    it('puts to the item endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'ri-1', title: 'Buy bread' });

      await updateReminderItem({ listId: 'rl-1', id: 'ri-1', title: 'Buy bread' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-rem/reminders/lists/rl-1/items/ri-1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });

    it('can toggle item status to DONE', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'ri-1', status: 'DONE' });

      await updateReminderItem({ listId: 'rl-1', id: 'ri-1', status: 'DONE' });

      const [url, opts] = apiFetchMock.mock.calls[0] as [string, { method: string; body: string }];
      expect(url).toContain('/workspaces/ws-rem/reminders/lists/rl-1/items/ri-1');
      expect(opts.method).toBe('PUT');
      expect(JSON.parse(opts.body).status).toBe('DONE');
    });
  });

  describe('deleteReminderItem', () => {
    it('deletes item by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteReminderItem({ listId: 'rl-1', id: 'ri-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-rem/reminders/lists/rl-1/items/ri-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});

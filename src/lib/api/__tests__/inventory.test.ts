import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  listInventoryLocations,
  createInventoryLocation,
  updateInventoryLocation,
  deleteInventoryLocation,
  listInventoryItems,
  createInventoryItem,
  deleteInventoryItem,
} from '@/lib/api/inventory';

const apiFetchMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

vi.mock('@/lib/storage/workspace', () => ({
  getWorkspaceId: () => 'ws-inv',
}));

describe('inventory api', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  // ─── Locations ────────────────────────────────────────────────────────────────

  describe('listInventoryLocations', () => {
    it('calls the locations endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce([]);

      await listInventoryLocations();

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-inv/inventory/locations',
        expect.objectContaining({ workspaceId: 'ws-inv' }),
      );
    });
  });

  describe('createInventoryLocation', () => {
    it('posts to the locations endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'loc-1', name: 'Kitchen' });

      await createInventoryLocation({ name: 'Kitchen' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-inv/inventory/locations',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.name).toBe('Kitchen');
    });

    it('includes icon, color and sortOrder when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'loc-2', name: 'Garage' });

      await createInventoryLocation({ name: 'Garage', icon: '🏠', color: '#ff0000', sortOrder: 3 });

      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.icon).toBe('🏠');
      expect(body.color).toBe('#ff0000');
      expect(body.sortOrder).toBe(3);
    });
  });

  describe('updateInventoryLocation', () => {
    it('puts to the location endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'loc-1', name: 'Pantry' });

      await updateInventoryLocation({ id: 'loc-1', name: 'Pantry' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-inv/inventory/locations/loc-1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('deleteInventoryLocation', () => {
    it('deletes location by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteInventoryLocation({ id: 'loc-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-inv/inventory/locations/loc-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── Items ───────────────────────────────────────────────────────────────────

  describe('listInventoryItems', () => {
    it('calls the items endpoint with defaults', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 50 });

      await listInventoryItems({ locationId: 'loc-1' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-inv/inventory/items');
      expect(url).toContain('locationId=loc-1');
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=50');
    });

    it('appends search query when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 50 });

      await listInventoryItems({ locationId: 'loc-1', q: 'rice' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('q=rice');
    });

    it('appends categoryId filter when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 50 });

      await listInventoryItems({ locationId: 'loc-1', categoryId: 'cat-1' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('categoryId=cat-1');
    });
  });

  describe('createInventoryItem', () => {
    it('posts to the items endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'item-1', name: 'Rice', unit: 'KG' });

      await createInventoryItem({ locationId: 'loc-1', name: 'Rice', unit: 'KG' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-inv/inventory/items',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.name).toBe('Rice');
      expect(body.unit).toBe('KG');
      expect(body.locationId).toBe('loc-1');
    });
  });

  describe('deleteInventoryItem', () => {
    it('deletes item by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteInventoryItem({ id: 'item-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-inv/inventory/items/item-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});

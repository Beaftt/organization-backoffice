import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  listSecrets,
  getSecret,
  createSecret,
  updateSecret,
  deleteSecret,
} from '@/lib/api/secrets';

const apiFetchMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

vi.mock('@/lib/storage/workspace', () => ({
  getWorkspaceId: () => 'ws-1',
}));

describe('secrets api', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  describe('listSecrets', () => {
    it('calls list endpoint with workspace and defaults', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 6 });

      await listSecrets();

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-1/secrets',
        expect.objectContaining({ workspaceId: 'ws-1' }),
      );
    });

    it('appends query params when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 2, pageSize: 6 });

      await listSecrets({ page: 2, pageSize: 6, type: 'API', query: 'stripe', orderBy: 'title', orderDirection: 'asc' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('page=2');
      expect(url).toContain('pageSize=6');
      expect(url).toContain('type=API');
      expect(url).toContain('q=stripe');
      expect(url).toContain('orderBy=title');
      expect(url).toContain('orderDirection=asc');
    });

    it('uses explicit workspaceId when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 6 });

      await listSecrets({ workspaceId: 'ws-explicit' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-explicit/secrets');
    });
  });

  describe('getSecret', () => {
    it('calls get endpoint with id', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'sec-1', title: 'My API', secret: 'token' });

      await getSecret({ id: 'sec-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-1/secrets/sec-1',
        expect.objectContaining({ workspaceId: 'ws-1' }),
      );
    });
  });

  describe('createSecret', () => {
    it('calls create endpoint with body', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'sec-2', title: 'DB pass' });

      await createSecret({ title: 'DB pass', type: 'SERVER', secret: 's3cr3t' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-1/secrets',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"DB pass"'),
        }),
      );
    });

    it('includes optional fields when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'sec-3' });

      await createSecret({
        title: 'SSH key',
        type: 'SERVER',
        secret: 'pk',
        username: 'root',
        url: '10.0.0.1:22',
        notes: 'production server',
      });

      const body = JSON.parse((apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body);
      expect(body.username).toBe('root');
      expect(body.url).toBe('10.0.0.1:22');
      expect(body.notes).toBe('production server');
    });
  });

  describe('updateSecret', () => {
    it('calls update endpoint with PUT', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'sec-1', title: 'Updated' });

      await updateSecret({ id: 'sec-1', title: 'Updated', secret: 'newval' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-1/secrets/sec-1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('deleteSecret', () => {
    it('calls delete endpoint with DELETE', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteSecret({ id: 'sec-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-1/secrets/sec-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});

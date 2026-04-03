import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  listHrPeople,
  createHrPerson,
  updateHrPerson,
  deleteHrPerson,
  listHrJobs,
  createHrJob,
  deleteHrJob,
} from '@/lib/api/hr';

const apiFetchMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

vi.mock('@/lib/storage/workspace', () => ({
  getWorkspaceId: () => 'ws-hr',
}));

describe('hr api', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  // ─── People ──────────────────────────────────────────────────────────────────

  describe('listHrPeople', () => {
    it('calls the people list endpoint with defaults', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 });

      await listHrPeople();

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-hr/hr/people');
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=20');
    });

    it('appends search query param when provided', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 });

      await listHrPeople({ q: 'John' });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('q=John');
    });

    it('respects custom page and pageSize', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 2, pageSize: 10, pageCount: 1 });

      await listHrPeople({ page: 2, pageSize: 10 });

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('page=2');
      expect(url).toContain('pageSize=10');
    });
  });

  describe('createHrPerson', () => {
    it('posts to the people endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'p-1', fullName: 'Jane Doe' });

      await createHrPerson({ fullName: 'Jane Doe', status: 'ACTIVE' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-hr/hr/people',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('strips null optional fields from the request body', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'p-2', fullName: 'John Smith' });

      await createHrPerson({ fullName: 'John Smith', email: null, department: null });

      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.email).toBeUndefined();
      expect(body.department).toBeUndefined();
      expect(body.fullName).toBe('John Smith');
    });
  });

  describe('updateHrPerson', () => {
    it('puts to the person endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'p-1', fullName: 'Updated Name' });

      await updateHrPerson({ id: 'p-1', fullName: 'Updated Name', status: 'INACTIVE' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-hr/hr/people/p-1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('deleteHrPerson', () => {
    it('deletes person by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteHrPerson({ id: 'p-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-hr/hr/people/p-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── Jobs ────────────────────────────────────────────────────────────────────

  describe('listHrJobs', () => {
    it('calls the jobs list endpoint with defaults', async () => {
      apiFetchMock.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 });

      await listHrJobs();

      const [url] = apiFetchMock.mock.calls[0] as [string, unknown];
      expect(url).toContain('/workspaces/ws-hr/hr/jobs');
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=20');
    });
  });

  describe('createHrJob', () => {
    it('posts to the jobs endpoint', async () => {
      apiFetchMock.mockResolvedValueOnce({ id: 'j-1', title: 'Software Engineer' });

      await createHrJob({ title: 'Software Engineer', type: 'INTERNAL', status: 'OPEN' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-hr/hr/jobs',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(
        (apiFetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );
      expect(body.title).toBe('Software Engineer');
    });
  });

  describe('deleteHrJob', () => {
    it('deletes job by id', async () => {
      apiFetchMock.mockResolvedValueOnce(undefined);

      await deleteHrJob({ id: 'j-1' });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/workspaces/ws-hr/hr/jobs/j-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});

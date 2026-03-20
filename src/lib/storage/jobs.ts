import { getWorkspaceId } from '@/lib/storage/workspace';
import type { JobUiMeta } from '@/components/jobs/types';

const KEY_PREFIX = 'org.jobs.meta';

export function getJobMetaMap(workspaceId = getWorkspaceId()): Record<string, JobUiMeta> {
  if (typeof window === 'undefined' || !workspaceId) {
    return {};
  }

  const raw = window.localStorage.getItem(`${KEY_PREFIX}.${workspaceId}`);
  if (!raw) {
    return {};
  }

  try {
    return (JSON.parse(raw) as Record<string, JobUiMeta>) ?? {};
  } catch {
    return {};
  }
}

export function setJobMetaMap(value: Record<string, JobUiMeta>, workspaceId = getWorkspaceId()): void {
  if (typeof window === 'undefined' || !workspaceId) {
    return;
  }

  window.localStorage.setItem(`${KEY_PREFIX}.${workspaceId}`, JSON.stringify(value));
}
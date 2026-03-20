import { getWorkspaceId } from '@/lib/storage/workspace';
import type { StudyCourseUiMeta } from '@/components/studies/types';

const KEY_PREFIX = 'org.studies.meta';

export function getStudyCourseMetaMap(workspaceId = getWorkspaceId()): Record<string, StudyCourseUiMeta> {
  if (typeof window === 'undefined' || !workspaceId) {
    return {};
  }

  const raw = window.localStorage.getItem(`${KEY_PREFIX}.${workspaceId}`);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, StudyCourseUiMeta>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function setStudyCourseMetaMap(
  value: Record<string, StudyCourseUiMeta>,
  workspaceId = getWorkspaceId(),
): void {
  if (typeof window === 'undefined' || !workspaceId) {
    return;
  }

  window.localStorage.setItem(`${KEY_PREFIX}.${workspaceId}`, JSON.stringify(value));
}

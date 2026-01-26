const WORKSPACE_STORAGE_KEY = "org.workspace.active";
const WORKSPACE_COOKIE_KEY = "workspace_id";

export const getWorkspaceId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
};

export const setWorkspaceId = (workspaceId: string) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
  document.cookie = `${WORKSPACE_COOKIE_KEY}=${workspaceId}; path=/; SameSite=Lax`;
};

export const clearWorkspaceId = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  document.cookie = `${WORKSPACE_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

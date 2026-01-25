const WORKSPACE_STORAGE_KEY = "org.workspace.active";

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
};

export const clearWorkspaceId = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
};

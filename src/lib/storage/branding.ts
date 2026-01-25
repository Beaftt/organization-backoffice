const WORKSPACE_LOGO_KEY = "org.workspace.logo";

const getWorkspaceLogoKey = (workspaceId: string) =>
  `${WORKSPACE_LOGO_KEY}.${workspaceId}`;

export const getWorkspaceLogo = (workspaceId: string): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getWorkspaceLogoKey(workspaceId));
};

export const setWorkspaceLogo = (workspaceId: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getWorkspaceLogoKey(workspaceId), value);
};

export const clearWorkspaceLogo = (workspaceId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getWorkspaceLogoKey(workspaceId));
};

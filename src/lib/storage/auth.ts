export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const AUTH_STORAGE_KEY = "org.auth.tokens";
type AuthStorageMode = "local" | "session";

const readTokens = (storage: Storage): AuthTokens | null => {
  const raw = storage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
};

export const getAuthTokens = (): AuthTokens | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const local = readTokens(window.localStorage);
  if (local) {
    return local;
  }

  return readTokens(window.sessionStorage);
};

export const getAuthStorageMode = (): AuthStorageMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.localStorage.getItem(AUTH_STORAGE_KEY)) {
    return "local";
  }

  if (window.sessionStorage.getItem(AUTH_STORAGE_KEY)) {
    return "session";
  }

  return null;
};

export const setAuthTokens = (tokens: AuthTokens, options?: { persist?: boolean }) => {
  if (typeof window === "undefined") {
    return;
  }

  const persist = options?.persist ?? true;
  const target = persist ? window.localStorage : window.sessionStorage;
  const other = persist ? window.sessionStorage : window.localStorage;

  target.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
  other.removeItem(AUTH_STORAGE_KEY);
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

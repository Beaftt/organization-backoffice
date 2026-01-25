export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const AUTH_STORAGE_KEY = "org.auth.tokens";

export const getAuthTokens = (): AuthTokens | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
};

export const setAuthTokens = (tokens: AuthTokens) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

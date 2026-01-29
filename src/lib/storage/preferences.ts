export type DefaultModule =
  | "dashboard"
  | "reminders"
  | "secrets"
  | "documents"
  | "finance"
  | "hr"
  | "studies"
  | "calendar";

const DEFAULT_MODULE_KEY = "org.default.module";

export const getDefaultModule = (): DefaultModule | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(DEFAULT_MODULE_KEY);
  if (!raw) {
    return null;
  }

  return raw as DefaultModule;
};

export const setDefaultModule = (module: DefaultModule) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEFAULT_MODULE_KEY, module);
};

export const clearDefaultModule = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEFAULT_MODULE_KEY);
};

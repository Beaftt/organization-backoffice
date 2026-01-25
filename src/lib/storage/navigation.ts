const LAST_ROUTE_KEY = "org.last.route";

export const getLastVisitedRoute = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(LAST_ROUTE_KEY);
};

export const setLastVisitedRoute = (route: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_ROUTE_KEY, route);
};

export const clearLastVisitedRoute = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LAST_ROUTE_KEY);
};

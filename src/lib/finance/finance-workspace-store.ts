import { useSyncExternalStore } from 'react';

import type { FinanceSurface } from '@/lib/navigation/finance-route-state';

const FINANCE_WORKSPACE_STORAGE_KEY = 'org.finance.workspace.v2';

export type FinanceInterruptedDraft = {
  origin: 'desk' | 'transaction-modal' | 'setup';
  payload: Record<string, unknown>;
  blockedReason?: string | null;
  updatedAt: number;
};

export type FinanceResolverContext = {
  target: 'desk' | 'transaction-modal';
  href: string;
  reason: string;
};

export type FinanceWorkspaceState = {
  currentSurface: FinanceSurface;
  lastMonth: string | null;
  queueOpen: boolean;
  selectedTransactionId: string | null;
  interruptedDraft: FinanceInterruptedDraft | null;
  resolverContext: FinanceResolverContext | null;
};

type FinanceWorkspaceUpdater =
  | Partial<FinanceWorkspaceState>
  | ((current: FinanceWorkspaceState) => FinanceWorkspaceState);

const defaultFinanceWorkspaceState: FinanceWorkspaceState = {
  currentSurface: 'desk',
  lastMonth: null,
  queueOpen: false,
  selectedTransactionId: null,
  interruptedDraft: null,
  resolverContext: null,
};

let financeWorkspaceState = defaultFinanceWorkspaceState;
let hasHydratedFinanceWorkspaceState = false;

const financeWorkspaceListeners = new Set<() => void>();

const canUseBrowserStorage = () => typeof window !== 'undefined';

const hydrateFinanceWorkspaceState = () => {
  if (!canUseBrowserStorage() || hasHydratedFinanceWorkspaceState) {
    return;
  }

  hasHydratedFinanceWorkspaceState = true;

  const raw = window.sessionStorage.getItem(FINANCE_WORKSPACE_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FinanceWorkspaceState>;
    financeWorkspaceState = {
      ...defaultFinanceWorkspaceState,
      ...parsed,
    };
  } catch {
    financeWorkspaceState = defaultFinanceWorkspaceState;
  }
};

const persistFinanceWorkspaceState = () => {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    FINANCE_WORKSPACE_STORAGE_KEY,
    JSON.stringify(financeWorkspaceState),
  );
};

const emitFinanceWorkspaceChange = () => {
  financeWorkspaceListeners.forEach((listener) => listener());
};

export const getFinanceWorkspaceState = () => {
  hydrateFinanceWorkspaceState();
  return financeWorkspaceState;
};

export const updateFinanceWorkspaceState = (
  updater: FinanceWorkspaceUpdater,
) => {
  hydrateFinanceWorkspaceState();
  financeWorkspaceState =
    typeof updater === 'function'
      ? updater(financeWorkspaceState)
      : {
          ...financeWorkspaceState,
          ...updater,
        };
  persistFinanceWorkspaceState();
  emitFinanceWorkspaceChange();
};

export const resetFinanceWorkspaceState = () => {
  financeWorkspaceState = defaultFinanceWorkspaceState;
  persistFinanceWorkspaceState();
  emitFinanceWorkspaceChange();
};

export const subscribeFinanceWorkspaceState = (listener: () => void) => {
  hydrateFinanceWorkspaceState();
  financeWorkspaceListeners.add(listener);

  return () => {
    financeWorkspaceListeners.delete(listener);
  };
};

export const useFinanceWorkspaceState = () =>
  useSyncExternalStore(
    subscribeFinanceWorkspaceState,
    getFinanceWorkspaceState,
    () => defaultFinanceWorkspaceState,
  );

export const setFinanceInterruptedDraft = (
  interruptedDraft: FinanceInterruptedDraft | null,
) => {
  updateFinanceWorkspaceState({ interruptedDraft });
};

export const setFinanceResolverContext = (
  resolverContext: FinanceResolverContext | null,
) => {
  updateFinanceWorkspaceState({ resolverContext });
};
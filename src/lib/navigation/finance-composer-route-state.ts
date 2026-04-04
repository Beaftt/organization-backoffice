import {
  serializeFinanceRouteState,
  type FinanceRouteState,
} from '@/lib/navigation/finance-route-state';

type SearchParamMap = {
  get?: (name: string) => string | null;
  [key: string]:
    | string
    | string[]
    | undefined
    | ((name: string) => string | null);
};

type SearchParamInput = URLSearchParams | SearchParamMap;

export type FinanceComposerMode = 'create' | 'edit';
export type FinanceComposerIntent = 'expense' | 'credit' | 'income' | 'transfer';

export type FinanceComposerRouteState = {
  mode: FinanceComposerMode;
  intent: FinanceComposerIntent;
  step: 1 | 2 | 3;
  transactionId: string | null;
};

const composerIntentValues: FinanceComposerIntent[] = [
  'expense',
  'credit',
  'income',
  'transfer',
];

const readSearchParam = (input: SearchParamInput, key: string) => {
  if (typeof input.get === 'function') {
    return input.get(key);
  }

  const value = (input as SearchParamMap)[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return typeof value === 'string' ? value : null;
};

const normalizeComposerStep = (value?: string | null): 1 | 2 | 3 => {
  const parsed = Number(value ?? 1);

  if (parsed <= 1 || Number.isNaN(parsed)) {
    return 1;
  }

  if (parsed >= 3) {
    return 3;
  }

  return 2;
};

const normalizeComposerIntent = (
  value?: string | null,
): FinanceComposerIntent => {
  return composerIntentValues.includes(value as FinanceComposerIntent)
    ? (value as FinanceComposerIntent)
    : 'expense';
};

export const parseFinanceComposerRouteState = (
  input: SearchParamInput,
): FinanceComposerRouteState | null => {
  const mode = readSearchParam(input, 'composer');

  if (mode !== 'create' && mode !== 'edit') {
    return null;
  }

  return {
    mode,
    intent: normalizeComposerIntent(readSearchParam(input, 'composerIntent')),
    step: normalizeComposerStep(readSearchParam(input, 'composerStep')),
    transactionId: readSearchParam(input, 'composerTx'),
  };
};

export const applyFinanceComposerRouteState = (
  params: URLSearchParams,
  composerState: FinanceComposerRouteState | null,
) => {
  params.delete('composer');
  params.delete('composerIntent');
  params.delete('composerStep');
  params.delete('composerTx');

  if (!composerState) {
    return params;
  }

  params.set('composer', composerState.mode);
  params.set('composerIntent', composerState.intent);
  params.set('composerStep', String(composerState.step));

  if (composerState.mode === 'edit' && composerState.transactionId) {
    params.set('composerTx', composerState.transactionId);
  }

  return params;
};

export const buildFinanceDeskHref = (
  routeState: FinanceRouteState,
  composerState: FinanceComposerRouteState | null,
) => {
  const params = serializeFinanceRouteState('desk', routeState);
  const nextParams = applyFinanceComposerRouteState(params, composerState);
  const query = nextParams.toString();

  return `/finance/desk${query ? `?${query}` : ''}`;
};
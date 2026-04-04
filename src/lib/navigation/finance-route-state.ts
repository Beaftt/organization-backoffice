export type FinanceSurface = 'desk' | 'insights' | 'setup';

export type FinanceCompatibilitySurface = FinanceSurface | 'legacy';

export type FinanceScaffoldTab =
  | 'overview'
  | 'entries'
  | 'accounts'
  | 'paymentMethods';

export type FinanceMonthState = {
  year: number;
  month: number;
};

export type FinanceRouteState = {
  accountId: string;
  cardId: string;
  query: string;
  group: string;
  route: string;
  type: string;
  status: string;
  sort: string;
  page: number;
  month: FinanceMonthState;
  tab: FinanceScaffoldTab;
};

type SearchParamMap = {
  get?: (name: string) => string | null;
  [key: string]: string | string[] | undefined | ((name: string) => string | null);
};

type SearchParamInput = URLSearchParams | SearchParamMap;

const DESK_TABS: FinanceScaffoldTab[] = ['overview', 'entries'];
const SETUP_TABS: FinanceScaffoldTab[] = ['accounts', 'paymentMethods'];
const LEGACY_TABS: FinanceScaffoldTab[] = [...DESK_TABS, ...SETUP_TABS];

const DEFAULT_GROUP = 'all';
const DEFAULT_ACCOUNT = 'all';
const DEFAULT_CARD = 'all';
const DEFAULT_ROUTE = 'all';
const DEFAULT_TYPE = 'all';
const DEFAULT_STATUS = 'all';
const DEFAULT_SORT = 'date';
const DEFAULT_PAGE = 1;

export const getCurrentFinanceMonthState = (
  date: Date = new Date(),
): FinanceMonthState => ({
  year: date.getFullYear(),
  month: date.getMonth(),
});

export const resolveFinanceSurface = (
  surface: FinanceCompatibilitySurface,
): FinanceSurface => (surface === 'legacy' ? 'desk' : surface);

export const getAllowedFinanceTabs = (
  surface: FinanceCompatibilitySurface,
): FinanceScaffoldTab[] => {
  if (surface === 'setup') {
    return SETUP_TABS;
  }

  if (surface === 'desk') {
    return DESK_TABS;
  }

  if (surface === 'insights') {
    return ['overview'];
  }

  return LEGACY_TABS;
};

export const getDefaultFinanceTab = (
  surface: FinanceCompatibilitySurface,
): FinanceScaffoldTab => {
  if (surface === 'setup') {
    return 'accounts';
  }

  return 'overview';
};

export const normalizeFinanceTab = (
  surface: FinanceCompatibilitySurface,
  value?: string | null,
): FinanceScaffoldTab => {
  const allowedTabs = getAllowedFinanceTabs(surface);
  return allowedTabs.includes(value as FinanceScaffoldTab)
    ? (value as FinanceScaffoldTab)
    : getDefaultFinanceTab(surface);
};

export const formatFinanceMonthParam = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

export const parseFinanceMonthParam = (
  value?: string | null,
  fallback: FinanceMonthState = getCurrentFinanceMonthState(),
): FinanceMonthState => {
  if (!value) {
    return fallback;
  }

  const [yearValue, monthValue] = value.split('-');
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return fallback;
  }

  return {
    year,
    month: month - 1,
  };
};

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

const parseFinancePage = (value?: string | null) => {
  const parsed = Number(value ?? DEFAULT_PAGE);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_PAGE;
  }

  return parsed;
};

export const createDefaultFinanceRouteState = (
  surface: FinanceCompatibilitySurface = 'desk',
): FinanceRouteState => ({
  accountId: DEFAULT_ACCOUNT,
  cardId: DEFAULT_CARD,
  query: '',
  group: DEFAULT_GROUP,
  route: DEFAULT_ROUTE,
  type: DEFAULT_TYPE,
  status: DEFAULT_STATUS,
  sort: DEFAULT_SORT,
  page: DEFAULT_PAGE,
  month: getCurrentFinanceMonthState(),
  tab: getDefaultFinanceTab(surface),
});

export const parseFinanceRouteState = (
  input: SearchParamInput,
  surface: FinanceCompatibilitySurface = 'desk',
): FinanceRouteState => {
  const fallback = createDefaultFinanceRouteState(surface);

  return {
    accountId: readSearchParam(input, 'account') ?? fallback.accountId,
    cardId: readSearchParam(input, 'card') ?? fallback.cardId,
    query: readSearchParam(input, 'q') ?? fallback.query,
    group: readSearchParam(input, 'group') ?? fallback.group,
    route: readSearchParam(input, 'route') ?? fallback.route,
    type: readSearchParam(input, 'type') ?? fallback.type,
    status: readSearchParam(input, 'status') ?? fallback.status,
    sort: readSearchParam(input, 'sort') ?? fallback.sort,
    page: parseFinancePage(readSearchParam(input, 'page')),
    month: parseFinanceMonthParam(readSearchParam(input, 'month'), fallback.month),
    tab: normalizeFinanceTab(surface, readSearchParam(input, 'tab')),
  };
};

export const serializeFinanceRouteState = (
  surface: FinanceCompatibilitySurface,
  state: FinanceRouteState,
) => {
  const params = new URLSearchParams();

  params.set('month', formatFinanceMonthParam(state.month.year, state.month.month));

  if (state.accountId !== DEFAULT_ACCOUNT) {
    params.set('account', state.accountId);
  }

  if (state.cardId !== DEFAULT_CARD) {
    params.set('card', state.cardId);
  }

  if (state.query) {
    params.set('q', state.query);
  }

  if (state.group !== DEFAULT_GROUP) {
    params.set('group', state.group);
  }

  if (state.route !== DEFAULT_ROUTE) {
    params.set('route', state.route);
  }

  if (state.type !== DEFAULT_TYPE) {
    params.set('type', state.type);
  }

  if (state.status !== DEFAULT_STATUS) {
    params.set('status', state.status);
  }

  if (state.sort !== DEFAULT_SORT) {
    params.set('sort', state.sort);
  }

  if (state.page !== DEFAULT_PAGE) {
    params.set('page', String(state.page));
  }

  const normalizedTab = normalizeFinanceTab(surface, state.tab);
  if (surface !== 'insights' && normalizedTab !== getDefaultFinanceTab(surface)) {
    params.set('tab', normalizedTab);
  }

  return params;
};

export const buildFinanceHref = (
  surface: FinanceCompatibilitySurface,
  state: FinanceRouteState,
) => {
  const params = serializeFinanceRouteState(surface, state);
  const query = params.toString();
  const basePath = surface === 'legacy' ? '/finance' : `/finance/${surface}`;

  return `${basePath}${query ? `?${query}` : ''}`;
};

export const resolveFinanceSurfaceFromPathname = (
  pathname: string,
): FinanceSurface => {
  if (pathname.includes('/finance/setup')) {
    return 'setup';
  }

  if (pathname.includes('/finance/insights')) {
    return 'insights';
  }

  return 'desk';
};
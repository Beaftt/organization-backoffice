'use client';

import { useLanguage } from '@/lib/i18n/language-context';

export type FinanceScaffoldTab =
  | 'overview'
  | 'entries'
  | 'accounts'
  | 'paymentMethods';

export type FinancePageRailMode = 'full' | 'activity' | 'setup';

interface FinancePageRailProps {
  activeTab: FinanceScaffoldTab;
  mode?: FinancePageRailMode;
  monthLabel: string;
  isCurrentMonth: boolean;
  showMonthControls: boolean;
  onTabChange: (tab: FinanceScaffoldTab) => void;
  onMonthPrev: () => void;
  onMonthNext: () => void;
  onMonthReset: () => void;
  todayLabel: string;
}

const activityTabs: FinanceScaffoldTab[] = ['overview', 'entries'];
const setupTabs: FinanceScaffoldTab[] = ['accounts', 'paymentMethods'];

export function FinancePageRail({
  activeTab,
  mode = 'full',
  monthLabel,
  isCurrentMonth,
  showMonthControls,
  onTabChange,
  onMonthPrev,
  onMonthNext,
  onMonthReset,
  todayLabel,
}: FinancePageRailProps) {
  const { t } = useLanguage();
  const showActivityTabs = mode === 'full' || mode === 'activity';
  const showSetupTabs = mode === 'full' || mode === 'setup';

  const labels: Record<FinanceScaffoldTab, string> = {
    overview: t.finance.tabsOverview ?? 'Visão Geral',
    entries: t.finance.tabsEntries ?? 'Lançamentos',
    accounts: t.finance.tabsAccounts ?? t.finance.accountsTitle ?? 'Contas',
    paymentMethods: t.finance.tabsPaymentMethods ?? 'Métodos de Pagamento',
  };

  const renderTab = (tab: FinanceScaffoldTab) => {
    const isActive = activeTab === tab;

    return (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        aria-pressed={isActive}
        className={`rounded-full px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30 ${
          isActive
            ? 'bg-[var(--sidebar)] text-[var(--sidebar-text)] shadow-sm'
            : 'text-[var(--foreground)]/65 hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
        }`}
      >
        {labels[tab]}
      </button>
    );
  };

  return (
    <div className="page-transition rounded-[28px] border [border-color:var(--border)] bg-[var(--surface)] px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3">
          {showActivityTabs ? (
            <div className="grid gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
                {t.finance.activityGroupLabel ?? 'Atividade'}
              </p>
              <div className="flex flex-wrap gap-1 rounded-full bg-[var(--surface-muted)] p-1">
                {activityTabs.map(renderTab)}
              </div>
            </div>
          ) : null}

          {showSetupTabs ? (
            <div className="grid gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
                {t.finance.setupGroupLabel ?? 'Configuração'}
              </p>
              <div className="flex flex-wrap gap-1 rounded-full bg-[var(--surface-muted)] p-1">
                {setupTabs.map(renderTab)}
              </div>
            </div>
          ) : null}
        </div>

        {showMonthControls ? (
          <div className="flex flex-wrap items-center gap-2 rounded-full border [border-color:var(--border)] bg-[var(--surface-muted)] px-2 py-2">
            <button
              type="button"
              onClick={onMonthPrev}
              aria-label={t.finance.prev}
              className="rounded-full p-2 text-[var(--foreground)]/55 transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onMonthReset}
              className="rounded-full px-3 py-1.5 text-sm font-semibold capitalize text-[var(--foreground)] transition hover:bg-[var(--surface)]"
            >
              {monthLabel}
            </button>

            <button
              type="button"
              onClick={onMonthNext}
              aria-label={t.finance.next}
              className="rounded-full p-2 text-[var(--foreground)]/55 transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {!isCurrentMonth ? (
              <button
                type="button"
                onClick={onMonthReset}
                className="rounded-full bg-[var(--sidebar)] px-3 py-1.5 text-xs font-semibold text-[var(--sidebar-text)] transition hover:opacity-85"
              >
                {todayLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
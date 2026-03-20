'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { StatMiniCard } from '../cards/StatMiniCard';
import type { DashboardFinanceSummary, DashboardStats } from '../../types';

interface DashboardStatsRowProps {
  stats: DashboardStats;
  finance: DashboardFinanceSummary | null;
  isLoading: boolean;
  formatValue: (v: number) => string;
}

export function DashboardStatsRow({
  stats,
  finance,
  isLoading,
  formatValue,
}: DashboardStatsRowProps) {
  const { t } = useLanguage();

  const prevMonthValue =
    finance && finance.previousMonthResult !== 0
      ? formatValue(finance.previousMonthResult)
      : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatMiniCard
        label={t.dashboard.summaryListsTitle}
        value={stats.listCount}
        subtitle={t.dashboard.summaryListsMeta}
        isLoading={isLoading}
      />
      <StatMiniCard
        label={t.dashboard.summarySecretsTitle}
        value={stats.secretCount}
        subtitle={t.dashboard.summarySecretsMeta}
        isLoading={isLoading}
      />
      <StatMiniCard
        label={t.dashboard.summaryDocumentsTitle}
        value={stats.recentDocument?.name ?? null}
        subtitle={t.dashboard.summaryDocumentsSubtitle}
        isLoading={isLoading}
      />
      <StatMiniCard
        label={t.dashboard.statsPrevMonthLabel}
        value={prevMonthValue}
        subtitle={t.dashboard.vsLastMonth}
        isLoading={isLoading}
      />
    </div>
  );
}

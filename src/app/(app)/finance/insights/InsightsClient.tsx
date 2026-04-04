'use client';

import { FinanceInsightsSurface } from '@/components/finance/insights/FinanceInsightsSurface';
import { useFinanceInsightsState } from '@/components/finance/insights/useFinanceInsightsState';

import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

type InsightsClientProps = {
  initialRouteState: FinanceRouteState;
};

export function InsightsClient({ initialRouteState }: InsightsClientProps) {
  const insights = useFinanceInsightsState(initialRouteState);

  return <FinanceInsightsSurface insights={insights} />;
}
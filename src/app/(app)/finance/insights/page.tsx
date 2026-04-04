import { Suspense } from 'react';

import { InsightsClient } from './InsightsClient';

import { parseFinanceRouteState } from '@/lib/navigation/finance-route-state';

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function FinanceInsightsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={null}>
      <InsightsClient
        initialRouteState={parseFinanceRouteState(resolvedParams, 'insights')}
      />
    </Suspense>
  );
}
import { Suspense } from 'react';

import { SetupClient } from './SetupClient';

import { parseFinanceRouteState } from '@/lib/navigation/finance-route-state';

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function FinanceSetupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={null}>
      <SetupClient initialRouteState={parseFinanceRouteState(resolvedParams, 'setup')} />
    </Suspense>
  );
}
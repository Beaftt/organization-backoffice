import { Suspense } from 'react';

import { DeskClient } from './DeskClient';

import { parseFinanceComposerRouteState } from '@/lib/navigation/finance-composer-route-state';
import { parseFinanceRouteState } from '@/lib/navigation/finance-route-state';

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function FinanceDeskPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={null}>
      <DeskClient
        initialComposerState={parseFinanceComposerRouteState(resolvedParams)}
        initialRouteState={parseFinanceRouteState(resolvedParams, 'desk')}
      />
    </Suspense>
  );
}
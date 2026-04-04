'use client';

import { FinanceDeskSurface } from '@/components/finance/desk/FinanceDeskSurface';
import { useFinanceDeskState } from '@/components/finance/desk/useFinanceDeskState';

import type { FinanceComposerRouteState } from '@/lib/navigation/finance-composer-route-state';
import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

type DeskClientProps = {
  initialComposerState?: FinanceComposerRouteState | null;
  initialRouteState: FinanceRouteState;
};

export function DeskClient({
  initialComposerState = null,
  initialRouteState,
}: DeskClientProps) {
  const desk = useFinanceDeskState({ initialRouteState, initialComposerState });

  return <FinanceDeskSurface desk={desk} />;
}
'use client';

import { FinanceSetupSurface } from '@/components/finance/setup/FinanceSetupSurface';
import { useFinanceSetupState } from '@/components/finance/setup/useFinanceSetupState';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatMonthLabelForLanguage } from '@/lib/i18n/locale';

import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

type SetupClientProps = {
  initialRouteState: FinanceRouteState;
};

export function SetupClient({ initialRouteState }: SetupClientProps) {
  const { language } = useLanguage();
  const setup = useFinanceSetupState();
  const monthLabel = formatMonthLabelForLanguage(
    language,
    new Date(initialRouteState.month.year, initialRouteState.month.month - 1, 1),
  );

  return (
    <FinanceSetupSurface monthLabel={monthLabel} setup={setup} />
  );
}
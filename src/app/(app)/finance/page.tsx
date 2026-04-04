import { redirect } from 'next/navigation';

import {
  buildFinanceHref,
  parseFinanceRouteState,
} from '@/lib/navigation/finance-route-state';

type SearchParams = {
  q?: string;
  group?: string;
  type?: string;
  status?: string;
  sort?: string;
  page?: string;
  month?: string;
  tab?: string;
};

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  redirect(buildFinanceHref('desk', parseFinanceRouteState(resolvedParams, 'desk')));
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { InsightsClient } from '@/app/(app)/finance/insights/InsightsClient';
import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

const mocks = vi.hoisted(() => ({
  useFinanceInsightsState: vi.fn(),
}));

vi.mock('@/components/finance/insights/useFinanceInsightsState', () => ({
  useFinanceInsightsState: mocks.useFinanceInsightsState,
}));

vi.mock('@/components/finance/insights/FinanceInsightsSurface', () => ({
  FinanceInsightsSurface: ({ insights }: { insights: { label: string } }) => (
    <section aria-label="insights surface">{insights.label}</section>
  ),
}));

const initialRouteState: FinanceRouteState = {
  query: '',
  group: 'all',
  type: 'all',
  status: 'all',
  sort: 'date',
  page: 1,
  month: { year: 2026, month: 3 },
  tab: 'overview',
};

describe('InsightsClient', () => {
  beforeEach(() => {
    mocks.useFinanceInsightsState.mockReset();
  });

  it('renders the insights surface when the insights state resolves', () => {
    mocks.useFinanceInsightsState.mockReturnValue({ label: 'Insights V2' });

    render(<InsightsClient initialRouteState={initialRouteState} />);

    expect(screen.getByRole('region', { name: 'insights surface' })).toHaveTextContent(
      'Insights V2',
    );
  });

  it('passes the route month and filters into the insights hook', () => {
    mocks.useFinanceInsightsState.mockReturnValue({ label: 'Insights route' });

    render(<InsightsClient initialRouteState={initialRouteState} />);

    expect(mocks.useFinanceInsightsState).toHaveBeenCalledWith(initialRouteState);
  });
});
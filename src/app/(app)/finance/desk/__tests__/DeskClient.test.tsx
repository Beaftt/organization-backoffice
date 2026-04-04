import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DeskClient } from '@/app/(app)/finance/desk/DeskClient';
import type { FinanceComposerRouteState } from '@/lib/navigation/finance-composer-route-state';
import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

const mocks = vi.hoisted(() => ({
  useFinanceDeskState: vi.fn(),
}));

vi.mock('@/components/finance/desk/useFinanceDeskState', () => ({
  useFinanceDeskState: mocks.useFinanceDeskState,
}));

vi.mock('@/components/finance/desk/FinanceDeskSurface', () => ({
  FinanceDeskSurface: ({ desk }: { desk: { label: string } }) => (
    <section aria-label="desk surface">{desk.label}</section>
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

const initialComposerState: FinanceComposerRouteState = {
  mode: 'create',
  intent: 'credit',
  step: 2,
  transactionId: null,
};

describe('DeskClient', () => {
  beforeEach(() => {
    mocks.useFinanceDeskState.mockReset();
  });

  it('renders the desk surface when the desk state resolves', () => {
    mocks.useFinanceDeskState.mockReturnValue({ label: 'Desk V2' });

    render(<DeskClient initialRouteState={initialRouteState} />);

    expect(screen.getByRole('region', { name: 'desk surface' })).toHaveTextContent(
      'Desk V2',
    );
    expect(mocks.useFinanceDeskState).toHaveBeenCalledWith({
      initialRouteState,
      initialComposerState: null,
    });
  });

  it('passes composer state into the desk hook when the modal route is restored', () => {
    mocks.useFinanceDeskState.mockReturnValue({ label: 'Desk modal resumed' });

    render(
      <DeskClient
        initialRouteState={initialRouteState}
        initialComposerState={initialComposerState}
      />,
    );

    expect(mocks.useFinanceDeskState).toHaveBeenCalledWith({
      initialRouteState,
      initialComposerState,
    });
  });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceOverlayShell } from '@/components/finance/drawers/FinanceOverlayShell';

const mockLanguage = { current: 'en' as 'pt' | 'en' };

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: { finance: { close: mockLanguage.current === 'pt' ? 'Fechar' : 'Close' } },
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceOverlayShell', () => {
  it('renders dialog content when open', () => {
    render(
      <FinanceOverlayShell open title="Setup overlay" onClose={vi.fn()}>
        <p>Body</p>
      </FinanceOverlayShell>,
    );

    expect(screen.getByRole('dialog', { name: 'Setup overlay' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <FinanceOverlayShell open title="Drawer" variant="drawer" onClose={onClose}>
        <p>Drawer body</p>
      </FinanceOverlayShell>,
    );

    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
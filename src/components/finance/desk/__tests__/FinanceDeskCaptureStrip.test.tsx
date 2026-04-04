import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceDeskCaptureStrip } from '@/components/finance/desk/FinanceDeskCaptureStrip';

describe('FinanceDeskCaptureStrip', () => {
  it('renders the four quick capture routes for the desk', () => {
    render(<FinanceDeskCaptureStrip onOpenComposer={vi.fn()} />);

    expect(screen.getByRole('button', { name: /débito \/ pix/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crédito/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /receita/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transferência/i })).toBeInTheDocument();
  });

  it('opens the composer with the chosen route when a quick action is clicked', async () => {
    const user = userEvent.setup();
    const onOpenComposer = vi.fn();

    render(<FinanceDeskCaptureStrip onOpenComposer={onOpenComposer} />);

    await user.click(screen.getByRole('button', { name: /crédito/i }));
    await user.click(screen.getByRole('button', { name: /transferência/i }));

    expect(onOpenComposer).toHaveBeenNthCalledWith(1, 'credit');
    expect(onOpenComposer).toHaveBeenNthCalledWith(2, 'transfer');
  });
});
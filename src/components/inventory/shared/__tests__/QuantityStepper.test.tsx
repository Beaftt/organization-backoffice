import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QuantityStepper } from '../QuantityStepper';

describe('QuantityStepper', () => {
  it('renders the current value', () => {
    render(<QuantityStepper value={5} min={0} max={10} onChange={vi.fn()} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onChange with decremented value when decrease is clicked', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper value={5} min={0} max={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with incremented value when increase is clicked', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper value={5} min={0} max={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('disables decrease button when value equals min', () => {
    render(<QuantityStepper value={0} min={0} max={10} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();
  });

  it('disables increase button when value equals max', () => {
    render(<QuantityStepper value={10} min={0} max={10} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
  });

  it('does not go below min when decrease is clicked at min', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper value={0} min={0} max={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not go above max when increase is clicked at max', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper value={10} min={0} max={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('both buttons are accessible via aria-label', () => {
    render(<QuantityStepper value={5} min={0} max={10} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
  });
});

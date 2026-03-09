import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders initials when no src provided', () => {
    render(<Avatar name='John Doe' />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders single initial for single-word name', () => {
    render(<Avatar name='Alice' />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar name='Jane Smith' src='https://example.com/avatar.jpg' />);
    expect(screen.getByRole('img', { name: 'Jane Smith' })).toBeInTheDocument();
  });

  it('has accessible aria-label when showing initials', () => {
    render(<Avatar name='Bob Martin' />);
    expect(screen.getByRole('img', { name: 'Bob Martin' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Avatar name='Test User' className='custom-class' />);
    const el = screen.getByRole('img', { name: 'Test User' });
    expect(el.className).toContain('custom-class');
  });
});

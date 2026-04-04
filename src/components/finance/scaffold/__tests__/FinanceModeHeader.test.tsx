import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/Button';
import { FinanceModeHeader } from '@/components/finance/scaffold/FinanceModeHeader';

describe('FinanceModeHeader', () => {
  it('renders title, eyebrow, meta and actions', () => {
    render(
      <FinanceModeHeader
        eyebrow="Configuração"
        title="Contas"
        meta={['3 contas', '1 principal']}
        actions={<Button>Nova conta</Button>}
      />,
    );

    expect(screen.getByText('Configuração')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contas' })).toBeInTheDocument();
    expect(screen.getByText('3 contas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova conta' })).toBeInTheDocument();
  });

  it('renders without meta badges when none are provided', () => {
    render(<FinanceModeHeader eyebrow="Atividade" title="Visão Geral" />);

    expect(screen.getByRole('heading', { name: 'Visão Geral' })).toBeInTheDocument();
    expect(screen.queryByText('3 contas')).not.toBeInTheDocument();
  });
});
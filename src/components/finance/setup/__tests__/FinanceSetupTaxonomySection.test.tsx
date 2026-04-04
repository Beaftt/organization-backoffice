import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FinanceSetupTaxonomySection } from '@/components/finance/setup/FinanceSetupTaxonomySection';
import {
  financeText,
  sampleCategory,
  sampleIncomeCategory,
  sampleTag,
} from '@/components/finance/setup/__tests__/finance-test-data';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: { finance: financeText, modules: { finance: 'Financeiro' } },
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('FinanceSetupTaxonomySection', () => {
  it('renders taxonomy groups and labels', () => {
    render(
      <FinanceSetupTaxonomySection
        expenseCategories={[sampleCategory]}
        incomeCategories={[sampleIncomeCategory]}
        tags={[sampleTag]}
        onAddExpenseCategory={vi.fn()}
        onAddIncomeCategory={vi.fn()}
        onAddTag={vi.fn()}
        onDeleteCategory={vi.fn()}
        onDeleteTag={vi.fn()}
        onEditCategory={vi.fn()}
        onEditTag={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Categorias e tags' })).toBeInTheDocument();
    expect(screen.getByText('Moradia')).toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.getByText('Casa')).toBeInTheDocument();
  });

  it('shows empty states when lists are empty', () => {
    render(
      <FinanceSetupTaxonomySection
        expenseCategories={[]}
        incomeCategories={[]}
        tags={[]}
        onAddExpenseCategory={vi.fn()}
        onAddIncomeCategory={vi.fn()}
        onAddTag={vi.fn()}
        onDeleteCategory={vi.fn()}
        onDeleteTag={vi.fn()}
        onEditCategory={vi.fn()}
        onEditTag={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Nada por aqui')).toHaveLength(3);
  });

  it('calls list actions when buttons are clicked', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    const onEditTag = vi.fn();
    const onDeleteTag = vi.fn();

    render(
      <FinanceSetupTaxonomySection
        expenseCategories={[sampleCategory]}
        incomeCategories={[sampleIncomeCategory]}
        tags={[sampleTag]}
        onAddExpenseCategory={vi.fn()}
        onAddIncomeCategory={vi.fn()}
        onAddTag={onAddTag}
        onDeleteCategory={vi.fn()}
        onDeleteTag={onDeleteTag}
        onEditCategory={vi.fn()}
        onEditTag={onEditTag}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: /nova tag/i })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Editar' }).at(-1)!);
    await user.click(screen.getAllByRole('button', { name: 'Excluir' }).at(-1)!);

    expect(onAddTag).toHaveBeenCalledTimes(1);
    expect(onEditTag).toHaveBeenCalledWith(sampleTag);
    expect(onDeleteTag).toHaveBeenCalledWith(sampleTag);
  });
});
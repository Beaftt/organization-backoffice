'use client';

import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceCategory, FinanceTag } from '@/lib/api/finance';

type TaxonomyListCardProps<Item extends { id: string; name: string }> = {
  title: string;
  description: string;
  items: Item[];
  addLabel: string;
  emptyLabel: string;
  onAdd: () => void;
  onDelete: (item: Item) => void;
  onEdit: (item: Item) => void;
};

function TaxonomyListCard<Item extends { id: string; name: string }>({
  title,
  description,
  items,
  addLabel,
  emptyLabel,
  onAdd,
  onDelete,
  onEdit,
}: TaxonomyListCardProps<Item>) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border [border-color:var(--border)] bg-[var(--surface-muted)]/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground)]">{title}</h4>
          <p className="mt-1 text-xs text-[var(--foreground)]/55">{description}</p>
        </div>
        <Button variant="ghost" onClick={onAdd}>
          + {addLabel}
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed [border-color:var(--border)] px-3 py-4 text-xs text-[var(--foreground)]/55">
            {emptyLabel}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5"
            >
              <span className="text-sm text-[var(--foreground)]">{item.name}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onEdit(item)}>
                  {t.finance.editAction}
                </Button>
                <Button variant="ghost" onClick={() => onDelete(item)}>
                  {t.finance.deleteAction}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

type FinanceSetupTaxonomySectionProps = {
  expenseCategories: FinanceCategory[];
  incomeCategories: FinanceCategory[];
  tags: FinanceTag[];
  onAddExpenseCategory: () => void;
  onAddIncomeCategory: () => void;
  onAddTag: () => void;
  onDeleteCategory: (category: FinanceCategory) => void;
  onDeleteTag: (tag: FinanceTag) => void;
  onEditCategory: (category: FinanceCategory) => void;
  onEditTag: (tag: FinanceTag) => void;
};

export function FinanceSetupTaxonomySection({
  expenseCategories,
  incomeCategories,
  tags,
  onAddExpenseCategory,
  onAddIncomeCategory,
  onAddTag,
  onDeleteCategory,
  onDeleteTag,
  onEditCategory,
  onEditTag,
}: FinanceSetupTaxonomySectionProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const eyebrow = isPt ? 'Rótulos' : 'Labels';
  const description = isPt
    ? 'Defina categorias e tags que deixam captura, revisão e Insights mais claros.'
    : 'Set categories and tags that keep capture, review, and Insights clear.';
  const incomeDescription = isPt
    ? 'Entradas como salário, reembolso e vendas.'
    : 'Money in like salary, refunds, and sales.';
  const expenseDescription = isPt
    ? 'Saídas como moradia, mercado, transporte e afins.'
    : 'Money out like housing, groceries, transport, and similar.';
  const tagDescription = isPt
    ? 'Rótulos curtos para lembrar contexto rápido.'
    : 'Short labels for quick context.';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
          {t.finance.typesLabel ?? 'Categories and tags'}
        </h3>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          {description}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <TaxonomyListCard
          title={t.finance.groupIncome ?? 'Income'}
          description={incomeDescription}
          items={incomeCategories}
          addLabel={t.finance.newType ?? 'Category'}
          emptyLabel={t.finance.empty ?? 'No categories yet.'}
          onAdd={onAddIncomeCategory}
          onDelete={onDeleteCategory}
          onEdit={onEditCategory}
        />
        <TaxonomyListCard
          title={t.finance.groupExpense ?? 'Expense'}
          description={expenseDescription}
          items={expenseCategories}
          addLabel={t.finance.newType ?? 'Category'}
          emptyLabel={t.finance.empty ?? 'No categories yet.'}
          onAdd={onAddExpenseCategory}
          onDelete={onDeleteCategory}
          onEdit={onEditCategory}
        />
        <TaxonomyListCard
          title={t.finance.tagsLabel ?? 'Tags'}
          description={tagDescription}
          items={tags}
          addLabel={t.finance.addTagAction ?? 'Tag'}
          emptyLabel={t.finance.empty ?? 'No tags yet.'}
          onAdd={onAddTag}
          onDelete={onDeleteTag}
          onEdit={onEditTag}
        />
      </div>
    </div>
  );
}
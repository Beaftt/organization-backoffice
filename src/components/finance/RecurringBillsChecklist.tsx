'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency, formatDateShort } from '@/lib/utils/currency';
import type { FinanceRecurring, FinanceCategory } from '@/lib/api/finance';

interface RecurringBillItemProps {
  item: FinanceRecurring;
  category?: FinanceCategory;
  isPaid: boolean;
  disabled?: boolean;
  onToggle: (paid: boolean) => void;
}

function RecurringBillItem({ item, category, isPaid, disabled, onToggle }: RecurringBillItemProps) {
  const { t } = useLanguage();
  const intervalLabel =
    item.frequency === 'WEEKLY'
      ? (t.finance.cadenceWeekly ?? 'Semanal')
      : item.frequency === 'YEARLY'
        ? (t.finance.cadenceYearly ?? 'Anual')
        : (t.finance.cadenceMonthly ?? 'Mensal');

  return (
    <div
      className={`list-item-animate flex items-center justify-between gap-3 rounded-2xl border [border-color:var(--border)] px-4 py-3 transition-opacity ${isPaid ? 'opacity-60' : ''}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={isPaid}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 shrink-0 cursor-pointer rounded accent-[var(--sidebar)]"
          aria-label={`Marcar ${item.title} como pago`}
        />
        <div className="min-w-0">
          <p
            className={`text-sm font-semibold text-[var(--foreground)] ${isPaid ? 'line-through' : ''}`}
          >
            {item.title}
          </p>
          <p className="text-xs text-[var(--foreground)]/50">
            {category?.name ?? t.finance.tagsEmpty} ·{' '}
            {formatDateShort(item.nextDue)} · {intervalLabel}
          </p>
        </div>
      </div>
      <p
        className={`shrink-0 text-sm font-bold ${isPaid ? 'line-through text-[var(--foreground)]/40' : 'text-[var(--expense)]'}`}
      >
        {formatCurrency(item.amount, item.currency ?? 'BRL')}
      </p>
    </div>
  );
}

interface RecurringBillsChecklistProps {
  recurring: FinanceRecurring[];
  categories: FinanceCategory[];
  paidIds: Set<string>;
  disabled?: boolean;
  onToggle: (item: FinanceRecurring, paid: boolean) => void;
  onAdd: () => void;
}

export function RecurringBillsChecklist({
  recurring,
  categories,
  paidIds,
  disabled,
  onToggle,
  onAdd,
}: RecurringBillsChecklistProps) {
  const { t } = useLanguage();
  const paidCount = recurring.filter((item) => paidIds.has(item.id)).length;
  const total = recurring.length;
  const allPaid = paidCount === total && total > 0;
  const progressColor = allPaid ? 'text-[var(--income)]' : paidCount > 0 ? 'text-amber-500' : 'text-[var(--foreground)]/50';

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/50">
          {t.finance.recurringTitle}
        </p>
        {total > 0 ? (
          <span className={`text-xs font-semibold ${progressColor}`}>
            {(t.finance.recurringProgress ?? '{paid}/{total} pagas')
              .replace('{paid}', String(paidCount))
              .replace('{total}', String(total))}
          </span>
        ) : null}
      </div>
      {recurring.length === 0 ? (
        <div className="rounded-2xl border border-dashed [border-color:var(--border)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--foreground)]/50">
            {t.finance.recurringEmptyHint ?? t.finance.empty}
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-2 text-sm font-semibold text-[var(--sidebar)] hover:underline"
          >
            + {t.finance.recurringTitle} →
          </button>
        </div>
      ) : (
        recurring.map((item) => {
          const category = categories.find((c) => c.id === item.categoryId);
          return (
            <RecurringBillItem
              key={item.id}
              item={item}
              category={category}
              isPaid={paidIds.has(item.id)}
              disabled={disabled}
              onToggle={(paid) => onToggle(item, paid)}
            />
          );
        })
      )}
    </div>
  );
}

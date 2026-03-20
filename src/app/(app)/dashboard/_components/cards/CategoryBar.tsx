import type { DashboardExpenseCategory } from '../../types';

interface CategoryBarProps {
  category: DashboardExpenseCategory;
  formatValue: (v: number) => string;
}

export function CategoryBar({ category, formatValue }: CategoryBarProps) {
  const widthPct = Math.min(100, Math.max(0, category.percentage));

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--foreground)]">{category.name}</span>
        <span className="font-semibold text-[var(--expense)]">
          {formatValue(category.amount)}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]"
        role="progressbar"
        aria-valuenow={widthPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--expense)] transition-all duration-500"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

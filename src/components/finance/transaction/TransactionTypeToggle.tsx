'use client';

export type TransactionEffectiveType = 'INCOME' | 'EXPENSE' | 'INVEST';

interface TransactionTypeToggleProps {
  value: TransactionEffectiveType;
  onChange: (value: TransactionEffectiveType) => void;
  incomeLabel: string;
  expenseLabel: string;
  investLabel: string;
}

const TYPE_CONFIG: Record<
  TransactionEffectiveType,
  { active: string; idle: string; label: (labels: { income: string; expense: string; invest: string }) => string }
> = {
  INCOME: {
    active: 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700',
    idle: 'text-[var(--foreground)]/50 border-[var(--border)] hover:bg-[var(--surface-muted)]',
    label: (l) => l.income,
  },
  EXPENSE: {
    active: 'bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 dark:border-red-700',
    idle: 'text-[var(--foreground)]/50 border-[var(--border)] hover:bg-[var(--surface-muted)]',
    label: (l) => l.expense,
  },
  INVEST: {
    active: 'bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-700',
    idle: 'text-[var(--foreground)]/50 border-[var(--border)] hover:bg-[var(--surface-muted)]',
    label: (l) => l.invest,
  },
};

export function TransactionTypeToggle({
  value,
  onChange,
  incomeLabel,
  expenseLabel,
  investLabel,
}: TransactionTypeToggleProps) {
  const labels = { income: incomeLabel, expense: expenseLabel, invest: investLabel };

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Transaction type">
      {(['INCOME', 'EXPENSE', 'INVEST'] as TransactionEffectiveType[]).map((type) => {
        const cfg = TYPE_CONFIG[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={value === type}
            className={`rounded-xl border py-2 text-sm font-semibold transition-all ${
              value === type ? cfg.active : cfg.idle
            }`}
          >
            {cfg.label(labels)}
          </button>
        );
      })}
    </div>
  );
}

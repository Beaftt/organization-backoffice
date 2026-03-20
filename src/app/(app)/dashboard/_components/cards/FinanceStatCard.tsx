import { Skeleton } from '@/components/ui/Skeleton';

interface FinanceStatCardProps {
  label: string;
  value: number;
  variant: 'income' | 'expense' | 'net';
  isLoading: boolean;
  formatValue: (v: number) => string;
}

export function FinanceStatCard({
  label,
  value,
  variant,
  isLoading,
  formatValue,
}: FinanceStatCardProps) {
  const colorClass =
    variant === 'income'
      ? 'text-[var(--income)]'
      : variant === 'expense'
        ? 'text-[var(--expense)]'
        : value >= 0
          ? 'text-[var(--income)]'
          : 'text-[var(--expense)]';

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--foreground)]/50">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-28" />
      ) : (
        <p className={`text-xl font-bold ${colorClass}`}>{formatValue(value)}</p>
      )}
    </div>
  );
}

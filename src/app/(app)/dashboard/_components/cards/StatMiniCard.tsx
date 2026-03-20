import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface StatMiniCardProps {
  label: string;
  value: string | number | null;
  subtitle?: string;
  isLoading?: boolean;
}

export function StatMiniCard({
  label,
  value,
  subtitle,
  isLoading = false,
}: StatMiniCardProps) {
  return (
    <Card className="flex flex-col gap-1.5 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--foreground)]/50">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <p className="truncate text-xl font-bold text-[var(--foreground)]">
          {value !== null && value !== undefined ? value : '—'}
        </p>
      )}
      {subtitle && (
        <p className="truncate text-xs text-[var(--foreground)]/40">{subtitle}</p>
      )}
    </Card>
  );
}

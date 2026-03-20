'use client';

type Props = {
  count: number;
  onShowLowStock: () => void;
  labels: {
    belowMinStock: string;
    viewAll: string;
    items: string;
  };
};

export function LowStockAlertBar({ count, onShowLowStock, labels }: Props) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-5 py-2">
      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
      <span className="text-xs text-amber-600">
        <strong>
          {count} {labels.items}
        </strong>{' '}
        {labels.belowMinStock}
      </span>
      <button
        type="button"
        onClick={onShowLowStock}
        className="ml-auto bg-transparent text-xs font-semibold text-amber-600 transition-colors hover:text-amber-500"
      >
        {labels.viewAll} ⚠
      </button>
    </div>
  );
}

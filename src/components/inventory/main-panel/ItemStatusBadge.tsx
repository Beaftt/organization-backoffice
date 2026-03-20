'use client';

import type { StockStatus } from '@/components/inventory/types';

type Props = {
  status: StockStatus;
  labels: { ok: string; low: string; empty: string };
};

const STATUS_CLASSES: Record<StockStatus, string> = {
  ok: 'bg-emerald-100 text-emerald-700',
  low: 'bg-amber-100 text-amber-700',
  empty: 'bg-rose-100 text-rose-700',
};

export function ItemStatusBadge({ status, labels }: Props) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-px text-[10px] font-bold ${STATUS_CLASSES[status]}`}>
      {labels[status]}
    </span>
  );
}

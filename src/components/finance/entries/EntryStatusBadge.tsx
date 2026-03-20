'use client';

import { useLanguage } from '@/lib/i18n/language-context';

type TransactionStatus = 'PAID' | 'PENDING';

const STATUS_STYLES: Record<TransactionStatus, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400',
  PENDING: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-800 dark:text-amber-400',
};

interface EntryStatusBadgeProps {
  status: TransactionStatus;
}

export function EntryStatusBadge({ status }: EntryStatusBadgeProps) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status]}`}
    >
      {status === 'PAID' ? t.finance.statusPaid : t.finance.statusPending}
    </span>
  );
}

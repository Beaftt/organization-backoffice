'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { FinanceOverlayShell } from '@/components/finance/drawers/FinanceOverlayShell';
import type { FinanceTransaction } from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';
import { getLocaleForLanguage } from '@/lib/i18n/locale';
import { formatCurrency, formatDateShort } from '@/lib/utils/currency';

type FinanceInsightsEvidenceDrawerProps = {
  deskHref: string;
  description: string;
  open: boolean;
  title: string;
  transactions: FinanceTransaction[];
  onClose: () => void;
};

export function FinanceInsightsEvidenceDrawer({
  deskHref,
  description,
  open,
  title,
  transactions,
  onClose,
}: FinanceInsightsEvidenceDrawerProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const locale = getLocaleForLanguage(language);
  const openDeskLabel = isPt ? 'Abrir no painel' : 'Open in Desk';
  const emptyLabel = isPt ? 'Nenhum item para este recorte.' : 'No entries for this cut.';

  return (
    <FinanceOverlayShell
      open={open}
      title={title}
      description={description}
      variant="drawer"
      size="md"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t.finance.close}
          </Button>
          <Link href={deskHref}>
            <Button>{openDeskLabel}</Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-3">
        {transactions.length === 0 ? (
          <p className="rounded-[24px] border border-dashed [border-color:var(--border)] px-4 py-6 text-sm text-[var(--foreground)]/58">
            {emptyLabel}
          </p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)]/45 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {transaction.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground)]/55">
                    {formatDateShort(transaction.occurredAt, locale)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {formatCurrency(
                    transaction.amount,
                    transaction.currency ?? 'BRL',
                    locale,
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </FinanceOverlayShell>
  );
}
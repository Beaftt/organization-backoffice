'use client';

import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';
import type { FinancePaymentMethod } from '@/lib/api/finance';

interface InvestmentsSectionProps {
  investMethods: FinancePaymentMethod[];
  isSaving?: boolean;
  showAddAction?: boolean;
  onAdd: () => void;
  onEdit: (method: FinancePaymentMethod) => void;
  onDelete: (method: FinancePaymentMethod) => void;
  onDeposit: (method: FinancePaymentMethod) => void;
  onWithdraw: (method: FinancePaymentMethod) => void;
  onTransfer?: (method: FinancePaymentMethod) => void;
}

export function InvestmentsSection({
  investMethods,
  isSaving,
  showAddAction = true,
  onAdd,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  onTransfer,
}: InvestmentsSectionProps) {
  const { t } = useLanguage();
  const total = investMethods.reduce((sum, m) => sum + (m.balance ?? 0), 0);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/50">
          {t.finance.investmentsTitle}
        </p>
        {showAddAction ? (
          <Button variant="ghost" onClick={onAdd}>
            + {t.finance.paymentMethodAdd ?? 'Adicionar'}
          </Button>
        ) : null}
      </div>

      {investMethods.length === 0 ? (
        <div className="rounded-2xl border border-dashed [border-color:var(--border)] px-4 py-5">
          <p className="text-sm text-[var(--foreground)]/55">
            {t.finance.cardsEmpty ?? t.finance.empty}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border [border-color:var(--border)]">
          {investMethods.map((method) => (
            <div
              key={method.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b [border-color:var(--border)] px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {method.name}
                  {method.isPrimary ? ' ⭐' : ''}
                </p>
                <p className="text-xs text-[var(--foreground)]/50">
                  {t.finance.balanceLabel ?? 'Saldo'}:{' '}
                  <span className="font-bold text-[var(--sidebar)]">
                    {formatCurrency(method.balance ?? 0, method.currency ?? 'BRL')}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDeposit(method)}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:border-emerald-800 dark:text-emerald-400"
                >
                  {t.finance.investDeposit ?? 'Depositar'}
                </button>
                <button
                  type="button"
                  onClick={() => onWithdraw(method)}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/20 dark:border-red-800 dark:text-red-400"
                >
                  {t.finance.investWithdraw ?? 'Resgatar'}
                </button>
                {onTransfer ? (
                  <button
                    type="button"
                    onClick={() => onTransfer(method)}
                    className="inline-flex items-center justify-center rounded-full border [border-color:var(--border)] bg-[var(--surface-muted)] px-4 py-1.5 text-xs font-semibold text-[var(--foreground)]/75 transition-colors hover:bg-[var(--surface)]"
                  >
                    {t.finance.transferLabel ?? 'Transferir'}
                  </button>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => onEdit(method)}
                  aria-label={t.finance.editAction}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onDelete(method)}
                  disabled={isSaving}
                  aria-label={t.finance.deleteAction}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between bg-[var(--surface-muted)] px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]/50">
              {t.finance.paymentMethodsTotal ?? 'Total'}
            </span>
            <span className="text-sm font-bold text-[var(--sidebar)]">
              {formatCurrency(total, 'BRL')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

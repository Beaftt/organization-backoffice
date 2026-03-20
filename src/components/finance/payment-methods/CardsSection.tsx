'use client';

import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';
import type { FinancePaymentMethod, FinanceCardBill } from '@/lib/api/finance';

const typeLabel = (type: FinancePaymentMethod['type'], t: Record<string, string>) => {
  if (type === 'CREDIT') return t.paymentMethodCredit ?? 'Crédito';
  if (type === 'DEBIT') return t.paymentMethodDebit ?? 'Débito';
  if (type === 'PIX') return t.paymentMethodPix ?? 'Pix';
  return type;
};

interface CardsSectionProps {
  cardMethods: FinancePaymentMethod[];
  cardBills: Record<string, FinanceCardBill>;
  isSaving?: boolean;
  onAdd: () => void;
  onEdit: (method: FinancePaymentMethod) => void;
  onDelete: (method: FinancePaymentMethod) => void;
  onPayBill: (method: FinancePaymentMethod) => void;
  onViewDetails: (method: FinancePaymentMethod) => void;
}

export function CardsSection({
  cardMethods,
  cardBills,
  isSaving,
  onAdd,
  onEdit,
  onDelete,
  onPayBill,
  onViewDetails,
}: CardsSectionProps) {
  const { t } = useLanguage();
  const creditCards = cardMethods.filter((m) => m.type === 'CREDIT');
  const otherCards = cardMethods.filter((m) => m.type !== 'CREDIT');
  const creditTotal = creditCards.reduce(
    (sum, m) => sum + (cardBills[m.id]?.remainingAmount ?? 0),
    0,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessing t.finance as any for dynamic lookup
  const ft = t.finance as any;

  if (cardMethods.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed [border-color:var(--border)] px-6 py-10 text-center">
        <p className="text-sm font-semibold text-[var(--foreground)]/60">
          {t.finance.cardsEmpty ?? t.finance.empty}
        </p>
        <p className="mt-1 text-xs text-[var(--foreground)]/40">
          {t.finance.cardsEmptyHint ?? 'Adicione um cartão para rastrear gastos automaticamente.'}
        </p>
        <Button className="mt-4" onClick={onAdd}>
          {t.finance.paymentMethodAdd ?? 'Adicionar'}
        </Button>
      </div>
    );
  }

  const renderMethod = (method: FinancePaymentMethod) => {
    const bill = cardBills[method.id];
    return (
      <div
        key={method.id}
        className="flex flex-wrap items-center justify-between gap-3 border-b [border-color:var(--border)] px-4 py-3 last:border-b-0"
      >
        <button
          type="button"
          onClick={() => onViewDetails(method)}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-xs font-bold text-[var(--sidebar)]">
            {method.type.slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {method.name} {method.isPrimary ? '⭐' : ''}
            </p>
            <p className="text-xs text-[var(--foreground)]/50">
              {typeLabel(method.type, ft)} · {method.currency ?? 'BRL'}
              {method.type === 'CREDIT' && bill ? (
                <>
                  {' '}·{' '}
                  <span className="text-[var(--expense)]">
                    {t.finance.billRemaining ?? 'Fatura'}: {formatCurrency(bill.remainingAmount, method.currency ?? 'BRL')}
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {method.type === 'CREDIT' ? (
            <Button variant="secondary" onClick={() => onPayBill(method)} className="text-xs">
              {t.finance.billPay ?? 'Pagar'}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => onEdit(method)} aria-label={t.finance.editAction}>
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
    );
  };

  return (
    <div className="grid gap-6">
      {creditCards.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/50">
              {t.finance.paymentMethodCredit ?? 'Cartões de Crédito'} ({creditCards.length})
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border [border-color:var(--border)]">
            {creditCards.map(renderMethod)}
            <div className="flex items-center justify-between bg-[var(--surface-muted)] px-4 py-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]/50">
                {t.finance.paymentMethodsTotal ?? 'Total'}
              </span>
              <span className="text-sm font-bold text-[var(--expense)]">
                -{formatCurrency(creditTotal, 'BRL')}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {otherCards.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/50">
            {t.finance.paymentMethodDebit ?? 'Outros Métodos'} ({otherCards.length})
          </p>
          <div className="overflow-hidden rounded-2xl border [border-color:var(--border)]">
            {otherCards.map(renderMethod)}
          </div>
        </div>
      ) : null}

      <Button variant="secondary" onClick={onAdd}>
        + {t.finance.paymentMethodAdd ?? 'Adicionar método'}
      </Button>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceAccount, FinancePaymentMethod } from '@/lib/api/finance';

import { FinanceOverlayShell } from '@/components/finance/drawers/FinanceOverlayShell';

import { formatCurrencyDigits } from './setup-form-utils';
import type { InvestmentActionState } from './setup-state-model';

type FinanceInvestmentOverlayProps = {
  open: boolean;
  accounts: FinanceAccount[];
  investments: FinancePaymentMethod[];
  isSaving: boolean;
  state: InvestmentActionState;
  onBack: () => void;
  onChange: (patch: Partial<InvestmentActionState>) => void;
  onClose: () => void;
  onContinue: () => void;
  onSubmit: () => void;
};

const modeLabel = {
  deposit: 'Aplicar',
  transfer: 'Mover',
  withdraw: 'Resgatar',
};

export function FinanceInvestmentOverlay({
  open,
  accounts,
  investments,
  isSaving,
  state,
  onBack,
  onChange,
  onClose,
  onContinue,
  onSubmit,
}: FinanceInvestmentOverlayProps) {
  const { language, t } = useLanguage();
  const title = state.mode ? `${modeLabel[state.mode]} investimento` : 'Ação em investimento';
  const currentInvestment = investments.find((item) => item.id === state.targetInvestmentId);
  const fromInvestment = investments.find((item) => item.id === state.fromInvestmentId);
  const toInvestment = investments.find((item) => item.id === state.toInvestmentId);
  const account = accounts.find((item) => item.id === state.accountId);
  const backLabel = t.finance.backAction ?? (language === 'pt' ? 'Voltar' : 'Back');
  const continueLabel = t.finance.continueAction ?? (language === 'pt' ? 'Continuar' : 'Continue');
  const investmentLabel = language === 'pt' ? 'Investimento' : 'Investment';
  const sourceLabel = language === 'pt' ? 'Origem' : 'Source';
  const destinationLabel = language === 'pt' ? 'Destino' : 'Destination';
  const reviewLabel = language === 'pt' ? 'Revisão' : 'Review';
  const movementLabel = language === 'pt' ? 'Movimento' : 'Mode';

  return (
    <FinanceOverlayShell
      open={open}
      title={title}
      size="md"
      onClose={onClose}
      footer={
        <>
          {state.error ? <p className="mb-3 text-sm text-[var(--expense)]">{state.error}</p> : null}
          <div className="flex flex-wrap justify-end gap-2">
            {state.step === 2 ? (
              <Button variant="secondary" onClick={onBack} disabled={isSaving}>
                {backLabel}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              {t.finance.cancel}
            </Button>
            <Button onClick={state.step === 1 ? onContinue : onSubmit} disabled={isSaving}>
              {state.step === 1 ? continueLabel : isSaving ? t.finance.saving : t.finance.save}
            </Button>
          </div>
        </>
      }
    >
      {state.step === 1 ? (
        <div className="grid gap-4">
          {state.mode === 'transfer' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                Origem
                <select value={state.fromInvestmentId} onChange={(event) => onChange({ fromInvestmentId: event.target.value })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
                  <option value="">{t.finance.none}</option>
                  {investments.map((investment) => (
                    <option key={investment.id} value={investment.id}>{investment.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                Destino
                <select value={state.toInvestmentId} onChange={(event) => onChange({ toInvestmentId: event.target.value })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
                  <option value="">{t.finance.none}</option>
                  {investments.map((investment) => (
                    <option key={investment.id} value={investment.id}>{investment.name}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                {investmentLabel}
                <select value={state.targetInvestmentId} onChange={(event) => onChange({ targetInvestmentId: event.target.value })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
                  <option value="">{t.finance.none}</option>
                  {investments.map((investment) => (
                    <option key={investment.id} value={investment.id}>{investment.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                {t.finance.accountLabel}
                <select value={state.accountId} onChange={(event) => onChange({ accountId: event.target.value })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
                  <option value="">{t.finance.none}</option>
                  {accounts.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <Input label={t.finance.amountLabel} value={state.amount} onChange={(event) => onChange({ amount: event.target.value })} />
          {state.mode !== 'transfer' ? (
            <Input label={t.finance.dateLabel} type="date" value={state.occurredAt} onChange={(event) => onChange({ occurredAt: event.target.value })} />
          ) : null}
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border [border-color:var(--border)] bg-[var(--surface-muted)]/35 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">{reviewLabel}</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Confirme antes de mover o dinheiro</h3>
          </div>
          <dl className="grid gap-3 text-sm text-[var(--foreground)]/70 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--foreground)]/45">{movementLabel}</dt>
              <dd className="mt-1 font-semibold text-[var(--foreground)]">{state.mode ? modeLabel[state.mode] : '-'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--foreground)]/45">{t.finance.amountLabel}</dt>
              <dd className="mt-1 font-semibold text-[var(--foreground)]">{formatCurrencyDigits(state.amount.replace(/\D/g, ''), 'BRL') || 'R$ 0,00'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--foreground)]/45">{sourceLabel}</dt>
              <dd className="mt-1 font-semibold text-[var(--foreground)]">{fromInvestment?.name ?? currentInvestment?.name ?? account?.name ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--foreground)]/45">{destinationLabel}</dt>
              <dd className="mt-1 font-semibold text-[var(--foreground)]">{toInvestment?.name ?? currentInvestment?.name ?? '-'}</dd>
            </div>
          </dl>
        </div>
      )}
    </FinanceOverlayShell>
  );
}
'use client';

import { Input } from '@/components/ui/Input';
import type { FinanceTag } from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';

import { TransactionTagSelector } from './TransactionTagSelector';
import type {
  FinanceComposerStepKey,
  FinanceTransactionComposerForm,
} from './transaction-composer-model';

type FinanceTransactionOptionalStepProps = {
  currentStep: FinanceComposerStepKey;
  form: FinanceTransactionComposerForm;
  tagDraft: string;
  tags: FinanceTag[];
  onFieldChange: <K extends keyof FinanceTransactionComposerForm>(
    field: K,
    value: FinanceTransactionComposerForm[K],
  ) => void;
  onTagAdd: () => void;
  onTagDraftChange: (value: string) => void;
  onTagSuggest: (name: string) => void;
  onTagToggle: (tagId: string) => void;
};

export function FinanceTransactionOptionalStep({
  currentStep,
  form,
  tagDraft,
  tags,
  onFieldChange,
  onTagAdd,
  onTagDraftChange,
  onTagSuggest,
  onTagToggle,
}: FinanceTransactionOptionalStepProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const suggestedTags = isPt ? ['Casa', 'Mercado', 'Trabalho'] : ['Home', 'Groceries', 'Work'];

  if (currentStep === 'installments') {
    return (
      <div className="grid gap-5">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4 text-sm text-[var(--foreground)]/72">
          {isPt
            ? 'No crédito, isso só vira uma sequência por alguns meses. Defina por quanto tempo aparece.'
            : 'On credit, this just becomes a sequence for a few months. Set how long it appears.'}
        </div>

        <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
          <span className="font-medium text-[var(--foreground)]/90">{isPt ? 'Quantos meses?' : 'How many months?'}</span>
          <select
            value={form.installments}
            onChange={(event) => onFieldChange('installments', Number(event.target.value) as FinanceTransactionComposerForm['installments'])}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            {Array.from({ length: 11 }, (_, index) => index + 2).map((installment) => (
              <option key={installment} value={installment}>
                {installment}x
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--foreground)]/72">
          <input
            type="checkbox"
            checked={form.isInstallmentValue}
            onChange={(event) => onFieldChange('isInstallmentValue', event.target.checked)}
            className="h-4 w-4 rounded accent-[var(--sidebar)]"
          />
          {isPt ? 'O valor informado já é o de cada mês.' : 'The amount already matches each month.'}
        </label>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
        <span className="font-medium text-[var(--foreground)]/90">{t.finance.descriptionLabel}</span>
        <textarea
          value={form.description}
          onChange={(event) => onFieldChange('description', event.target.value)}
          rows={4}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
          placeholder={isPt ? 'Observação curta ou contexto extra.' : 'Short note or extra context.'}
        />
      </label>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-[var(--foreground)]/90">{t.finance.tagsLabel}</p>
        <TransactionTagSelector
          tags={tags}
          selectedIds={form.tagIds}
          draft={tagDraft}
          addLabel={t.finance.addTagAction ?? (isPt ? 'Adicionar' : 'Add')}
          placeholderLabel={isPt ? 'Nova tag' : 'New tag'}
          emptyLabel={isPt ? 'Use tags curtas para lembrar depois.' : 'Use short tags for quick context.'}
          suggested={suggestedTags}
          onToggle={onTagToggle}
          onDraftChange={onTagDraftChange}
          onAdd={onTagAdd}
          onSuggest={onTagSuggest}
        />
      </div>

      {form.intent !== 'credit' && form.intent !== 'transfer' ? (
        <div className="grid gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4">
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]/72">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(event) => {
                onFieldChange('isRecurring', event.target.checked);
                if (!event.target.checked) {
                  onFieldChange('isSubscription', false);
                  onFieldChange('addToCalendar', false);
                }
              }}
              className="h-4 w-4 rounded accent-[var(--sidebar)]"
            />
            {isPt ? 'Transformar em cobrança programada' : 'Turn into a scheduled charge'}
          </label>

          {form.isRecurring ? (
            <>
              <label className="flex items-start gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]/72">
                <input
                  aria-label={t.finance.subscriptionToggleLabel ?? (isPt ? 'É uma assinatura?' : 'Is this a subscription?')}
                  type="checkbox"
                  checked={form.isSubscription}
                  onChange={(event) => onFieldChange('isSubscription', event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--sidebar)]"
                />
                <span className="grid gap-1">
                  <span className="font-medium text-[var(--foreground)]/90">
                    {t.finance.subscriptionToggleLabel ?? (isPt ? 'É uma assinatura?' : 'Is this a subscription?')}
                  </span>
                  <span className="text-xs text-[var(--foreground)]/58">
                    {t.finance.subscriptionToggleHint ?? (isPt ? 'Use isso para destacar serviços e plataformas recorrentes.' : 'Use this to highlight recurring services and platforms.')}
                  </span>
                </span>
              </label>

              <p className="text-sm leading-6 text-[var(--foreground)]/62">
                {isPt
                  ? 'Sem fim ela continua ativa. Com data ou quantidade definida, ela passa a ter término.'
                  : 'Without an end it stays active. With a date or count, it gets a clear finish.'}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                  <span className="font-medium text-[var(--foreground)]/90">{t.finance.recurrenceFrequencyLabel}</span>
                  <select
                    value={form.recurrenceFrequency}
                    onChange={(event) => onFieldChange('recurrenceFrequency', event.target.value as FinanceTransactionComposerForm['recurrenceFrequency'])}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
                  >
                    <option value="DAILY">{t.finance.cadenceDaily}</option>
                    <option value="WEEKLY">{t.finance.cadenceWeekly}</option>
                    <option value="MONTHLY">{t.finance.cadenceMonthly}</option>
                    <option value="SEMIANNUAL">{t.finance.cadenceSemiannual}</option>
                    <option value="YEARLY">{t.finance.cadenceYearly}</option>
                  </select>
                </label>

                {form.recurrenceFrequency !== 'SEMIANNUAL' ? (
                  <Input
                    label={t.finance.recurrenceIntervalLabel}
                    type="number"
                    min="1"
                    value={form.recurrenceInterval}
                    onChange={(event) => onFieldChange('recurrenceInterval', event.target.value)}
                  />
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                  <span className="font-medium text-[var(--foreground)]/90">{isPt ? 'Quando termina?' : 'When does it end?'}</span>
                  <select
                    value={form.programmedChargeEndMode}
                    onChange={(event) => {
                      const nextMode = event.target.value as FinanceTransactionComposerForm['programmedChargeEndMode'];
                      onFieldChange('programmedChargeEndMode', nextMode);
                      if (nextMode !== 'end-date') {
                        onFieldChange('recurrenceEndDate', '');
                      }
                      if (nextMode !== 'times') {
                        onFieldChange('programmedChargeCount', '');
                      }
                    }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
                  >
                    <option value="ongoing">{isPt ? 'Sem fim definido' : 'No end date'}</option>
                    <option value="end-date">{isPt ? 'Em uma data' : 'On a date'}</option>
                    <option value="times">{isPt ? 'Depois de algumas vezes' : 'After a number of times'}</option>
                  </select>
                </label>

                {form.programmedChargeEndMode === 'end-date' ? (
                  <Input
                    label={isPt ? 'Encerrar em' : 'End on'}
                    type="date"
                    value={form.recurrenceEndDate}
                    onChange={(event) => onFieldChange('recurrenceEndDate', event.target.value)}
                  />
                ) : form.programmedChargeEndMode === 'times' ? (
                  <Input
                    label={isPt ? 'Quantas vezes?' : 'How many times?'}
                    type="number"
                    min="2"
                    value={form.programmedChargeCount}
                    onChange={(event) => onFieldChange('programmedChargeCount', event.target.value)}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)]/58">
                    {isPt ? 'Ela continua ativa até você encerrar depois.' : 'It stays active until you end it later.'}
                  </div>
                )}

                <label className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]/72">
                  <input
                    type="checkbox"
                    checked={form.addToCalendar}
                    onChange={(event) => onFieldChange('addToCalendar', event.target.checked)}
                    className="h-4 w-4 rounded accent-[var(--sidebar)]"
                  />
                  {t.finance.addToCalendarLabel}
                </label>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
'use client';

import { useMemo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';
import { TransactionTagSelector } from './TransactionTagSelector';
import {
  formatCurrencyInput,
  getCreditPaymentMethods,
  getImmediateBehaviorOptions,
  getSelectableAccounts,
  parseCurrencyInput,
  type TransactionEditorForm,
  type TransactionEditorSection,
  type TransactionImmediateBehaviorKind,
  type TransactionRoute,
} from './transaction-editor-model';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTag,
  FinanceTransaction,
} from '@/lib/api/finance';

const SUGGESTED_TAGS = ['Mercado', 'Compras', 'Eventos'];

type MemberOption = {
  userId: string;
  label: string;
  photoUrl: string | null;
};

interface TransactionEditorPanelProps {
  open: boolean;
  editing: FinanceTransaction | null;
  form: TransactionEditorForm;
  error: string | null;
  isSaving: boolean;
  accounts: FinanceAccount[];
  paymentMethods: FinancePaymentMethod[];
  categories: FinanceCategory[];
  tags: FinanceTag[];
  members: MemberOption[];
  tagDraft: string;
  expandedSections: TransactionEditorSection[];
  onStart: () => void;
  onClose: () => void;
  onToggleSection: (section: TransactionEditorSection) => void;
  onGroupChange: (group: TransactionEditorForm['group']) => void;
  onRouteChange: (route: TransactionRoute) => void;
  onAccountChange: (accountId: string) => void;
  onImmediateBehaviorChange: (
    kind: TransactionImmediateBehaviorKind,
    paymentMethodId?: string,
  ) => void;
  onCreditMethodChange: (paymentMethodId: string) => void;
  onFieldChange: <K extends keyof TransactionEditorForm>(
    field: K,
    value: TransactionEditorForm[K],
  ) => void;
  onToggleTag: (tagId: string) => void;
  onTagDraftChange: (value: string) => void;
  onTagAdd: () => void;
  onTagSuggest: (name: string) => void;
  onToggleParticipant: (userId: string) => void;
  onSave: () => void;
}

export function TransactionEditorPanel({
  open,
  editing,
  form,
  error,
  isSaving,
  accounts,
  paymentMethods,
  categories,
  tags,
  members,
  tagDraft,
  expandedSections,
  onStart,
  onClose,
  onToggleSection,
  onGroupChange,
  onRouteChange,
  onAccountChange,
  onImmediateBehaviorChange,
  onCreditMethodChange,
  onFieldChange,
  onToggleTag,
  onTagDraftChange,
  onTagAdd,
  onTagSuggest,
  onToggleParticipant,
  onSave,
}: TransactionEditorPanelProps) {
  const { t } = useLanguage();
  const selectableAccounts = useMemo(() => getSelectableAccounts(accounts), [accounts]);
  const creditMethods = useMemo(
    () => getCreditPaymentMethods(paymentMethods),
    [paymentMethods],
  );
  const immediateOptions = useMemo(
    () =>
      getImmediateBehaviorOptions(
        form.accountId,
        paymentMethods,
        form.group,
        form.paymentMethodId,
      ),
    [form.accountId, form.group, form.paymentMethodId, paymentMethods],
  );
  const filteredCategories = useMemo(
    () => categories.filter((category) => category.group === form.group),
    [categories, form.group],
  );
  const amountPreview = parseCurrencyInput(form.amount);
  const routeLabel =
    form.route === 'CREDIT'
      ? t.finance.creditTitle ?? 'Cartao de credito'
      : form.immediateBehavior === 'BALANCE'
        ? 'Saldo da conta'
        : immediateOptions.find((option) => option.kind === form.immediateBehavior)?.label ??
          'Fluxo imediato';
  const statusLocked = form.route === 'CREDIT' && form.group === 'EXPENSE' && form.installments > 1;
  const showCreditRoute = form.group === 'EXPENSE' && creditMethods.length > 0;
  const canShowRecurring = form.route !== 'CREDIT';
  const isExpanded = (section: TransactionEditorSection) =>
    expandedSections.includes(section);

  if (!open) {
    return (
      <Card className="flex min-h-[164px] flex-col justify-between gap-4 border-dashed bg-[var(--surface-muted)]/35">
        <div className="grid gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
            {t.finance.tabsEntries ?? 'Lançamentos'}
          </p>
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            {t.finance.transactionWorkspaceTitle ?? 'Editor fixo de transações'}
          </h3>
          <p className="max-w-[34ch] text-sm leading-6 text-[var(--foreground)]/60">
            {t.finance.transactionWorkspaceEmpty ?? 'Selecione uma transação da lista ou inicie um novo lançamento para editar sem sair do contexto.'}
          </p>
        </div>
        <div className="flex justify-start">
          <Button onClick={onStart}>{t.finance.newTransaction}</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden"
      role="region"
      aria-label={editing ? t.finance.editAction : t.finance.newTransaction}
    >
      <div className="flex items-start justify-between gap-4 border-b [border-color:var(--border)] pb-4">
        <div className="grid gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
            {editing ? t.finance.editAction : t.finance.newTransaction}
          </p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {editing ? form.title || (t.finance.editAction ?? 'Editar') : t.finance.newTransaction}
          </h3>
          <p className="text-sm text-[var(--foreground)]/55">
            {t.finance.transactionWorkspaceHelper ?? 'O painel fica ancorado ao lado da lista para acelerar criacao, revisao e ajuste fino.'}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} aria-label={t.finance.close ?? 'Fechar'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        <section className="rounded-2xl border [border-color:var(--border)]">
          <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={isExpanded('core')} onClick={() => onToggleSection('core')}>
            <span className="text-sm font-semibold text-[var(--foreground)]">{t.finance.transactionSectionEssential ?? 'Base'}</span>
            <span className="text-xs text-[var(--foreground)]/45">{isExpanded('core') ? '−' : '+'}</span>
          </button>
          {isExpanded('core') ? (
            <div className="grid gap-4 border-t [border-color:var(--border)] px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {(['EXPENSE', 'INCOME'] as const).map((group) => (
                  <Button key={group} variant={form.group === group ? 'primary' : 'secondary'} onClick={() => onGroupChange(group)}>
                    {group === 'EXPENSE' ? t.finance.groupExpense : t.finance.groupIncome}
                  </Button>
                ))}
              </div>
              <Input label={t.finance.titleLabel} value={form.title} onChange={(event) => onFieldChange('title', event.target.value)} />
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                  <span className="font-medium text-[var(--foreground)]/90">{t.finance.amountLabel}</span>
                  <input inputMode="numeric" value={form.amount} onChange={(event) => onFieldChange('amount', formatCurrencyInput(event.target.value.replace(/\D/g, ''), form.currency))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400" />
                </label>
                <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                  <span className="font-medium text-[var(--foreground)]/90">&nbsp;</span>
                  <select value={form.currency} onChange={(event) => onFieldChange('currency', event.target.value as 'BRL' | 'USD')} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]">
                    <option value="BRL">BRL</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border [border-color:var(--border)]">
          <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={isExpanded('route')} onClick={() => onToggleSection('route')}>
            <span className="text-sm font-semibold text-[var(--foreground)]">{t.finance.transactionRouteTitle ?? 'Rota financeira'}</span>
            <span className="text-xs text-[var(--foreground)]/45">{isExpanded('route') ? '−' : '+'}</span>
          </button>
          {isExpanded('route') ? (
            <div className="grid gap-4 border-t [border-color:var(--border)] px-4 py-4">
              {showCreditRoute ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={form.route === 'IMMEDIATE' ? 'primary' : 'secondary'} onClick={() => onRouteChange('IMMEDIATE')}>Fluxo imediato</Button>
                  <Button variant={form.route === 'CREDIT' ? 'primary' : 'secondary'} onClick={() => onRouteChange('CREDIT')}>{t.finance.creditTitle ?? 'Credito'}</Button>
                </div>
              ) : null}

              {form.route === 'IMMEDIATE' ? (
                <>
                  <div className="grid gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{t.finance.accountLabel}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectableAccounts.map((account) => (
                        <Button key={account.id} variant={form.accountId === account.id ? 'primary' : 'secondary'} onClick={() => onAccountChange(account.id)}>{account.name}</Button>
                      ))}
                    </div>
                  </div>
                  {immediateOptions.length > 1 ? (
                    <div className="grid gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{t.finance.paymentBehaviorTitle ?? 'Comportamento do pagamento'}</p>
                      <div className="flex flex-wrap gap-2">
                        {immediateOptions.map((option) => (
                          <Button key={option.id} variant={form.immediateBehavior === option.kind && (option.paymentMethodId ?? '') === (form.paymentMethodId ?? '') ? 'primary' : 'secondary'} onClick={() => onImmediateBehaviorChange(option.kind, option.paymentMethodId)}>{option.label}</Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="grid gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{t.finance.creditTitle ?? 'Cartao de credito'}</p>
                  <div className="flex flex-wrap gap-2">
                    {creditMethods.map((paymentMethod) => (
                      <Button key={paymentMethod.id} variant={form.paymentMethodId === paymentMethod.id ? 'primary' : 'secondary'} onClick={() => onCreditMethodChange(paymentMethod.id)}>{paymentMethod.name}</Button>
                    ))}
                  </div>
                  <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                    <span className="font-medium text-[var(--foreground)]/90">{t.finance.installmentsLabel ?? 'Parcelas'}</span>
                    <select value={form.installments} onChange={(event) => onFieldChange('installments', Number(event.target.value))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]">
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((installment) => (
                        <option key={installment} value={installment}>{installment}x</option>
                      ))}
                    </select>
                  </label>
                  {form.installments > 1 ? (
                    <label className="flex items-center gap-2 text-sm text-[var(--foreground)]/75">
                      <input type="checkbox" checked={form.isInstallmentValue} onChange={(event) => onFieldChange('isInstallmentValue', event.target.checked)} />
                      {t.finance.installmentsIsPerValueLabel ?? 'Valor informado por parcela'}
                    </label>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border [border-color:var(--border)]">
          <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={isExpanded('schedule')} onClick={() => onToggleSection('schedule')}>
            <span className="text-sm font-semibold text-[var(--foreground)]">{t.finance.transactionSectionDetails ?? 'Calendario e classificacao'}</span>
            <span className="text-xs text-[var(--foreground)]/45">{isExpanded('schedule') ? '−' : '+'}</span>
          </button>
          {isExpanded('schedule') ? (
            <div className="grid gap-4 border-t [border-color:var(--border)] px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label={t.finance.dateLabel} type="date" value={form.occurredAt} onChange={(event) => onFieldChange('occurredAt', event.target.value)} />
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--foreground)]/90">{t.finance.statusLabel}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={form.status === 'PAID' ? 'primary' : 'secondary'} onClick={() => onFieldChange('status', 'PAID')} disabled={statusLocked}>{t.finance.statusPaid}</Button>
                    <Button variant={form.status === 'PENDING' ? 'primary' : 'secondary'} onClick={() => onFieldChange('status', 'PENDING')}>{t.finance.statusPending}</Button>
                  </div>
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                <span className="font-medium text-[var(--foreground)]/90">{t.finance.typeLabel}</span>
                <select value={form.categoryId} onChange={(event) => onFieldChange('categoryId', event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]">
                  <option value="">{t.finance.typeAll}</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              {canShowRecurring ? (
                <div className="grid gap-3 rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                  <label className="flex items-center gap-2 text-sm text-[var(--foreground)]/75">
                    <input type="checkbox" checked={form.isRecurring} onChange={(event) => onFieldChange('isRecurring', event.target.checked)} />
                    {t.finance.recurringLabel}
                  </label>
                  {form.isRecurring ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                          <span className="font-medium text-[var(--foreground)]/90">{t.finance.recurrenceFrequencyLabel}</span>
                          <select value={form.recurrenceFrequency} onChange={(event) => onFieldChange('recurrenceFrequency', event.target.value as TransactionEditorForm['recurrenceFrequency'])} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]">
                            <option value="DAILY">{t.finance.cadenceDaily}</option>
                            <option value="WEEKLY">{t.finance.cadenceWeekly}</option>
                            <option value="MONTHLY">{t.finance.cadenceMonthly}</option>
                            <option value="SEMIANNUAL">{t.finance.cadenceSemiannual}</option>
                            <option value="YEARLY">{t.finance.cadenceYearly}</option>
                          </select>
                        </label>
                        {form.recurrenceFrequency !== 'SEMIANNUAL' ? (
                          <Input label={t.finance.recurrenceIntervalLabel} type="number" value={form.recurrenceInterval} onChange={(event) => onFieldChange('recurrenceInterval', event.target.value)} />
                        ) : null}
                      </div>
                      <Input label={t.finance.recurrenceEndDateLabel} type="date" value={form.recurrenceEndDate} onChange={(event) => onFieldChange('recurrenceEndDate', event.target.value)} />
                      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]/75">
                        <input type="checkbox" checked={form.addToCalendar} onChange={(event) => onFieldChange('addToCalendar', event.target.checked)} />
                        {t.finance.addToCalendarLabel}
                      </label>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border [border-color:var(--border)]">
          <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={isExpanded('details')} onClick={() => onToggleSection('details')}>
            <span className="text-sm font-semibold text-[var(--foreground)]">{t.finance.details ?? 'Contexto e anotacoes'}</span>
            <span className="text-xs text-[var(--foreground)]/45">{isExpanded('details') ? '−' : '+'}</span>
          </button>
          {isExpanded('details') ? (
            <div className="grid gap-4 border-t [border-color:var(--border)] px-4 py-4">
              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
                <span className="font-medium text-[var(--foreground)]/90">{t.finance.descriptionLabel}</span>
                <textarea value={form.description} onChange={(event) => onFieldChange('description', event.target.value)} rows={3} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400" />
              </label>
              <div className="grid gap-2">
                <p className="text-sm font-medium text-[var(--foreground)]/90">{t.finance.tagsLabel}</p>
                <TransactionTagSelector tags={tags} selectedIds={form.tagIds} draft={tagDraft} addLabel={t.finance.addTagAction} placeholderLabel={t.finance.tagsPlaceholder} emptyLabel={t.finance.tagsEmpty} suggested={SUGGESTED_TAGS} onToggle={onToggleTag} onDraftChange={onTagDraftChange} onAdd={onTagAdd} onSuggest={onTagSuggest} />
              </div>
              {members.length > 0 ? (
                <div className="grid gap-2">
                  <p className="text-sm font-medium text-[var(--foreground)]/90">{t.finance.participantsLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <Button key={member.userId} variant={form.participantIds.includes(member.userId) ? 'primary' : 'secondary'} onClick={() => onToggleParticipant(member.userId)}>
                        <Avatar src={member.photoUrl} name={member.label} size={18} />
                        {member.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--foreground)]/45">{t.finance.reviewLabel ?? 'Resumo'} </p>
          <div className="mt-3 grid gap-2 text-sm text-[var(--foreground)]/70">
            <div className="flex items-center justify-between gap-4"><span>{t.finance.amountLabel}</span><strong className="text-[var(--foreground)]">{amountPreview ? formatCurrency(amountPreview, form.currency) : '—'}</strong></div>
            <div className="flex items-center justify-between gap-4"><span>{t.finance.transactionRouteTitle ?? 'Rota'}</span><strong className="text-[var(--foreground)]">{routeLabel}</strong></div>
            <div className="flex items-center justify-between gap-4"><span>{t.finance.statusLabel}</span><strong className="text-[var(--foreground)]">{statusLocked ? t.finance.statusPending : form.status === 'PAID' ? t.finance.statusPaid : t.finance.statusPending}</strong></div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t [border-color:var(--border)] pt-4">
        {error ? <p className="mb-3 text-sm text-[var(--expense)]">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>{t.finance.cancel}</Button>
          <Button onClick={onSave} disabled={isSaving}>{isSaving ? t.finance.saving : t.finance.save}</Button>
        </div>
      </div>
    </Card>
  );
}
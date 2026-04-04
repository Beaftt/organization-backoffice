'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import { TransactionTypeToggle, type TransactionEffectiveType } from './TransactionTypeToggle';
import { TransactionTagSelector } from './TransactionTagSelector';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTag,
  FinanceTransaction,
} from '@/lib/api/finance';

export type TransactionFormState = {
  title: string;
  amount: string;
  currency: 'BRL' | 'USD';
  group: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING';
  occurredAt: string;
  accountId: string;
  paymentMethodId: string;
  categoryId: string;
  tagIds: string[];
  participantIds: string[];
  description: string;
  isRecurring: boolean;
  addToCalendar: boolean;
  recurrenceFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'SEMIANNUAL';
  recurrenceInterval: string;
  recurrenceEndDate: string;
  installments: number;
  isInstallmentValue: boolean;
};

interface TransactionFormBodyProps {
  form: TransactionFormState;
  activeTab: 'details' | 'recurrence';
  editing: FinanceTransaction | null;
  accounts: FinanceAccount[];
  paymentMethods: FinancePaymentMethod[];
  categories: FinanceCategory[];
  tags: FinanceTag[];
  members: { userId: string; label: string; photoUrl: string | null }[];
  tagDraft: string;
  cardMethods: FinancePaymentMethod[];
  investMethods: FinancePaymentMethod[];
  onChange: (patch: Partial<TransactionFormState>) => void;
  onTabChange: (tab: 'details' | 'recurrence') => void;
  onTagDraftChange: (value: string) => void;
  onTagToggle: (tagId: string) => void;
  onTagAdd: () => void;
  onTagSuggest: (name: string) => void;
  formatCurrencyInput: (digits: string, currency: string) => string;
  parseCurrencyInput: (value: string) => number;
}

export function TransactionFormBody({
  form,
  activeTab,
  editing,
  accounts,
  paymentMethods,
  categories,
  tags,
  members,
  tagDraft,
  cardMethods,
  investMethods,
  onChange,
  onTabChange,
  onTagDraftChange,
  onTagToggle,
  onTagAdd,
  onTagSuggest,
  formatCurrencyInput,
}: TransactionFormBodyProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const suggestedTags = isPt ? ['Casa', 'Mercado', 'Trabalho'] : ['Home', 'Groceries', 'Work'];

  // Derive effective type from group + selected payment method
  const isInvestSelected = investMethods.some((m) => m.id === form.paymentMethodId);
  const effectiveType: TransactionEffectiveType = isInvestSelected ? 'INVEST' : form.group;

  const handleTypeChange = (type: TransactionEffectiveType) => {
    if (type === 'INVEST') {
      const firstInvest = investMethods[0];
      onChange({
        group: 'EXPENSE',
        paymentMethodId: firstInvest?.id ?? form.paymentMethodId,
      });
    } else {
      const wasInvest = investMethods.some((m) => m.id === form.paymentMethodId);
      onChange({
        group: type as 'INCOME' | 'EXPENSE',
        paymentMethodId: wasInvest ? '' : form.paymentMethodId,
      });
    }
  };

  const selectedMethod = paymentMethods.find((m) => m.id === form.paymentMethodId);
  const isCreditInstallmentNew =
    !editing &&
    selectedMethod?.type === 'CREDIT' &&
    form.group === 'EXPENSE' &&
    form.installments > 1;
  const isEditingInstallment = Boolean(editing?.installmentTotal && editing.installmentTotal > 1);

  return (
    <div className="grid gap-4">
      {/* Type toggle — always first */}
      <TransactionTypeToggle
        value={effectiveType}
        onChange={handleTypeChange}
        incomeLabel={t.finance.groupIncome}
        expenseLabel={t.finance.groupExpense}
        investLabel={t.finance.transactionTypeInvestment ?? 'Investimento'}
      />

      {/* Tab switcher — only shown when recurring is active (multiple tabs) */}
      {form.isRecurring ? (
        <div className="flex gap-2 border-b [border-color:var(--border)] pb-1">
          <button
            type="button"
            onClick={() => onTabChange('details')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'details'
                ? 'bg-[var(--sidebar)]/10 text-[var(--sidebar)]'
                : 'text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
            }`}
          >
            {t.finance.details ?? t.finance.transactionSectionDetails ?? 'Detalhes'}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('recurrence')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'recurrence'
                ? 'bg-[var(--sidebar)]/10 text-[var(--sidebar)]'
                : 'text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
            }`}
          >
            {t.finance.recurrenceTabLabel ?? 'Recorrência'}
          </button>
        </div>
      ) : null}

      {(activeTab === 'details' || !form.isRecurring) ? (
        <>
          {/* SECTION: Essencial */}
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">
            {t.finance.transactionSectionEssential ?? 'Essencial'}
          </p>

          <Input
            label={t.finance.titleLabel}
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--foreground)]/60">
                {t.finance.amountLabel}
              </span>
              <input
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  onChange({ amount: formatCurrencyInput(digits, form.currency) });
                }}
                className="w-full rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:[border-color:var(--sidebar)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--foreground)]/60">&nbsp;</span>
              <select
                value={form.currency}
                onChange={(e) => {
                  const currency = e.target.value as 'BRL' | 'USD';
                  const digits = form.amount.replace(/\D/g, '');
                  onChange({ currency, amount: formatCurrencyInput(digits, currency) });
                }}
                className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={t.finance.dateLabel}
              type="date"
              value={form.occurredAt.slice(0, 10)}
              onChange={(e) => onChange({ occurredAt: e.target.value })}
            />
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
              {t.finance.statusLabel}
              <select
                value={form.status}
                onChange={(e) => onChange({ status: e.target.value as 'PAID' | 'PENDING' })}
                className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
              >
                <option value="PAID">{t.finance.statusPaid}</option>
                <option value="PENDING">{t.finance.statusPending}</option>
              </select>
            </label>
          </div>

          {/* SECTION: Classificação */}
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">
            {t.finance.transactionSectionClassification ?? 'Classificação'}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
              {t.finance.accountLabel}
              <select
                value={form.accountId}
                onChange={(e) => onChange({ accountId: e.target.value })}
                className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
              >
                <option value="">{t.finance.accountAll}</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
              {t.finance.methodLabel}
              <select
                value={form.paymentMethodId}
                onChange={(e) => {
                  const id = e.target.value;
                  const sel = paymentMethods.find((m) => m.id === id);
                  onChange({ paymentMethodId: id, accountId: sel?.accountId ?? form.accountId });
                }}
                className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
              >
                <option value="">{t.finance.none}</option>
                {cardMethods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                {investMethods.length > 0 ? (
                  <optgroup label={t.finance.investmentsTitle ?? 'Investimentos'}>
                    {investMethods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </optgroup>
                ) : null}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
              {t.finance.typeLabel}
              <select
                value={form.categoryId}
                onChange={(e) => onChange({ categoryId: e.target.value })}
                className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
              >
                <option value="">{t.finance.typeAll}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>

          {/* Credit installments (new only) */}
          {!editing && selectedMethod?.type === 'CREDIT' && form.group === 'EXPENSE' ? (
            <div className="grid gap-3 rounded-2xl border [border-color:var(--border)] px-4 py-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                {t.finance.installmentsLabel ?? 'Parcelas'}
                <select
                  value={form.installments}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChange({ installments: val, isInstallmentValue: val > 1 ? form.isInstallmentValue : false });
                  }}
                  className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                >
                  <option value={1}>{t.finance.installmentsCash ?? 'À vista'}</option>
                  {[2,3,4,5,6,7,8,9,10,11,12].map((n) => <option key={n} value={n}>{n}x</option>)}
                </select>
              </label>
              {form.installments > 1 ? (
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={form.isInstallmentValue} onChange={(e) => onChange({ isInstallmentValue: e.target.checked })} />
                  {t.finance.installmentsIsPerValueLabel ?? 'Valor por parcela'}
                </label>
              ) : null}
            </div>
          ) : null}

          {/* Edit installment selector */}
          {isEditingInstallment ? (
            <div className="grid gap-2 rounded-2xl border [border-color:var(--border)] px-4 py-3">
              <span className="text-xs font-semibold uppercase text-[var(--foreground)]/50">
                {t.finance.installmentsLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 - (editing?.installmentIndex ?? 1) + 1 }, (_, k) => (editing?.installmentIndex ?? 1) + k).map((n) => (
                  <button key={n} type="button" onClick={() => onChange({ installments: n })}
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ring-1 transition-colors ${form.installments === n ? 'bg-zinc-800 text-white ring-zinc-800' : 'text-[var(--foreground)]/60 ring-[var(--border)]'}`}>
                    {n}x
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* SECTION: Detalhes */}
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">
            {t.finance.transactionSectionDetails ?? 'Detalhes'}
          </p>

          <Input
            label={t.finance.descriptionLabel}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />

          <div className="grid gap-2">
            <p className="text-xs font-semibold text-[var(--foreground)]/60">{t.finance.tagsLabel}</p>
            <TransactionTagSelector
              tags={tags}
              selectedIds={form.tagIds}
              draft={tagDraft}
              addLabel={t.finance.addTagAction}
              placeholderLabel={t.finance.tagsPlaceholder}
              emptyLabel={isPt ? 'Use tags curtas para lembrar depois.' : 'Use short tags for quick context.'}
              suggested={suggestedTags}
              onToggle={onTagToggle}
              onDraftChange={onTagDraftChange}
              onAdd={onTagAdd}
              onSuggest={onTagSuggest}
            />
          </div>

          {members.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-xs font-semibold text-[var(--foreground)]/60">{t.finance.participantsLabel}</p>
              <p className="text-xs text-[var(--foreground)]/40">{t.finance.participantsHint}</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <Button
                    key={m.userId}
                    type="button"
                    variant={form.participantIds.includes(m.userId) ? 'primary' : 'secondary'}
                    onClick={() => onChange({
                      participantIds: form.participantIds.includes(m.userId)
                        ? form.participantIds.filter((id) => id !== m.userId)
                        : [...form.participantIds, m.userId],
                    })}
                  >
                    <Avatar src={m.photoUrl} name={m.label} size={20} /> {m.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {!isCreditInstallmentNew ? (
            <div className="rounded-2xl border [border-color:var(--border)] px-4 py-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange({ isRecurring: checked, addToCalendar: checked ? form.addToCalendar : false });
                    if (checked) onTabChange('recurrence');
                    else onTabChange('details');
                  }}
                />
                {t.finance.recurringLabel}
              </label>
            </div>
          ) : null}
        </>
      ) : null}

      {activeTab === 'recurrence' && form.isRecurring ? (
        <div className="grid gap-4 rounded-2xl border [border-color:var(--border)] px-4 py-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.finance.recurrenceFrequencyLabel}
            <select
              value={form.recurrenceFrequency}
              onChange={(e) => onChange({ recurrenceFrequency: e.target.value as TransactionFormState['recurrenceFrequency'] })}
              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
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
              value={form.recurrenceInterval}
              onChange={(e) => onChange({ recurrenceInterval: e.target.value })}
            />
          ) : null}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[var(--foreground)]/60">
              {t.finance.recurrenceEndDateLabel}
            </span>
            <input
              type="date"
              value={form.recurrenceEndDate}
              onChange={(e) => onChange({ recurrenceEndDate: e.target.value })}
              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            />
            {!form.recurrenceEndDate ? (
              <span className="text-xs text-[var(--foreground)]/40">{t.finance.recurrenceNoEndDate}</span>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.addToCalendar}
              onChange={(e) => onChange({ addToCalendar: e.target.checked })}
            />
            {t.finance.addToCalendarLabel}
          </label>
        </div>
      ) : null}
    </div>
  );
}

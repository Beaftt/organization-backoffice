'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceRecurring,
  FinanceTag,
} from '@/lib/api/finance';

import { FinanceOverlayShell } from '@/components/finance/drawers/FinanceOverlayShell';

import type { RecurringFormState } from './setup-state-model';

type FinanceRecurringDrawerProps = {
  open: boolean;
  editing: FinanceRecurring | null;
  form: RecurringFormState;
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  tags: FinanceTag[];
  formError: string | null;
  isSaving: boolean;
  onClose: () => void;
  onChange: (patch: Partial<RecurringFormState>) => void;
  onDelete: (item: FinanceRecurring) => void;
  onSave: () => void;
  onToggleTag: (tagId: string) => void;
};

export function FinanceRecurringDrawer({
  open,
  editing,
  form,
  accounts,
  categories,
  tags,
  formError,
  isSaving,
  onClose,
  onChange,
  onDelete,
  onSave,
  onToggleTag,
}: FinanceRecurringDrawerProps) {
  const { language, t } = useLanguage();
  const title = editing
    ? t.finance.editAction ?? 'Edit recurring rule'
    : t.finance.recurringAdd ?? (language === 'pt' ? 'Nova cobrança programada' : 'New programmed charge');
  const visibleCategories = categories.filter((category) => category.group === form.group);
  const frequencyLabel = t.finance.recurrenceFrequencyLabel ?? (language === 'pt' ? 'Frequência' : 'Frequency');
  const intervalLabel = t.finance.recurrenceIntervalLabel ?? (language === 'pt' ? 'Intervalo' : 'Interval');
  const endDateLabel = t.finance.recurrenceEndDateLabel ?? (language === 'pt' ? 'Data final' : 'End date');
  const activeLabel = t.finance.activeLabel ?? (language === 'pt' ? 'Manter esta cobrança ativa' : 'Keep this charge active');

  return (
    <FinanceOverlayShell
      open={open}
      title={title}
      variant="drawer"
      size="md"
      onClose={onClose}
      footer={
        <>
          {formError ? <p className="mb-3 text-sm text-[var(--expense)]">{formError}</p> : null}
          <div className="flex flex-wrap justify-end gap-2">
            {editing ? (
              <Button variant="danger" onClick={() => onDelete(editing)} disabled={isSaving}>
                {t.finance.deleteAction}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              {t.finance.cancel}
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? t.finance.saving : t.finance.save}
            </Button>
          </div>
        </>
      }
    >
      <div className="grid gap-4">
        <Input label={t.finance.titleLabel} value={form.title} onChange={(event) => onChange({ title: event.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label={t.finance.amountLabel} type="number" value={form.amount} onChange={(event) => onChange({ amount: event.target.value })} />
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.finance.groupLabel}
            <select value={form.group} onChange={(event) => onChange({ group: event.target.value as 'INCOME' | 'EXPENSE', categoryId: '' })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
              <option value="INCOME">{t.finance.groupIncome}</option>
              <option value="EXPENSE">{t.finance.groupExpense}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {frequencyLabel}
            <select value={form.frequency} onChange={(event) => onChange({ frequency: event.target.value as RecurringFormState['frequency'] })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
              <option value="DAILY">{t.finance.cadenceDaily ?? (language === 'pt' ? 'Diária' : 'Daily')}</option>
              <option value="WEEKLY">{t.finance.cadenceWeekly ?? (language === 'pt' ? 'Semanal' : 'Weekly')}</option>
              <option value="MONTHLY">{t.finance.cadenceMonthly ?? (language === 'pt' ? 'Mensal' : 'Monthly')}</option>
              <option value="SEMIANNUAL">{t.finance.cadenceSemiannual ?? (language === 'pt' ? 'Semestral' : 'Semiannual')}</option>
              <option value="YEARLY">{t.finance.cadenceYearly ?? (language === 'pt' ? 'Anual' : 'Yearly')}</option>
            </select>
          </label>
          <Input label={intervalLabel} type="number" min="1" value={form.frequency === 'SEMIANNUAL' ? '6' : form.interval} onChange={(event) => onChange({ interval: event.target.value })} disabled={form.frequency === 'SEMIANNUAL'} />
          <Input label={t.finance.nextDueLabel ?? 'Next due'} type="date" value={form.nextDue} onChange={(event) => onChange({ nextDue: event.target.value })} />
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            Quando termina?
            <select
              value={form.endMode}
              onChange={(event) => {
                const nextMode = event.target.value as RecurringFormState['endMode'];
                onChange({ endMode: nextMode });
                if (nextMode !== 'end-date') {
                  onChange({ endDate: '' });
                }
                if (nextMode !== 'times') {
                  onChange({ occurrences: '' });
                }
              }}
              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            >
              <option value="ongoing">Sem fim definido</option>
              <option value="end-date">Em uma data</option>
              <option value="times">Depois de algumas vezes</option>
            </select>
          </label>
        </div>

        {form.endMode === 'end-date' ? (
          <Input label={endDateLabel} type="date" value={form.endDate} onChange={(event) => onChange({ endDate: event.target.value })} />
        ) : null}

        {form.endMode === 'times' ? (
          <Input label="Quantas vezes?" type="number" min="2" value={form.occurrences} onChange={(event) => onChange({ occurrences: event.target.value })} />
        ) : null}

        <div className="rounded-2xl border [border-color:var(--border)] bg-[var(--surface-muted)]/35 px-4 py-3 text-sm text-[var(--foreground)]/62">
          Sem fim ela continua ativa. Com data ou quantidade definida, passa a ser uma cobrança programada com término.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.finance.accountLabel}
            <select value={form.accountId} onChange={(event) => onChange({ accountId: event.target.value })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
              <option value="">{t.finance.none}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.finance.typeLabel}
            <select value={form.categoryId} onChange={(event) => onChange({ categoryId: event.target.value })} className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm">
              <option value="">{t.finance.none}</option>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border [border-color:var(--border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
            {t.finance.tagsLabel ?? 'Tags'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-xs text-[var(--foreground)]/55">{t.finance.empty ?? 'No tags yet.'}</p>
            ) : (
              tags.map((tag) => {
                const active = form.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/10 text-[var(--sidebar)]'
                        : 'border-[var(--border)] text-[var(--foreground)]/65 hover:bg-[var(--surface-muted)]'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]/75">
          <input type="checkbox" checked={form.active} onChange={(event) => onChange({ active: event.target.checked })} className="h-4 w-4 rounded accent-[var(--sidebar)]" />
          {activeLabel}
        </label>
      </div>
    </FinanceOverlayShell>
  );
}
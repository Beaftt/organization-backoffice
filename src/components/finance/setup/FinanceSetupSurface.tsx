'use client';

import { AccountsList } from '@/components/finance/accounts/AccountsList';
import { AccountDrawer } from '@/components/finance/drawers/AccountDrawer';
import { PaymentMethodDrawer } from '@/components/finance/drawers/PaymentMethodDrawer';
import { TagDrawer } from '@/components/finance/drawers/TagDrawer';
import { TypeDrawer } from '@/components/finance/drawers/TypeDrawer';
import { CardsSection } from '@/components/finance/payment-methods/CardsSection';
import { InvestmentsSection } from '@/components/finance/payment-methods/InvestmentsSection';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/lib/i18n/language-context';

import { FinanceInvestmentOverlay } from './FinanceInvestmentOverlay';
import { FinanceRecurringDrawer } from './FinanceRecurringDrawer';
import { FinanceSetupRecurringSection } from './FinanceSetupRecurringSection';
import { FinanceSetupTaxonomySection } from './FinanceSetupTaxonomySection';
import { formatCurrencyDigits } from './setup-form-utils';
import { useFinanceSetupState } from './useFinanceSetupState';

type FinanceSetupSurfaceProps = {
  monthLabel: string;
  setup: ReturnType<typeof useFinanceSetupState>;
};

export function FinanceSetupSurface({ monthLabel, setup }: FinanceSetupSurfaceProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const navItems = [
    { id: 'setup-structure', label: isPt ? 'Estrutura' : 'Structure', value: setup.accounts.length + setup.paymentMethods.length },
    { id: 'setup-automation', label: isPt ? 'Programado' : 'Scheduled', value: setup.recurring.length },
    { id: 'setup-taxonomy', label: isPt ? 'Rótulos' : 'Labels', value: setup.categories.length + setup.tags.length },
  ];
  const surfaceTitle = isPt ? 'Ajustes' : 'Setup';
  const surfaceDescription = isPt
    ? `Ajuste estrutura, regras e rótulos de ${monthLabel}.`
    : `Adjust structure, rules, and labels for ${monthLabel}.`;
  const navDescription = isPt
    ? 'Resolva contas, meios de pagamento, regras e rótulos aqui para o Desk ficar leve.'
    : 'Set accounts, payment methods, rules, and labels here so Desk stays light.';
  const structureEyebrow = isPt ? 'Estrutura' : 'Structure';
  const structureTitle = isPt
    ? 'Contas, meios de pagamento e investimentos'
    : 'Accounts, payment methods, and investments';

  if (setup.isLoading) {
    return <div className="grid gap-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-72 w-full" /><Skeleton className="h-72 w-full" /></div>;
  }

  return (
    <div className="page-transition space-y-6">
      <SectionHeader eyebrow={t.modules.finance ?? (isPt ? 'Financeiro' : 'Finance')} title={surfaceTitle} description={surfaceDescription} />

      {setup.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          {setup.error}
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <div className="flex flex-wrap gap-3">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="rounded-full border [border-color:var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]">
                {item.label} <span className="text-[var(--foreground)]/45">({item.value})</span>
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--foreground)]/60">
            {navDescription}
          </p>
        </Card>
        <Card className="grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-1">
          {navItems.map((item) => (
            <div key={item.id} className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </Card>
      </div>

      <Card id="setup-structure" className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">{structureEyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{structureTitle}</h2>
        </div>
        <div className="grid gap-8 xl:grid-cols-2">
          <AccountsList accounts={setup.accounts} isSaving={setup.isSaving} onAdd={() => setup.openAccountDrawer()} onEdit={setup.openAccountDrawer} onDelete={setup.removeAccount} />
          <CardsSection cardMethods={[...setup.creditMethods, ...setup.immediateMethods]} cardBills={setup.cardBills} isSaving={setup.isSaving} onAdd={() => setup.openPaymentMethodDrawer()} onEdit={setup.openPaymentMethodDrawer} onDelete={setup.removePaymentMethod} />
        </div>
        <InvestmentsSection investMethods={setup.investMethods} isSaving={setup.isSaving} onAdd={() => setup.openPaymentMethodDrawer(undefined, 'INVEST')} onEdit={setup.openPaymentMethodDrawer} onDelete={setup.removePaymentMethod} onDeposit={(method) => setup.openInvestmentAction('deposit', method)} onWithdraw={(method) => setup.openInvestmentAction('withdraw', method)} onTransfer={(method) => setup.openInvestmentAction('transfer', method)} />
      </Card>

      <Card id="setup-automation" className="p-6">
        <FinanceSetupRecurringSection accounts={setup.accounts} categories={setup.categories} recurring={setup.recurring} recurringStatus={setup.recurringStatus} onAdd={() => setup.openRecurringDrawer()} onDelete={setup.removeRecurring} onEdit={setup.openRecurringDrawer} onToggleActive={setup.toggleRecurringActive} />
      </Card>

      <Card id="setup-taxonomy" className="p-6">
        <FinanceSetupTaxonomySection expenseCategories={setup.expenseCategories} incomeCategories={setup.incomeCategories} tags={setup.tags} onAddExpenseCategory={() => setup.openCategoryOverlay('EXPENSE')} onAddIncomeCategory={() => setup.openCategoryOverlay('INCOME')} onAddTag={() => setup.openTagOverlay()} onDeleteCategory={setup.removeCategory} onDeleteTag={setup.removeTag} onEditCategory={(category) => setup.openCategoryOverlay(category.group, category)} onEditTag={setup.openTagOverlay} />
      </Card>

      <AccountDrawer open={setup.accountDrawerOpen} editing={setup.editingAccount} form={setup.accountForm} formError={setup.accountFormError} isSaving={setup.isSaving} presentation="drawer" onClose={setup.closeAccountDrawer} onChange={(patch) => setup.setAccountForm((current) => ({ ...current, ...patch }))} onSave={setup.saveAccount} onDelete={setup.removeAccount} />
      <PaymentMethodDrawer open={setup.paymentMethodDrawerOpen} editing={setup.editingPaymentMethod} form={setup.paymentMethodForm} accounts={setup.accounts} formError={setup.paymentMethodFormError} isSaving={setup.isSaving} presentation="drawer" onClose={setup.closePaymentMethodDrawer} onChange={(patch) => setup.setPaymentMethodForm((current) => ({ ...current, ...patch }))} onSave={setup.savePaymentMethod} onDelete={setup.removePaymentMethod} formatCurrencyInput={formatCurrencyDigits} />
      <TypeDrawer open={setup.taxonomyOverlay.kind === 'category'} title={setup.taxonomyOverlay.editingCategory ? t.finance.editAction ?? 'Edit category' : t.finance.newType ?? 'New category'} name={setup.taxonomyOverlay.name} group={setup.taxonomyOverlay.group} formError={setup.taxonomyOverlay.error} isSaving={setup.isSaving} onClose={setup.closeTaxonomyOverlay} onNameChange={(value) => setup.setTaxonomyOverlay((current) => ({ ...current, name: value }))} onGroupChange={(value) => setup.setTaxonomyOverlay((current) => ({ ...current, group: value }))} onSave={setup.saveTaxonomyOverlay} />
      <TagDrawer open={setup.taxonomyOverlay.kind === 'tag'} title={setup.taxonomyOverlay.editingTag ? t.finance.editAction ?? 'Edit tag' : t.finance.addTagAction ?? 'New tag'} name={setup.taxonomyOverlay.name} formError={setup.taxonomyOverlay.error} isSaving={setup.isSaving} onClose={setup.closeTaxonomyOverlay} onNameChange={(value) => setup.setTaxonomyOverlay((current) => ({ ...current, name: value }))} onSave={setup.saveTaxonomyOverlay} />
      <FinanceRecurringDrawer open={setup.recurringDrawerOpen} editing={setup.editingRecurring} form={setup.recurringForm} accounts={setup.accounts} categories={setup.categories} tags={setup.tags} formError={setup.recurringFormError} isSaving={setup.isSaving} onClose={setup.closeRecurringDrawer} onChange={(patch) => setup.setRecurringForm((current) => ({ ...current, ...patch }))} onDelete={setup.removeRecurring} onSave={setup.saveRecurring} onToggleTag={(tagId) => setup.setRecurringForm((current) => ({ ...current, tagIds: current.tagIds.includes(tagId) ? current.tagIds.filter((item) => item !== tagId) : [...current.tagIds, tagId] }))} />
      <FinanceInvestmentOverlay open={Boolean(setup.investmentAction.mode)} accounts={setup.accounts} investments={setup.investMethods} isSaving={setup.isSaving} state={setup.investmentAction} onBack={() => setup.setInvestmentAction((current) => ({ ...current, error: null, step: 1 }))} onChange={(patch) => setup.setInvestmentAction((current) => ({ ...current, ...patch }))} onClose={setup.closeInvestmentAction} onContinue={setup.continueInvestmentAction} onSubmit={setup.submitInvestmentAction} />
    </div>
  );
}
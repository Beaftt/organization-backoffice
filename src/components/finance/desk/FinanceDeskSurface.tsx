'use client';

import { FinanceInvestmentOverlay } from '@/components/finance/setup/FinanceInvestmentOverlay';
import { Card } from '@/components/ui/Card';
import { FinanceTransactionModal } from '@/components/finance/transaction/FinanceTransactionModal';

import { FinanceDeskCaptureStrip } from './FinanceDeskCaptureStrip';
import { FinanceDeskLedger } from './FinanceDeskLedger';
import { FinanceDeskMonthBand } from './FinanceDeskMonthBand';
import { useFinanceDeskState } from './useFinanceDeskState';

type FinanceDeskSurfaceProps = {
  desk: ReturnType<typeof useFinanceDeskState>;
};

export function FinanceDeskSurface({ desk }: FinanceDeskSurfaceProps) {
  const updateField = <K extends keyof typeof desk.composer.form>(
    field: K,
    value: (typeof desk.composer.form)[K],
  ) => {
    desk.composer.setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="page-transition space-y-5">
      <FinanceDeskMonthBand
        hasInvestments={desk.investMethods.length > 0}
        isCurrentMonth={desk.isCurrentMonth}
        monthLabel={desk.monthLabel}
        onOpenDeposit={() => desk.openInvestmentAction('deposit')}
        totalExpense={desk.totalExpense}
        totalIncome={desk.totalIncome}
        onMonthNext={desk.handleMonthNext}
        onMonthPrev={desk.handleMonthPrev}
        onMonthReset={desk.handleMonthReset}
        onOpenComposer={() => desk.openComposer('expense')}
        onOpenWithdraw={() => desk.openInvestmentAction('withdraw')}
      />

      <FinanceDeskCaptureStrip onOpenComposer={desk.openComposer} />

      {desk.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-200">
          {desk.error}
        </Card>
      ) : null}

      <FinanceDeskLedger
        accountFilter={desk.accountFilter}
        accounts={desk.accounts}
        activeId={desk.activeTransactionId}
        cardFilter={desk.cardFilter}
        cardMethods={desk.creditMethods}
        categories={desk.categories}
        groupFilter={desk.groupFilter}
        hasMore={desk.hasMore}
        isLoading={desk.isLoading}
        isSaving={desk.composer.isSaving}
        query={desk.query}
        routeFilter={desk.routeFilter}
        sortBy={desk.sortBy}
        statusFilter={desk.statusFilter}
        totalTransactions={desk.sortedTransactions.length}
        transactions={desk.visibleTransactions}
        typeFilter={desk.typeFilter}
        onAccount={(value) => {
          desk.setAccountFilter(value);
          desk.setPage(1);
        }}
        onCard={(value) => {
          desk.setCardFilter(value);
          desk.setPage(1);
        }}
        onDelete={(item) => void desk.composer.remove(item)}
        onEdit={desk.onEditTransaction}
        onGroup={(value) => {
          desk.setGroupFilter(value);
          desk.setPage(1);
        }}
        onLoadMore={() => desk.setPage(desk.page + 1)}
        onQuery={(value) => {
          desk.setQuery(value);
          desk.setPage(1);
        }}
        onRoute={(value) => {
          desk.setRouteFilter(value);
          desk.setPage(1);
        }}
        onSort={desk.setSortBy}
        onStatus={(value) => {
          desk.setStatusFilter(value);
          desk.setPage(1);
        }}
        onType={(value) => {
          desk.setTypeFilter(value);
          desk.setPage(1);
        }}
      />

      <FinanceTransactionModal
        accounts={desk.accounts}
        categories={desk.categories}
        composerState={desk.composer.composerState}
        currentStep={desk.composer.currentStep}
        editing={Boolean(desk.composer.editingTransaction)}
        error={desk.composer.error}
        form={desk.composer.form}
        isSaving={desk.composer.isSaving}
        paymentMethods={desk.paymentMethods}
        steps={desk.composer.steps}
        tagDraft={desk.composer.tagDraft}
        tags={desk.tags}
        onBack={desk.composer.goBack}
        onClose={desk.closeComposer}
        onDelete={() => void desk.composer.remove()}
        onFieldChange={updateField}
        onIntentChange={desk.composer.updateIntent}
        onNext={desk.composer.goNext}
        onOpenDetails={desk.composer.openDetails}
        onSave={(mode) => void desk.composer.save(mode)}
        onTagAdd={() => void desk.composer.createTag()}
        onTagDraftChange={desk.composer.setTagDraft}
        onTagSuggest={(name) => void desk.composer.createTag(name)}
        onTagToggle={(tagId) =>
          desk.composer.setForm((current) => ({
            ...current,
            tagIds: current.tagIds.includes(tagId)
              ? current.tagIds.filter((item) => item !== tagId)
              : [...current.tagIds, tagId],
          }))
        }
      />

      <FinanceInvestmentOverlay
        open={Boolean(desk.investmentAction.mode)}
        accounts={desk.accounts}
        investments={desk.investMethods}
        isSaving={desk.isSaving}
        state={desk.investmentAction}
        onBack={() => desk.setInvestmentAction((current) => ({ ...current, error: null, step: 1 }))}
        onChange={(patch) => desk.setInvestmentAction((current) => ({ ...current, ...patch }))}
        onClose={desk.closeInvestmentAction}
        onContinue={desk.continueInvestmentAction}
        onSubmit={desk.submitInvestmentAction}
      />
    </div>
  );
}
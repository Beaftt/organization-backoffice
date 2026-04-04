'use client';

import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/language-context';
import { TransactionEditorPanel } from '@/components/finance/transaction/TransactionEditorPanel';
import { useFinanceTransactionsWorkspace } from '@/components/finance/transaction/useFinanceTransactionsWorkspace';
import { EntriesList } from './EntriesList';
import { EntriesSearchBar } from './EntriesSearchBar';
import { EntriesSummaryRow } from './EntriesSummaryRow';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceRecurring,
  FinanceTag,
  FinanceTransaction,
} from '@/lib/api/finance';

type MemberOption = {
  userId: string;
  label: string;
  photoUrl: string | null;
};

interface FinanceTransactionsWorkspaceProps {
  query: string;
  groupFilter: string;
  typeFilter: string;
  statusFilter: string;
  sortBy: string;
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  paymentMethods: FinancePaymentMethod[];
  tags: FinanceTag[];
  recurring: FinanceRecurring[];
  members: MemberOption[];
  currentUserId: string;
  totalTransactions: number;
  visibleTransactions: FinanceTransaction[];
  totalIncome: number;
  totalExpense: number;
  isLoading: boolean;
  hasMore: boolean;
  onQuery: (value: string) => void;
  onGroup: (value: string) => void;
  onType: (value: string) => void;
  onStatus: (value: string) => void;
  onSort: (value: string) => void;
  onLoadMore: () => void;
  reloadTransactions: () => Promise<void>;
  onTagsUpdated: (tags: FinanceTag[]) => void;
  onRecurringUpdated: (recurring: FinanceRecurring[]) => void;
}

export function FinanceTransactionsWorkspace({
  query,
  groupFilter,
  typeFilter,
  statusFilter,
  sortBy,
  categories,
  accounts,
  paymentMethods,
  tags,
  recurring,
  members,
  currentUserId,
  totalTransactions,
  visibleTransactions,
  totalIncome,
  totalExpense,
  isLoading,
  hasMore,
  onQuery,
  onGroup,
  onType,
  onStatus,
  onSort,
  onLoadMore,
  reloadTransactions,
  onTagsUpdated,
  onRecurringUpdated,
}: FinanceTransactionsWorkspaceProps) {
  const { t } = useLanguage();
  const editor = useFinanceTransactionsWorkspace({
    paymentMethods,
    recurring,
    tags,
    currentUserId,
    reloadTransactions,
    onTagsUpdated,
    onRecurringUpdated,
  });

  return (
    <div className="page-transition grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.92fr)] lg:items-start xl:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.92fr)]">
      <Card className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b [border-color:var(--border)] pb-3">
          <div className="grid gap-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
              {t.finance.tabsEntries ?? 'Lançamentos'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {t.finance.transactionWorkspaceTitle ?? 'Workspace de transações'}
              </h3>
              {!isLoading ? (
                <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]/65">
                  {totalTransactions} {(t.finance.tabsEntries ?? 'Lançamentos').toLowerCase()}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <EntriesSearchBar
          query={query}
          groupFilter={groupFilter}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          sortBy={sortBy}
          categories={categories}
          onQuery={onQuery}
          onGroup={onGroup}
          onType={onType}
          onStatus={onStatus}
          onSort={onSort}
          onNew={() => editor.openEditor()}
        />

        {!isLoading && totalTransactions > 0 ? (
          <EntriesSummaryRow
            total={totalTransactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
        ) : null}

        <EntriesList
          transactions={visibleTransactions}
          categories={categories}
          isLoading={isLoading}
          hasMore={hasMore}
          isSaving={editor.isSaving}
          activeId={editor.editingTransaction?.id ?? null}
          onEdit={editor.openEditor}
          onDelete={editor.remove}
          onLoadMore={onLoadMore}
        />
      </Card>

      <div className="lg:sticky lg:top-6">
        <TransactionEditorPanel
          open={editor.isOpen}
          editing={editor.editingTransaction}
          form={editor.form}
          error={editor.error}
          isSaving={editor.isSaving}
          accounts={accounts}
          paymentMethods={paymentMethods}
          categories={categories}
          tags={tags}
          members={members}
          tagDraft={editor.tagDraft}
          expandedSections={editor.expandedSections}
          onStart={() => editor.openEditor()}
          onClose={editor.closeEditor}
          onToggleSection={editor.toggleSection}
          onGroupChange={editor.handleGroupChange}
          onRouteChange={editor.handleRouteChange}
          onAccountChange={editor.handleAccountChange}
          onImmediateBehaviorChange={editor.handleImmediateBehaviorChange}
          onCreditMethodChange={editor.handleCreditMethodChange}
          onFieldChange={editor.updateField}
          onToggleTag={editor.toggleTag}
          onTagDraftChange={editor.setTagDraft}
          onTagAdd={() => void editor.createTag(editor.tagDraft)}
          onTagSuggest={(name) => void editor.createTag(name)}
          onToggleParticipant={editor.toggleParticipant}
          onSave={() => void editor.save()}
        />
      </div>
    </div>
  );
}
'use client';

import { Button } from '@/components/ui/Button';
import { FinanceOverlayShell } from '@/components/finance/drawers/FinanceOverlayShell';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTag,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceComposerRouteState } from '@/lib/navigation/finance-composer-route-state';
import { FinanceTransactionContextStep } from './FinanceTransactionContextStep';
import { FinanceTransactionEssentialStep } from './FinanceTransactionEssentialStep';
import { FinanceTransactionOptionalStep } from './FinanceTransactionOptionalStep';
import { FinanceTransactionSummaryCard } from './FinanceTransactionSummaryCard';
import type {
  FinanceComposerStepKey,
  FinanceTransactionComposerForm,
} from './transaction-composer-model';

type FinanceTransactionModalProps = {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  composerState: FinanceComposerRouteState | null;
  currentStep: FinanceComposerStepKey;
  editing: boolean;
  error: string | null;
  form: FinanceTransactionComposerForm;
  isSaving: boolean;
  paymentMethods: FinancePaymentMethod[];
  steps: FinanceComposerStepKey[];
  tagDraft: string;
  tags: FinanceTag[];
  onBack: () => void;
  onClose: () => void;
  onDelete: () => void;
  onFieldChange: <K extends keyof FinanceTransactionComposerForm>(
    field: K,
    value: FinanceTransactionComposerForm[K],
  ) => void;
  onIntentChange: (intent: FinanceTransactionComposerForm['intent']) => void;
  onNext: () => void;
  onOpenDetails: () => void;
  onSave: (mode: 'close' | 'add-more') => void;
  onTagAdd: () => void;
  onTagDraftChange: (value: string) => void;
  onTagSuggest: (name: string) => void;
  onTagToggle: (tagId: string) => void;
};

export function FinanceTransactionModal({
  accounts,
  categories,
  composerState,
  currentStep,
  editing,
  error,
  form,
  isSaving,
  paymentMethods,
  steps,
  tagDraft,
  tags,
  onBack,
  onClose,
  onDelete,
  onFieldChange,
  onIntentChange,
  onNext,
  onOpenDetails,
  onSave,
  onTagAdd,
  onTagDraftChange,
  onTagSuggest,
  onTagToggle,
}: FinanceTransactionModalProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const isOpen = Boolean(composerState);
  const isLastStep = Boolean(composerState && composerState.step === steps.length);
  const showMoreDetails = currentStep === 'context' && steps.length === 2 && form.intent !== 'credit';
  const stepLabels: Record<FinanceComposerStepKey, string> = {
    essential: isPt ? 'Base' : 'Basics',
    context: isPt ? 'Contexto' : 'Context',
    installments: isPt ? 'Programado' : 'Scheduled',
    details: t.finance.details ?? 'Details',
  };
  const stepDescriptions: Record<FinanceComposerStepKey, string> = {
    essential: isPt ? 'Escolha o tipo, o valor e um nome.' : 'Choose the type, amount, and a short name.',
    context: isPt ? 'Diga por onde isso passa e classifique o básico.' : 'Say where this goes and classify the basics.',
    installments: isPt ? 'Se vai se repetir no crédito, ajuste aqui.' : 'If this repeats on credit, adjust it here.',
    details: isPt ? 'Adicione contexto só se ajudar depois.' : 'Add context only if it will help later.',
  };
  const title = editing
    ? isPt ? 'Editar transação' : 'Edit transaction'
    : t.finance.newTransaction;
  const backLabel = isPt ? 'Voltar' : 'Back';
  const moreDetailsLabel = isPt ? 'Mais detalhes' : 'More details';
  const saveAndAddLabel = isPt ? 'Salvar e adicionar outra' : 'Save and add another';
  const continueLabel = isPt ? 'Continuar' : 'Continue';

  return (
    <FinanceOverlayShell
      open={isOpen}
      title={title}
      description={stepDescriptions[currentStep]}
      size="xl"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <Button variant="danger" onClick={onDelete} disabled={isSaving}>
                Excluir
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {composerState?.step && composerState.step > 1 ? (
              <Button variant="secondary" onClick={onBack} disabled={isSaving}>
                {backLabel}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            {showMoreDetails ? (
              <Button variant="ghost" onClick={onOpenDetails} disabled={isSaving}>
                {moreDetailsLabel}
              </Button>
            ) : null}
            {!editing && isLastStep ? (
              <Button variant="secondary" onClick={() => onSave('add-more')} disabled={isSaving}>
                {saveAndAddLabel}
              </Button>
            ) : null}
            <Button onClick={isLastStep ? () => onSave('close') : onNext} disabled={isSaving}>
              {isLastStep ? (isSaving ? t.finance.saving : t.finance.save) : continueLabel}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)]/55 p-4">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => {
              const active = step === currentStep;
              return (
                <div
                  key={step}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[var(--sidebar)] text-[var(--sidebar-text)]'
                      : 'bg-[var(--surface)] text-[var(--foreground)]/60'
                  }`}
                >
                  {index + 1}. {stepLabels[step]}
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_300px] xl:items-start">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4">
            {currentStep === 'essential' ? (
              <FinanceTransactionEssentialStep
                form={form}
                onIntentChange={onIntentChange}
                onFieldChange={onFieldChange}
              />
            ) : currentStep === 'context' ? (
              <FinanceTransactionContextStep
                accounts={accounts}
                categories={categories}
                form={form}
                paymentMethods={paymentMethods}
                onFieldChange={onFieldChange}
              />
            ) : (
              <FinanceTransactionOptionalStep
                currentStep={currentStep}
                form={form}
                tagDraft={tagDraft}
                tags={tags}
                onFieldChange={onFieldChange}
                onTagAdd={onTagAdd}
                onTagDraftChange={onTagDraftChange}
                onTagSuggest={onTagSuggest}
                onTagToggle={onTagToggle}
              />
            )}
          </div>

          <FinanceTransactionSummaryCard
            accounts={accounts}
            categories={categories}
            form={form}
            paymentMethods={paymentMethods}
          />
        </div>

        {error ? <p className="text-sm text-[var(--expense)]">{error}</p> : null}
      </div>
    </FinanceOverlayShell>
  );
}
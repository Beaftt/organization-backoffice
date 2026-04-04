'use client';

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  type FinancePaymentMethod,
  type FinanceRecurring,
  type FinanceTag,
  type FinanceTransaction,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceComposerRouteState } from '@/lib/navigation/finance-composer-route-state';

import {
  applyComposerIntent,
  buildFinanceComposerFormFromTransaction,
  createFinanceTransactionComposerForm,
  getComposerSteps,
  hasComposerDetails,
  type FinanceTransactionComposerForm,
} from './transaction-composer-model';
import { validateFinanceComposerStep } from './transaction-composer-validation';
import { useFinanceTransactionComposerMutations } from './useFinanceTransactionComposerMutations';

type ComposerDraftState = {
  key: string;
  error: string | null;
  form: FinanceTransactionComposerForm;
  showDetailsStep: boolean;
};

type UseFinanceTransactionComposerParams = {
  composerState: FinanceComposerRouteState | null;
  composerSessionId: number;
  currentUserId: string;
  onClose: () => void;
  onComposerStateChange: (next: FinanceComposerRouteState | null) => void;
  paymentMethods: FinancePaymentMethod[];
  recurring: FinanceRecurring[];
  setRecurring: React.Dispatch<React.SetStateAction<FinanceRecurring[]>>;
  tags: FinanceTag[];
  transactions: FinanceTransaction[];
  reloadTransactions: () => Promise<void>;
  setTags: React.Dispatch<React.SetStateAction<FinanceTag[]>>;
};

const resolveStateAction = <T,>(value: SetStateAction<T>, current: T): T =>
  typeof value === 'function' ? (value as (previous: T) => T)(current) : value;

const getComposerSourceKey = (composerState: FinanceComposerRouteState | null) => {
  if (!composerState) {
    return null;
  }

  return composerState.mode === 'edit'
    ? `edit:${composerState.transactionId ?? 'unknown'}`
    : `create:${composerState.intent}`;
};

export function useFinanceTransactionComposer({
  composerState,
  composerSessionId,
  currentUserId,
  onClose,
  onComposerStateChange,
  paymentMethods,
  recurring,
  setRecurring,
  tags,
  transactions,
  reloadTransactions,
  setTags,
}: UseFinanceTransactionComposerParams) {
  const { t } = useLanguage();
  const [tagDraft, setTagDraft] = useState('');

  const editingTransaction = useMemo(
    () =>
      composerState?.mode === 'edit'
        ? transactions.find((item) => item.id === composerState.transactionId) ?? null
        : null,
    [composerState, transactions],
  );
  const linkedRecurringId = editingTransaction?.recurringId ?? null;
  const composerSourceKey = getComposerSourceKey(composerState);

  const composerSeed = useMemo<ComposerDraftState>(() => {
    const key = `${composerSessionId}:${composerSourceKey ?? 'closed'}`;

    if (composerState?.mode === 'edit' && editingTransaction) {
      const matchedRecurring = linkedRecurringId
        ? recurring.find((item) => item.id === linkedRecurringId) ?? null
        : null;
      const form = buildFinanceComposerFormFromTransaction({
        currentUserId,
        paymentMethods,
        recurring: matchedRecurring,
        transaction: editingTransaction,
      });

      return {
        key,
        error: null,
        form,
        showDetailsStep: hasComposerDetails(form),
      };
    }

    return {
      key,
      error: null,
      form: createFinanceTransactionComposerForm(
        currentUserId,
        composerState?.intent ?? 'expense',
      ),
      showDetailsStep: false,
    };
  }, [
    composerSessionId,
    composerSourceKey,
    composerState?.mode,
    composerState?.intent,
    currentUserId,
    editingTransaction,
    linkedRecurringId,
    paymentMethods,
    recurring,
  ]);

  const [draftState, setDraftState] = useState<ComposerDraftState>(() => composerSeed);
  const activeDraft = draftState.key === composerSeed.key ? draftState : composerSeed;
  const { error, form, showDetailsStep } = activeDraft;
  const steps = useMemo(() => getComposerSteps(form, showDetailsStep), [form, showDetailsStep]);

  const updateDraft = (updater: (current: ComposerDraftState) => ComposerDraftState) => {
    setDraftState((current) => {
      const base = current.key === composerSeed.key ? current : composerSeed;
      return updater(base);
    });
  };

  const setForm: Dispatch<SetStateAction<FinanceTransactionComposerForm>> = (value) => {
    updateDraft((current) => ({
      ...current,
      form: resolveStateAction(value, current.form),
    }));
  };

  const setShowDetailsStep: Dispatch<SetStateAction<boolean>> = (value) => {
    updateDraft((current) => ({
      ...current,
      showDetailsStep: resolveStateAction(value, current.showDetailsStep),
    }));
  };

  const setError: Dispatch<SetStateAction<string | null>> = (value) => {
    updateDraft((current) => ({
      ...current,
      error: resolveStateAction(value, current.error),
    }));
  };

  useEffect(() => {
    if (composerState && composerState.step > steps.length) {
      onComposerStateChange({ ...composerState, step: steps.length as 1 | 2 | 3 });
    }
  }, [composerState, onComposerStateChange, steps.length]);

  const currentStepIndex = composerState ? Math.min(composerState.step, steps.length) : 1;
  const currentStep = composerState ? steps[currentStepIndex - 1] : 'essential';
  const { createTag, isSaving, remove, save } = useFinanceTransactionComposerMutations({
    composerState,
    currentUserId,
    editingTransaction,
    form,
    linkedRecurringId,
    onClose,
    onComposerStateChange,
    reloadTransactions,
    setError,
    setForm,
    setRecurring,
    setShowDetailsStep,
    setTagDraft,
    setTags,
    tagDraft,
    tags,
  });

  const validateCurrentStep = () => {
    const validationError = validateFinanceComposerStep(currentStep, form, {
      accountRequired: 'Selecione uma conta',
      amountRequired: 'Informe um valor válido',
      creditCardRequired: 'Selecione um cartão',
      dateRequired: 'Informe uma data',
      titleMinLength:
        t.finance.titleMinLength ?? 'Informe um título com pelo menos 2 caracteres',
      titleRequired: 'Informe um título',
    });

    setError(validationError);
    return !validationError;
  };

  const goBack = () => {
    if (!composerState || currentStepIndex === 1) {
      return;
    }

    onComposerStateChange({ ...composerState, step: (currentStepIndex - 1) as 1 | 2 | 3 });
  };

  const goNext = () => {
    if (!composerState || !validateCurrentStep() || currentStepIndex >= steps.length) {
      return;
    }

    onComposerStateChange({ ...composerState, step: (currentStepIndex + 1) as 1 | 2 | 3 });
  };

  const openDetails = () => {
    if (!composerState) {
      return;
    }

    setShowDetailsStep(true);
    onComposerStateChange({ ...composerState, step: 3 });
  };

  const updateIntent = (intent: FinanceComposerRouteState['intent']) => {
    if (!composerState) {
      return;
    }

    setForm((current) => applyComposerIntent(current, intent));
    setShowDetailsStep(false);
    onComposerStateChange({ ...composerState, intent, step: 1 });
  };

  return {
    composerState,
    createTag,
    currentStep,
    editingTransaction,
    error,
    form,
    goBack,
    goNext,
    isSaving,
    openDetails,
    remove,
    save,
    setForm,
    setTagDraft,
    steps,
    tagDraft,
    updateIntent,
  };
}
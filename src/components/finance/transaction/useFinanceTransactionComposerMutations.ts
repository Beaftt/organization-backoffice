'use client';

import { useState } from 'react';

import { ApiError } from '@/lib/api/client';
import {
  createFinanceTag,
  listFinanceRecurring,
  type FinanceRecurring,
  type FinanceTag,
  type FinanceTransaction,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceComposerRouteState } from '@/lib/navigation/finance-composer-route-state';

import { createFollowupComposerForm } from './transaction-composer-model';
import type { FinanceTransactionComposerForm } from './transaction-composer-model';
import {
  deleteFinanceComposerTransaction,
  saveFinanceComposerTransaction,
} from './transaction-composer-persistence';

type UseFinanceTransactionComposerMutationsParams = {
  composerState: FinanceComposerRouteState | null;
  currentUserId: string;
  editingTransaction: FinanceTransaction | null;
  form: FinanceTransactionComposerForm;
  linkedRecurring: FinanceRecurring | null;
  linkedRecurringId: string | null;
  onClose: () => void;
  onComposerStateChange: (next: FinanceComposerRouteState | null) => void;
  reloadTransactions: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setForm: React.Dispatch<React.SetStateAction<FinanceTransactionComposerForm>>;
  setRecurring: React.Dispatch<React.SetStateAction<FinanceRecurring[]>>;
  setShowDetailsStep: React.Dispatch<React.SetStateAction<boolean>>;
  setTagDraft: React.Dispatch<React.SetStateAction<string>>;
  setTags: React.Dispatch<React.SetStateAction<FinanceTag[]>>;
  tagDraft: string;
  tags: FinanceTag[];
};

export function useFinanceTransactionComposerMutations({
  composerState,
  currentUserId,
  editingTransaction,
  form,
  linkedRecurring,
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
}: UseFinanceTransactionComposerMutationsParams) {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  const save = async (mode: 'close' | 'add-more') => {
    setIsSaving(true);
    try {
      await saveFinanceComposerTransaction({
        editingTransaction,
        form,
        linkedRecurring,
        linkedRecurringId,
        tags,
      });
      await reloadTransactions();
      setRecurring(await listFinanceRecurring());
      if (mode === 'add-more' && composerState?.mode === 'create') {
        setForm(createFollowupComposerForm(currentUserId, form));
        setShowDetailsStep(false);
        onComposerStateChange({ ...composerState, step: 1 });
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.finance.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (transaction?: FinanceTransaction) => {
    const target = transaction ?? editingTransaction;

    if (!target || !window.confirm(t.finance.deleteConfirmation ?? 'Excluir?')) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteFinanceComposerTransaction(target);
      await reloadTransactions();
      setRecurring(await listFinanceRecurring());
      if (!transaction || editingTransaction?.id === target.id) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.finance.deleteError);
    } finally {
      setIsSaving(false);
    }
  };

  const createTag = async (name?: string) => {
    const value = (name ?? tagDraft).trim();
    if (!value) {
      return;
    }

    const existing = tags.find((tag) => tag.name.toLowerCase() === value.toLowerCase());
    if (existing) {
      setForm((current) => ({
        ...current,
        tagIds: current.tagIds.includes(existing.id) ? current.tagIds : [...current.tagIds, existing.id],
      }));
      setTagDraft('');
      return;
    }

    const created = await createFinanceTag({ name: value });
    setTags((current) => [...current, created]);
    setForm((current) => ({ ...current, tagIds: [...current.tagIds, created.id] }));
    setTagDraft('');
  };

  return {
    createTag,
    isSaving,
    remove,
    save,
  };
}
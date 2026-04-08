import { useCallback, useState } from 'react';
import { createCalendarEvent } from '@/lib/api/calendar';
import { ApiError } from '@/lib/api/client';
import {
  createFinanceRecurring,
  createFinanceTag,
  createFinanceTransaction,
  deleteFinanceRecurring,
  deleteFinanceTransaction,
  listFinanceRecurring,
  updateFinanceRecurring,
  updateFinanceTransaction,
  type FinancePaymentMethod,
  type FinanceRecurring,
  type FinanceTag,
  type FinanceTransaction,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  buildTransactionEditorForm,
  createTransactionEditorForm,
  getDefaultExpandedSections,
  getImmediateBehaviorOptions,
  parseCurrencyInput,
  resolveRecurringPaymentMethodId,
  type TransactionEditorForm,
  type TransactionEditorSection,
  type TransactionImmediateBehaviorKind,
  type TransactionRoute,
} from './transaction-editor-model';

type UseFinanceTransactionsWorkspaceParams = {
  paymentMethods: FinancePaymentMethod[];
  recurring: FinanceRecurring[];
  tags: FinanceTag[];
  currentUserId: string;
  reloadTransactions: () => Promise<void>;
  onTagsUpdated: (tags: FinanceTag[]) => void;
  onRecurringUpdated: (recurring: FinanceRecurring[]) => void;
};

export function useFinanceTransactionsWorkspace({
  paymentMethods,
  recurring,
  tags,
  currentUserId,
  reloadTransactions,
  onTagsUpdated,
  onRecurringUpdated,
}: UseFinanceTransactionsWorkspaceParams) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [editingTransaction, setEditingTransaction] =
    useState<FinanceTransaction | null>(null);
  const [linkedRecurringId, setLinkedRecurringId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<TransactionEditorSection[]>(
    getDefaultExpandedSections(false),
  );
  const [form, setForm] = useState<TransactionEditorForm>(() =>
    createTransactionEditorForm(currentUserId),
  );

  const closeEditor = useCallback(() => {
    setIsOpen(false);
    setError(null);
    setTagDraft('');
    setEditingTransaction(null);
    setLinkedRecurringId(null);
    setExpandedSections(getDefaultExpandedSections(false));
    setForm(createTransactionEditorForm(currentUserId));
  }, [currentUserId]);

  const openEditor = useCallback(
    (transaction?: FinanceTransaction) => {
      const matchedRecurring = transaction?.recurringId
        ? recurring.find((item) => item.id === transaction.recurringId) ?? null
        : null;

      setEditingTransaction(transaction ?? null);
      setLinkedRecurringId(matchedRecurring?.id ?? transaction?.recurringId ?? null);
      setForm(
        buildTransactionEditorForm({
          transaction: transaction ?? null,
          recurring: matchedRecurring,
          paymentMethods,
          currentUserId,
        }),
      );
      setExpandedSections(getDefaultExpandedSections(Boolean(transaction)));
      setTagDraft('');
      setError(null);
      setIsOpen(true);
    },
    [currentUserId, paymentMethods, recurring],
  );

  const toggleSection = useCallback((section: TransactionEditorSection) => {
    setExpandedSections((current) =>
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section],
    );
  }, []);

  const updateField = useCallback(
    <K extends keyof TransactionEditorForm>(field: K, value: TransactionEditorForm[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const handleGroupChange = useCallback(
    (group: TransactionEditorForm['group']) => {
      setForm((current) => {
        const selectedMethod = paymentMethods.find(
          (paymentMethod) => paymentMethod.id === current.paymentMethodId,
        );
        const shouldResetMethod =
          selectedMethod?.type === 'CREDIT' ||
          (group === 'INCOME' && selectedMethod?.type === 'DEBIT');

        return {
          ...current,
          group,
          route: group === 'INCOME' ? 'IMMEDIATE' : current.route,
          paymentMethodId: shouldResetMethod ? '' : current.paymentMethodId,
          immediateBehavior: shouldResetMethod ? 'BALANCE' : current.immediateBehavior,
          isRecurring:
            group === 'INCOME' && current.route === 'CREDIT' ? false : current.isRecurring,
        };
      });
    },
    [paymentMethods],
  );

  const handleRouteChange = useCallback(
    (route: TransactionRoute) => {
      setForm((current) => {
        const selectedMethod = paymentMethods.find(
          (paymentMethod) => paymentMethod.id === current.paymentMethodId,
        );

        if (route === 'CREDIT') {
          return {
            ...current,
            route,
            isRecurring: false,
            isSubscription: false,
            immediateBehavior: 'BALANCE',
            paymentMethodId: selectedMethod?.type === 'CREDIT' ? current.paymentMethodId : '',
          };
        }

        return {
          ...current,
          route,
          paymentMethodId: selectedMethod?.type === 'CREDIT' ? '' : current.paymentMethodId,
          immediateBehavior:
            selectedMethod?.type === 'CREDIT' ? 'BALANCE' : current.immediateBehavior,
          installments: selectedMethod?.type === 'CREDIT' ? 1 : current.installments,
        };
      });
    },
    [paymentMethods],
  );

  const handleAccountChange = useCallback(
    (accountId: string) => {
      setForm((current) => {
        const nextOptions = getImmediateBehaviorOptions(
          accountId,
          paymentMethods,
          current.group,
          current.paymentMethodId,
        );
        const preservedOption = nextOptions.find(
          (option) => option.paymentMethodId === current.paymentMethodId,
        );

        return {
          ...current,
          route: 'IMMEDIATE',
          accountId,
          immediateBehavior: preservedOption?.kind ?? 'BALANCE',
          paymentMethodId: preservedOption?.paymentMethodId ?? '',
        };
      });
    },
    [paymentMethods],
  );

  const handleImmediateBehaviorChange = useCallback(
    (kind: TransactionImmediateBehaviorKind, paymentMethodId?: string) => {
      setForm((current) => ({
        ...current,
        route: 'IMMEDIATE',
        immediateBehavior: kind,
        paymentMethodId: paymentMethodId ?? '',
      }));
    },
    [],
  );

  const handleCreditMethodChange = useCallback(
    (paymentMethodId: string) => {
      const selectedMethod = paymentMethods.find(
        (paymentMethod) => paymentMethod.id === paymentMethodId,
      );

      setForm((current) => ({
        ...current,
        route: 'CREDIT',
        paymentMethodId,
        accountId: selectedMethod?.accountId ?? current.accountId,
        isRecurring: false,
        isSubscription: false,
      }));
    },
    [paymentMethods],
  );

  const toggleTag = useCallback((tagId: string) => {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId],
    }));
  }, []);

  const toggleParticipant = useCallback((userId: string) => {
    setForm((current) => ({
      ...current,
      participantIds: current.participantIds.includes(userId)
        ? current.participantIds.filter((id) => id !== userId)
        : [...current.participantIds, userId],
    }));
  }, []);

  const createTag = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return;
      }

      const existingTag = tags.find(
        (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase(),
      );

      if (existingTag) {
        toggleTag(existingTag.id);
        setTagDraft('');
        return;
      }

      const created = await createFinanceTag({ name: trimmedName });
      onTagsUpdated([...tags, created]);
      setForm((current) => ({ ...current, tagIds: [...current.tagIds, created.id] }));
      setTagDraft('');
    },
    [onTagsUpdated, tags, toggleTag],
  );

  const refreshRecurring = useCallback(async () => {
    onRecurringUpdated(await listFinanceRecurring());
  }, [onRecurringUpdated]);

  const save = useCallback(async () => {
    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      setError(t.finance.titleRequired ?? 'Informe um titulo');
      return;
    }
    if (trimmedTitle.length < 2) {
      setError(
        t.finance.titleMinLength ??
          'Informe um título com pelo menos 2 caracteres',
      );
      return;
    }
    if (!form.amount || !parseCurrencyInput(form.amount)) {
      setError(t.finance.amountRequired ?? 'Informe um valor valido');
      return;
    }
    if (!form.occurredAt) {
      setError(t.finance.dateRequired ?? 'Informe uma data');
      return;
    }
    if (form.route === 'IMMEDIATE' && !form.accountId) {
      setError(t.finance.accountRequired ?? 'Selecione uma conta');
      return;
    }
    if (form.route === 'CREDIT' && !form.paymentMethodId) {
      setError(t.finance.creditCardRequired ?? 'Selecione um cartao');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        title: trimmedTitle,
        amount: parseCurrencyInput(form.amount),
        currency: form.currency,
        group: form.group,
        status:
          form.route === 'CREDIT' && form.installments > 1 ? 'PENDING' : form.status,
        occurredAt: form.occurredAt,
        accountId: form.accountId || null,
        paymentMethodId:
          form.route === 'CREDIT'
            ? form.paymentMethodId || null
            : form.immediateBehavior === 'BALANCE'
              ? null
              : form.paymentMethodId || null,
        categoryId: form.categoryId || null,
        tagIds: form.tagIds,
        participantIds: form.participantIds.length > 0 ? form.participantIds : null,
        description: form.description.trim() || null,
      };

      const selectedTagNames = tags
        .filter((tag) => payload.tagIds?.includes(tag.id))
        .map((tag) => tag.name);
      const nextDue = form.occurredAt;
      const isSemiannual = form.recurrenceFrequency === 'SEMIANNUAL';
      const resolvedFrequency = (
        isSemiannual ? 'MONTHLY' : form.recurrenceFrequency
      ) as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
      const resolvedInterval = isSemiannual ? 6 : Number(form.recurrenceInterval) || 1;
      const resolvedEndDate = form.recurrenceEndDate || null;
      const canPersistRecurring = form.isRecurring && form.route !== 'CREDIT';
      const linkedRecurring = linkedRecurringId
        ? recurring.find((item) => item.id === linkedRecurringId) ?? null
        : null;

      if (editingTransaction) {
        let nextRecurringId = linkedRecurringId;

        if (canPersistRecurring) {
          if (linkedRecurringId) {
            await updateFinanceRecurring({
              id: linkedRecurringId,
              title: payload.title,
              amount: payload.amount,
              currency: payload.currency,
              group: payload.group,
              frequency: resolvedFrequency,
              interval: resolvedInterval,
              nextDue,
              endDate: resolvedEndDate,
              isSubscription: form.isSubscription,
              accountId: payload.accountId,
              paymentMethodId: resolveRecurringPaymentMethodId(form, linkedRecurring),
              categoryId: payload.categoryId,
              tagIds: payload.tagIds,
            });
          } else {
            const created = await createFinanceRecurring({
              title: payload.title,
              amount: payload.amount,
              currency: payload.currency,
              group: payload.group,
              frequency: resolvedFrequency,
              interval: resolvedInterval,
              nextDue,
              endDate: resolvedEndDate,
              isSubscription: form.isSubscription,
              accountId: payload.accountId,
              paymentMethodId: resolveRecurringPaymentMethodId(form, linkedRecurring),
              categoryId: payload.categoryId,
              tagIds: payload.tagIds,
            });
            nextRecurringId = created.id;
          }
        } else if (linkedRecurringId) {
          await deleteFinanceRecurring({ id: linkedRecurringId });
          nextRecurringId = null;
        }

        await updateFinanceTransaction({
          id: editingTransaction.id,
          ...payload,
          recurringId: nextRecurringId,
          installmentTotal:
            editingTransaction.installmentTotal && editingTransaction.installmentTotal > 1
              ? form.installments
              : undefined,
          isInstallmentValue:
            editingTransaction.installmentTotal && editingTransaction.installmentTotal > 1
              ? form.isInstallmentValue
              : undefined,
        });
      } else {
        let nextRecurringId: string | null = null;

        if (canPersistRecurring) {
          const created = await createFinanceRecurring({
            title: payload.title,
            amount: payload.amount,
            currency: payload.currency,
            group: payload.group,
            frequency: resolvedFrequency,
            interval: resolvedInterval,
            nextDue,
            endDate: resolvedEndDate,
            isSubscription: form.isSubscription,
            accountId: payload.accountId,
            paymentMethodId: resolveRecurringPaymentMethodId(form, linkedRecurring),
            categoryId: payload.categoryId,
            tagIds: payload.tagIds,
          });
          nextRecurringId = created.id;
        }

        await createFinanceTransaction({
          ...payload,
          recurringId: nextRecurringId,
          installments: form.route === 'CREDIT' ? form.installments : undefined,
          isInstallmentValue:
            form.route === 'CREDIT' ? form.isInstallmentValue : undefined,
        });

        if (canPersistRecurring && form.addToCalendar) {
          const startAt = new Date(`${form.occurredAt}T09:00:00`);
          const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
          await createCalendarEvent({
            title: payload.title,
            description: payload.description ?? null,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
            allDay: false,
            tags: selectedTagNames.length > 0 ? selectedTagNames : null,
            recurrence: {
              frequency: resolvedFrequency,
              interval: resolvedInterval,
            },
          });
        }
      }

      await reloadTransactions();
      await refreshRecurring();
      closeEditor();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.finance.saveError);
    } finally {
      setIsSaving(false);
    }
  }, [
    closeEditor,
    editingTransaction,
    form,
    linkedRecurringId,
    refreshRecurring,
    reloadTransactions,
    recurring,
    t.finance.amountRequired,
    t.finance.dateRequired,
    t.finance.accountRequired,
    t.finance.creditCardRequired,
    t.finance.saveError,
    t.finance.titleMinLength,
    t.finance.titleRequired,
    tags,
  ]);

  const remove = useCallback(
    async (transaction: FinanceTransaction) => {
      const confirmed = window.confirm(
        t.finance.deleteConfirmation ?? 'Deseja excluir esta transacao?',
      );
      if (!confirmed) {
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        await deleteFinanceTransaction({ id: transaction.id });
        if (transaction.recurringId) {
          await deleteFinanceRecurring({ id: transaction.recurringId });
        }
        await reloadTransactions();
        await refreshRecurring();
        if (editingTransaction?.id === transaction.id) {
          closeEditor();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.finance.deleteError);
      } finally {
        setIsSaving(false);
      }
    },
    [closeEditor, editingTransaction?.id, refreshRecurring, reloadTransactions, t],
  );

  return {
    isOpen,
    isSaving,
    error,
    form,
    tagDraft,
    expandedSections,
    editingTransaction,
    openEditor,
    closeEditor,
    toggleSection,
    updateField,
    handleGroupChange,
    handleRouteChange,
    handleAccountChange,
    handleImmediateBehaviorChange,
    handleCreditMethodChange,
    toggleTag,
    toggleParticipant,
    save,
    remove,
    setTagDraft,
    createTag,
  };
}
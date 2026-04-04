import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { ApiError } from '@/lib/api/client';
import {
  createFinanceAccount,
  deleteFinanceAccount,
  updateFinanceAccount,
  type FinanceAccount,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';

import { emptyAccountForm, type AccountFormState } from './setup-state-model';

type UseFinanceSetupAccountsParams = {
  setAccounts: Dispatch<SetStateAction<FinanceAccount[]>>;
};

export function useFinanceSetupAccounts({
  setAccounts,
}: UseFinanceSetupAccountsParams) {
  const { t } = useLanguage();
  const [accountForm, setAccountForm] = useState<AccountFormState>(emptyAccountForm);
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openAccountDrawer = useCallback((account?: FinanceAccount) => {
    setAccountFormError(null);
    if (account) {
      setEditingAccount(account);
      setAccountForm({
        name: account.name,
        type: account.type,
        currency: account.currency,
        isPrimary: account.isPrimary,
      });
    } else {
      setEditingAccount(null);
      setAccountForm(emptyAccountForm);
    }
    setAccountDrawerOpen(true);
  }, []);

  const closeAccountDrawer = useCallback(() => {
    setAccountDrawerOpen(false);
    setEditingAccount(null);
    setAccountForm(emptyAccountForm);
    setAccountFormError(null);
  }, []);

  const saveAccount = useCallback(async () => {
    if (!accountForm.name.trim()) {
      setAccountFormError(t.finance.accountRequired ?? t.finance.accountLabel);
      return;
    }

    setIsSaving(true);
    setAccountFormError(null);
    try {
      if (editingAccount) {
        const updated = await updateFinanceAccount({
          id: editingAccount.id,
          name: accountForm.name.trim(),
          type: accountForm.type,
          currency: accountForm.currency,
          isPrimary: accountForm.isPrimary,
        });
        setAccounts((current) =>
          current
            .map((account) =>
              account.id === updated.id
                ? updated
                : updated.isPrimary
                  ? { ...account, isPrimary: false }
                  : account,
            )
            .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary)),
        );
      } else {
        const created = await createFinanceAccount({
          name: accountForm.name.trim(),
          type: accountForm.type,
          currency: accountForm.currency,
          isPrimary: accountForm.isPrimary,
        });
        setAccounts((current) => {
          const normalized = accountForm.isPrimary
            ? current.map((account) => ({ ...account, isPrimary: false }))
            : current;
          return [...normalized, created].sort(
            (left, right) => Number(right.isPrimary) - Number(left.isPrimary),
          );
        });
      }

      closeAccountDrawer();
    } catch (err) {
      setAccountFormError(
        err instanceof ApiError ? err.message : t.finance.saveError ?? 'Unable to save.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [accountForm, closeAccountDrawer, editingAccount, setAccounts, t]);

  const removeAccount = useCallback(async (account: FinanceAccount) => {
    const confirmed = window.confirm(
      t.finance.deleteAccountConfirm ?? 'Delete this account?',
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteFinanceAccount({ id: account.id });
      setAccounts((current) => current.filter((item) => item.id !== account.id));
    } finally {
      setIsSaving(false);
    }
  }, [setAccounts, t]);

  return {
    accountDrawerOpen,
    accountForm,
    accountFormError,
    closeAccountDrawer,
    editingAccount,
    isSaving,
    openAccountDrawer,
    removeAccount,
    saveAccount,
    setAccountForm,
  };
}
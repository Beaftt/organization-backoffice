import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/client';
import type {
  FinanceAccount,
  FinanceCardBill,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceRecurring,
  FinanceTag,
} from '@/lib/api/finance';
import { loadFinanceBaseSnapshot } from '@/lib/finance/finance-action-adapter';
import { useLanguage } from '@/lib/i18n/language-context';

export function useFinanceSetupData() {
  const { t } = useLanguage();
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<FinancePaymentMethod[]>([]);
  const [cardBills, setCardBills] = useState<Record<string, FinanceCardBill>>({});
  const [recurring, setRecurring] = useState<FinanceRecurring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSetupData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await loadFinanceBaseSnapshot();
      setTags(snapshot.tags);
      setCategories(snapshot.categories);
      setAccounts(snapshot.accounts);
      setPaymentMethods(snapshot.paymentMethods);
      setCardBills(snapshot.cardBills);
      setRecurring(snapshot.recurring);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.finance.loadError ?? 'Unable to load finance setup.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSetupData();
  }, [loadSetupData]);

  return {
    accounts,
    cardBills,
    categories,
    error,
    isLoading,
    loadSetupData,
    paymentMethods,
    recurring,
    setAccounts,
    setCardBills,
    setCategories,
    setPaymentMethods,
    setRecurring,
    setTags,
    tags,
  };
}
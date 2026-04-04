import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { ApiError } from '@/lib/api/client';
import type { FinancePaymentMethod } from '@/lib/api/finance';
import {
  runFinanceInvestmentMovement,
  runFinanceInvestmentTransfer,
} from '@/lib/finance/finance-action-adapter';
import { useLanguage } from '@/lib/i18n/language-context';

import { parseCurrencyInput, todayInput } from './setup-form-utils';
import { emptyInvestmentAction, type InvestmentActionState } from './setup-state-model';

type UseFinanceSetupInvestmentsParams = {
  onMovementSaved?: () => Promise<void> | void;
  paymentMethods: FinancePaymentMethod[];
  setPaymentMethods: Dispatch<SetStateAction<FinancePaymentMethod[]>>;
};

export function useFinanceSetupInvestments({
  onMovementSaved,
  paymentMethods,
  setPaymentMethods,
}: UseFinanceSetupInvestmentsParams) {
  const { t } = useLanguage();
  const [investmentAction, setInvestmentAction] = useState<InvestmentActionState>({
    ...emptyInvestmentAction,
    occurredAt: todayInput(),
  });
  const [isSaving, setIsSaving] = useState(false);

  const openInvestmentAction = useCallback(
    (mode: 'deposit' | 'withdraw' | 'transfer', target?: FinancePaymentMethod) => {
      setInvestmentAction({
        mode,
        step: 1,
        targetInvestmentId: target?.id ?? '',
        fromInvestmentId: target?.id ?? '',
        toInvestmentId: '',
        accountId: target?.accountId ?? '',
        amount: '',
        occurredAt: todayInput(),
        error: null,
      });
    },
    [],
  );

  const closeInvestmentAction = useCallback(() => {
    setInvestmentAction({
      ...emptyInvestmentAction,
      occurredAt: todayInput(),
    });
  }, []);

  const continueInvestmentAction = useCallback(() => {
    const amount = parseCurrencyInput(investmentAction.amount);
    if (!investmentAction.mode || !amount || amount <= 0) {
      setInvestmentAction((current) => ({
        ...current,
        error: t.finance.amountRequired ?? 'Provide an amount.',
      }));
      return;
    }

    if (investmentAction.mode === 'transfer') {
      if (!investmentAction.fromInvestmentId || !investmentAction.toInvestmentId) {
        setInvestmentAction((current) => ({
          ...current,
          error: t.finance.accountRequired ?? 'Choose the transfer endpoints.',
        }));
        return;
      }

      if (investmentAction.fromInvestmentId === investmentAction.toInvestmentId) {
        setInvestmentAction((current) => ({
          ...current,
          error: 'Choose different investments.',
        }));
        return;
      }
    } else if (!investmentAction.targetInvestmentId) {
      setInvestmentAction((current) => ({
        ...current,
        error: 'Choose an investment.',
      }));
      return;
    }

    setInvestmentAction((current) => ({
      ...current,
      error: null,
      step: 2,
    }));
  }, [investmentAction, t]);

  const submitInvestmentAction = useCallback(async () => {
    if (!investmentAction.mode) {
      return;
    }

    const amount = parseCurrencyInput(investmentAction.amount);
    setIsSaving(true);
    try {
      if (investmentAction.mode === 'transfer') {
        const transfer = await runFinanceInvestmentTransfer({
          fromInvestmentId: investmentAction.fromInvestmentId,
          toInvestmentId: investmentAction.toInvestmentId,
          amount,
        });
        setPaymentMethods((current) =>
          current.map((item) => {
            if (item.id === transfer.from.id) {
              return transfer.from;
            }
            if (item.id === transfer.to.id) {
              return transfer.to;
            }
            return item;
          }),
        );
      } else {
        const target = paymentMethods.find(
          (item) => item.id === investmentAction.targetInvestmentId,
        );

        if (!target) {
          throw new Error('Investment not found');
        }

        const movement = await runFinanceInvestmentMovement({
          mode: investmentAction.mode,
          paymentMethod: target,
          amount,
          occurredAt: investmentAction.occurredAt,
          accountId: investmentAction.accountId || null,
        });

        setPaymentMethods((current) =>
          current.map((item) =>
            item.id === movement.updatedPaymentMethod.id
              ? movement.updatedPaymentMethod
              : item,
          ),
        );
      }

      await onMovementSaved?.();

      closeInvestmentAction();
    } catch (err) {
      setInvestmentAction((current) => ({
        ...current,
        error: err instanceof ApiError ? err.message : t.finance.saveError ?? 'Unable to save.',
      }));
    } finally {
      setIsSaving(false);
    }
  }, [
    closeInvestmentAction,
    investmentAction,
    onMovementSaved,
    paymentMethods,
    setPaymentMethods,
    t,
  ]);

  return {
    closeInvestmentAction,
    continueInvestmentAction,
    investmentAction,
    isSaving,
    openInvestmentAction,
    setInvestmentAction,
    submitInvestmentAction,
  };
}
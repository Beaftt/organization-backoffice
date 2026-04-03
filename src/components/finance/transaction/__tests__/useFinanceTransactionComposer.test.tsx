import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFinanceTransactionComposer } from '@/components/finance/transaction/useFinanceTransactionComposer';

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {
      finance: {
        titleMinLength: 'Informe um título com pelo menos 2 caracteres.',
      },
    },
  }),
}));

vi.mock('@/components/finance/transaction/useFinanceTransactionComposerMutations', () => ({
  useFinanceTransactionComposerMutations: () => ({
    createTag: vi.fn(),
    isSaving: false,
    remove: vi.fn(),
    save: vi.fn(),
  }),
}));

describe('useFinanceTransactionComposer', () => {
  const onClose = vi.fn();
  const onComposerStateChange = vi.fn();
  const paymentMethods = [];
  const recurring = [];
  const tags = [];
  const transactions = [];
  const reloadTransactions = vi.fn().mockResolvedValue(undefined);
  const setRecurring = vi.fn();
  const setTags = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets a validation error instead of throwing when the title is too short', () => {
    const composerState = {
      mode: 'create',
      intent: 'expense',
      step: 1,
      transactionId: null,
    } as const;

    const { result } = renderHook(() =>
      useFinanceTransactionComposer({
        composerState,
        currentUserId: 'user-1',
        onClose,
        onComposerStateChange,
        paymentMethods,
        recurring,
        reloadTransactions,
        setRecurring,
        setTags,
        tags,
        transactions,
      }),
    );

    act(() => {
      result.current.setForm((current) => ({
        ...current,
        amount: '12345',
        title: 'A',
      }));
    });

    expect(() => {
      act(() => {
        result.current.goNext();
      });
    }).not.toThrow();
    expect(result.current.error).toBe(
      'Informe um título com pelo menos 2 caracteres.',
    );
    expect(onComposerStateChange).not.toHaveBeenCalled();
  });

  it('preserves the filled create form when only the composer step changes', () => {
    const initialComposerState = {
      mode: 'create',
      intent: 'expense',
      step: 1,
      transactionId: null,
    } as const;

    const { result, rerender } = renderHook(
      ({ composerState }) =>
        useFinanceTransactionComposer({
          composerState,
          currentUserId: 'user-1',
          onClose,
          onComposerStateChange,
          paymentMethods,
          recurring,
          reloadTransactions,
          setRecurring,
          setTags,
          tags,
          transactions,
        }),
      {
        initialProps: {
          composerState: initialComposerState,
        },
      },
    );

    act(() => {
      result.current.setForm((current) => ({
        ...current,
        amount: '12345',
        title: 'Mercado',
      }));
    });

    rerender({
      composerState: {
        ...initialComposerState,
        step: 2,
      },
    });

    expect(result.current.form.title).toBe('Mercado');
    expect(result.current.form.amount).toBe('12345');
    expect(result.current.currentStep).toBe('context');
  });
});
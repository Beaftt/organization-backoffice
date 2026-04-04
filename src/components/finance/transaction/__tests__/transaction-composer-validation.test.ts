import { describe, expect, it } from 'vitest';

import { createFinanceTransactionComposerForm } from '../transaction-composer-model';
import { validateFinanceComposerStep } from '../transaction-composer-validation';

describe('transaction-composer-validation', () => {
  it('returns the required message when the title is empty', () => {
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    expect(
      validateFinanceComposerStep('essential', form, {
        titleRequired: 'Provide a title.',
      }),
    ).toBe('Provide a title.');
  });

  it('returns the minimum-length message when the title has one character', () => {
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    form.title = 'A';

    expect(
      validateFinanceComposerStep('essential', form, {
        titleMinLength: 'Use at least 2 characters.',
      }),
    ).toBe('Use at least 2 characters.');
  });

  it('accepts essential data when the title and amount are valid', () => {
    const form = createFinanceTransactionComposerForm('user-1', 'expense');

    form.title = 'Almoço';
    form.amount = '12345';

    expect(validateFinanceComposerStep('essential', form, {})).toBeNull();
  });
});
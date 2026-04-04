import { parseCurrencyInput } from './transaction-editor-model';
import type {
  FinanceComposerStepKey,
  FinanceTransactionComposerForm,
} from './transaction-composer-model';

type FinanceComposerValidationMessages = {
  accountRequired?: string;
  amountRequired?: string;
  creditCardRequired?: string;
  dateRequired?: string;
  titleMinLength?: string;
  titleRequired?: string;
};

export function validateFinanceComposerStep(
  currentStep: FinanceComposerStepKey,
  form: FinanceTransactionComposerForm,
  messages: FinanceComposerValidationMessages,
) {
  if (currentStep === 'essential') {
    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      return messages.titleRequired ?? 'Informe um título';
    }

    if (trimmedTitle.length < 2) {
      return (
        messages.titleMinLength ??
        'Informe um título com pelo menos 2 caracteres'
      );
    }

    if (!form.amount || !parseCurrencyInput(form.amount)) {
      return messages.amountRequired ?? 'Informe um valor válido';
    }
  }

  if (currentStep === 'context') {
    if (!form.occurredAt) {
      return messages.dateRequired ?? 'Informe uma data';
    }

    if (form.route === 'IMMEDIATE' && !form.accountId) {
      return messages.accountRequired ?? 'Selecione uma conta';
    }

    if (form.route === 'CREDIT' && !form.paymentMethodId) {
      return messages.creditCardRequired ?? 'Selecione um cartão';
    }
  }

  if (currentStep === 'installments' && form.installments < 2) {
    return 'Informe por quantos meses essa cobrança vai se repetir';
  }

  if (currentStep === 'details' && form.isRecurring) {
    if (form.programmedChargeEndMode === 'end-date' && !form.recurrenceEndDate) {
      return 'Informe quando essa cobrança programada termina';
    }

    if (
      form.programmedChargeEndMode === 'times' &&
      (!Number.isInteger(Number(form.programmedChargeCount)) ||
        Number(form.programmedChargeCount) < 2)
    ) {
      return 'Informe quantas vezes essa cobrança programada vai acontecer';
    }
  }

  return null;
}
export const formatCurrencyDigits = (digits: string, currency: string) => {
  if (!digits) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(digits) / 100);
};

export const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
};

export const dateFromDay = (day?: number | null) => {
  if (!day) {
    return '';
  }

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const dayValue = String(day).padStart(2, '0');
  return `${year}-${month}-${dayValue}`;
};

export const dayFromDateString = (value: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getDate();
};

export const todayInput = (date: Date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
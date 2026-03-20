export function formatCurrency(
  value: number,
  currency = 'BRL',
  locale = 'pt-BR',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString.slice(0, 10) + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getGroupColors(group: 'INCOME' | 'EXPENSE') {
  if (group === 'INCOME') {
    return { text: 'text-[var(--income)]', bg: 'bg-[var(--income-muted)]' };
  }
  return { text: 'text-[var(--expense)]', bg: 'bg-[var(--expense-muted)]' };
}

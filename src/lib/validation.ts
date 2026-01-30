export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const stripPhone = (value: string) => value.replace(/\D+/g, "");

export const formatPhone = (value: string) => {
  const digits = stripPhone(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  if (digits.length <= 6) {
    return `(${ddd}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${ddd}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

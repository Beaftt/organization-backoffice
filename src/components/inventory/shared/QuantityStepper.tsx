'use client';

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
};

export function QuantityStepper({ value, min, max, onChange }: Props) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-[var(--border)]">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center bg-[var(--surface-muted)] text-lg font-medium transition-colors hover:bg-[var(--border)] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <div className="flex-1 py-2 text-center text-base font-bold text-[var(--foreground)]">
        {value}
      </div>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center bg-[var(--surface-muted)] text-lg font-medium transition-colors hover:bg-[var(--border)] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

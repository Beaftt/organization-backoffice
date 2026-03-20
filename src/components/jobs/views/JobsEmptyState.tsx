'use client';

type Props = {
  title: string;
  subtitle: string;
  cta: string;
  onCreate: () => void;
};

export function JobsEmptyState({ title, subtitle, cta, onCreate }: Props) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/30 px-6 text-center">
      <p className="text-base font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-[var(--foreground)]/55">{subtitle}</p>
      <button
        type="button"
        className="mt-4 rounded-full bg-[var(--sidebar)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        onClick={onCreate}
      >
        {cta}
      </button>
    </div>
  );
}
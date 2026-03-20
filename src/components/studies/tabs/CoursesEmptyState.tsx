'use client';

type Props = {
  title: string;
  subtitle: string;
  cta: string;
  onCreate: () => void;
};

export function CoursesEmptyState({ title, subtitle, cta, onCreate }: Props) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sidebar)]/10 text-2xl">
        📚
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--foreground)]/55">{subtitle}</p>
      <button
        type="button"
        className="mt-4 rounded-full bg-[var(--sidebar)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        onClick={onCreate}
      >
        {cta}
      </button>
    </div>
  );
}

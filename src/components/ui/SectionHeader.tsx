interface SectionHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export function SectionHeader({ title, description, eyebrow }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]/60">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-3xl text-base text-[var(--foreground)]/70 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

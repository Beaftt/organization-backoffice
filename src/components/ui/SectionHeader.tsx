interface SectionHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export function SectionHeader({ title, description, eyebrow }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-3xl text-base text-zinc-600 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

'use client';

type Props = {
  doneCount: number;
  totalCount: number;
  ofLabel: string;
  completedLabel: string;
};

export function ListProgressBar({ doneCount, totalCount, ofLabel, completedLabel }: Props) {
  if (totalCount === 0) return null;

  const percent = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="flex flex-col gap-1.5 px-6 py-2">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          {doneCount} {ofLabel} {totalCount} {completedLabel}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--sidebar)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

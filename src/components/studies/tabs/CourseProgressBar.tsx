'use client';

type Props = {
  progress: number;
  completed: boolean;
  label: string;
};

export function CourseProgressBar({ progress, completed, label }: Props) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-[10px] text-[var(--foreground)]/50">{label}</span>
        <span className="text-[10px] font-semibold text-[var(--foreground)]">{safeProgress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            completed ? 'bg-emerald-500' : 'bg-[var(--sidebar)]'
          }`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
}

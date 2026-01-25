type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--border)]/70 ${className}`}
      aria-hidden="true"
    />
  );
}

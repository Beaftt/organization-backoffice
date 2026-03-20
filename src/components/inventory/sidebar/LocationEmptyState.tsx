'use client';

type Props = {
  noLocationsTitle: string;
  noLocationsHint: string;
};

export function LocationEmptyState({ noLocationsTitle, noLocationsHint }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-10 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--foreground)]/40"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <p className="text-xs font-semibold text-[var(--foreground)]/60">{noLocationsTitle}</p>
      <p className="text-[10px] text-[var(--foreground)]/50">{noLocationsHint}</p>
    </div>
  );
}

'use client';

type Props = {
  emptyListTitle: string;
  emptyListSubtitle: string;
};

export function ListEmptyState({ emptyListTitle, emptyListSubtitle }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-300"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="15" x2="11" y2="15" />
      </svg>
      <p className="text-sm font-medium text-zinc-400">{emptyListTitle}</p>
      <p className="text-xs text-zinc-400">{emptyListSubtitle}</p>
    </div>
  );
}

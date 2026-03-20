'use client';

type Props = {
  title: string;
  hint: string;
  onAdd: () => void;
  addLabel: string;
};

export function ItemEmptyState({ title, hint, onAdd, addLabel }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
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
        className="text-[var(--foreground)]/30"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]/60">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--foreground)]/50">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        {addLabel}
      </button>
    </div>
  );
}

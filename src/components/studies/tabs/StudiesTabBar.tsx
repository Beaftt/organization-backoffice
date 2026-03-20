'use client';

import type { StudyTab } from '../types';

type Props = {
  activeTab: StudyTab;
  labels: Record<StudyTab, string>;
  onChange: (tab: StudyTab) => void;
};

const TABS: StudyTab[] = ['all', 'active', 'paused', 'completed'];

export function StudiesTabBar({ activeTab, labels, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-2.5">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? 'border-[var(--sidebar)] bg-[var(--sidebar)] text-white'
                : 'border-[var(--border)] bg-transparent text-[var(--foreground)]/65 hover:border-[var(--sidebar)]/40 hover:text-[var(--foreground)]'
            }`}
            onClick={() => onChange(tab)}
          >
            {labels[tab]}
          </button>
        );
      })}
    </div>
  );
}

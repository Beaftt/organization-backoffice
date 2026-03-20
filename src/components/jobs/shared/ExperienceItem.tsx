'use client';

import { useState } from 'react';
import type { ResumeExperience } from '../types';

type Props = {
  experience: ResumeExperience;
  labels: {
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    collapse: string;
    remove: string;
  };
  onChange: (value: ResumeExperience) => void;
  onDelete: (id: string) => void;
};

export function ExperienceItem({ experience, labels, onChange, onDelete }: Props) {
  const [expanded, setExpanded] = useState(!experience.role && !experience.company);
  const hasSummary = Boolean(experience.role);
  const period = [experience.startDate, experience.endDate || (experience.startDate ? 'Atual' : '')].filter(Boolean).join(' – ');

  if (!expanded && hasSummary) {
    return (
      <div
        className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-left transition-colors hover:bg-[var(--border)]/60"
        onClick={() => setExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setExpanded(true);
          }
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{experience.role || '—'}</p>
          <p className="text-xs text-[var(--foreground)]/50">
            {[experience.company, period].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        <div className="ml-2 flex items-center gap-1.5">
          <button
            type="button"
            className="text-xs text-[var(--foreground)]/45 transition hover:text-[var(--foreground)]"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(true);
            }}
          >
            ✎
          </button>
          <button
            type="button"
            className="text-xs text-[var(--foreground)]/45 transition hover:text-[var(--danger-text)]"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(experience.id);
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.role} value={experience.role} onChange={(event) => onChange({ ...experience, role: event.target.value })} />
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.company} value={experience.company} onChange={(event) => onChange({ ...experience, company: event.target.value })} />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.startDate} value={experience.startDate} onChange={(event) => onChange({ ...experience, startDate: event.target.value })} />
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.endDate} value={experience.endDate} onChange={(event) => onChange({ ...experience, endDate: event.target.value })} />
      </div>
      <textarea
        rows={2}
        className="mt-2 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]"
        placeholder={labels.description}
        value={experience.description}
        onChange={(event) => onChange({ ...experience, description: event.target.value })}
      />
      <div className="mt-2 flex items-center justify-between">
        <button type="button" className="text-[11px] text-[var(--foreground)]/45 disabled:opacity-40" onClick={() => setExpanded(false)} disabled={!experience.role}>
          {labels.collapse}
        </button>
        <button type="button" className="text-[11px] font-semibold text-[var(--danger-text)]" onClick={() => onDelete(experience.id)}>
          {labels.remove}
        </button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import type { ResumeEducation } from '../types';

type Props = {
  education: ResumeEducation;
  labels: {
    institution: string;
    course: string;
    startYear: string;
    endYear: string;
    collapse: string;
    remove: string;
  };
  onChange: (value: ResumeEducation) => void;
  onDelete: (id: string) => void;
};

export function EducationItem({ education, labels, onChange, onDelete }: Props) {
  const [expanded, setExpanded] = useState(!education.course && !education.institution);
  const hasSummary = Boolean(education.course);
  const period = [education.startYear, education.endYear || (education.startYear ? 'Atual' : '')].filter(Boolean).join(' – ');

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
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{education.course || '—'}</p>
          <p className="text-xs text-[var(--foreground)]/50">
            {[education.institution, period].filter(Boolean).join(' · ') || '—'}
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
              onDelete(education.id);
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
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.course} value={education.course} onChange={(event) => onChange({ ...education, course: event.target.value })} />
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.institution} value={education.institution} onChange={(event) => onChange({ ...education, institution: event.target.value })} />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.startYear} value={education.startYear} onChange={(event) => onChange({ ...education, startYear: event.target.value })} />
        <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)]" placeholder={labels.endYear} value={education.endYear} onChange={(event) => onChange({ ...education, endYear: event.target.value })} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button type="button" className="text-[11px] text-[var(--foreground)]/45 disabled:opacity-40" onClick={() => setExpanded(false)} disabled={!education.course}>
          {labels.collapse}
        </button>
        <button type="button" className="text-[11px] font-semibold text-[var(--danger-text)]" onClick={() => onDelete(education.id)}>
          {labels.remove}
        </button>
      </div>
    </div>
  );
}
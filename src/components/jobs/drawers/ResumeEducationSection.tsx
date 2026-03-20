'use client';

import { createEmptyEducation, type ResumeEducation } from '../types';
import { EducationItem } from '../shared/EducationItem';

type Props = {
  education: ResumeEducation[];
  labels: {
    title: string;
    add: string;
    empty: string;
    institution: string;
    course: string;
    startYear: string;
    endYear: string;
    collapse: string;
    remove: string;
  };
  onChange: (value: ResumeEducation[]) => void;
};

export function ResumeEducationSection({ education, labels, onChange }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]/45">{labels.title}</p>
        <button type="button" className="text-xs font-semibold text-[var(--sidebar)]" onClick={() => onChange([...education, createEmptyEducation()])}>
          {labels.add}
        </button>
      </div>

      {education.length ? (
        <div className="space-y-2">
          {education.map((item) => (
            <EducationItem
              key={item.id}
              education={item}
              labels={{
                institution: labels.institution,
                course: labels.course,
                startYear: labels.startYear,
                endYear: labels.endYear,
                collapse: labels.collapse,
                remove: labels.remove,
              }}
              onChange={(value) => onChange(education.map((current) => (current.id === item.id ? value : current)))}
              onDelete={(id) => onChange(education.filter((current) => current.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-xs text-[var(--foreground)]/50">{labels.empty}</div>
      )}
    </div>
  );
}
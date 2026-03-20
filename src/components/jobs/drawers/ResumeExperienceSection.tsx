'use client';

import { createEmptyExperience, type ResumeExperience } from '../types';
import { ExperienceItem } from '../shared/ExperienceItem';

type Props = {
  experiences: ResumeExperience[];
  labels: {
    title: string;
    add: string;
    empty: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    collapse: string;
    remove: string;
  };
  onChange: (value: ResumeExperience[]) => void;
};

export function ResumeExperienceSection({ experiences, labels, onChange }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]/45">{labels.title}</p>
        <button type="button" className="text-xs font-semibold text-[var(--sidebar)]" onClick={() => onChange([...experiences, createEmptyExperience()])}>
          {labels.add}
        </button>
      </div>

      {experiences.length ? (
        <div className="space-y-2">
          {experiences.map((item) => (
            <ExperienceItem
              key={item.id}
              experience={item}
              labels={{
                role: labels.role,
                company: labels.company,
                startDate: labels.startDate,
                endDate: labels.endDate,
                description: labels.description,
                collapse: labels.collapse,
                remove: labels.remove,
              }}
              onChange={(value) => onChange(experiences.map((current) => (current.id === item.id ? value : current)))}
              onDelete={(id) => onChange(experiences.filter((current) => current.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-xs text-[var(--foreground)]/50">{labels.empty}</div>
      )}
    </div>
  );
}
'use client';

import { SkillTagInput } from '../shared/SkillTagInput';

type Props = {
  skills: string[];
  labels: {
    title: string;
    placeholder: string;
    hint: string;
  };
  onChange: (value: string[]) => void;
};

export function ResumeSkillsSection({ skills, labels, onChange }: Props) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]/45">{labels.title}</p>
      <SkillTagInput skills={skills} placeholder={labels.placeholder} hint={labels.hint} onChange={onChange} />
    </div>
  );
}
'use client';

import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/Input';
import { formatJobDate, type ResumeFormValues } from '../types';
import { ResumeExperienceSection } from './ResumeExperienceSection';
import { ResumeEducationSection } from './ResumeEducationSection';
import { ResumeSkillsSection } from './ResumeSkillsSection';
import { ResumeLinksSection } from './ResumeLinksSection';

type Props = {
  open: boolean;
  isSaving: boolean;
  updatedAt: string | null;
  locale: string;
  form: ResumeFormValues;
  labels: {
    drawerTitle: string;
    drawerSubtitle: string;
    professionalTitle: string;
    professionalTitlePlaceholder: string;
    summary: string;
    summaryPlaceholder: string;
    experiences: string;
    addExperience: string;
    noExperiences: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    collapse: string;
    removeExperience: string;
    education: string;
    addEducation: string;
    noEducation: string;
    institution: string;
    course: string;
    startYear: string;
    endYear: string;
    removeEducation: string;
    skills: string;
    skillsPlaceholder: string;
    skillsHint: string;
    links: string;
    linkedinPlaceholder: string;
    portfolioPlaceholder: string;
    cancel: string;
    save: string;
    updatedAt: string;
  };
  onChange: (patch: Partial<ResumeFormValues>) => void;
  onClose: () => void;
  onSave: () => void;
};

export function ResumeDrawer({ open, isSaving, updatedAt, locale, form, labels, onChange, onClose, onSave }: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/35" aria-label={labels.cancel} onClick={onClose} />
      <div className="relative z-10 flex h-full w-[420px] max-w-[calc(100vw-16px)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">{labels.drawerTitle}</h2>
              <p className="mt-1 text-xs text-[var(--foreground)]/50">{labels.drawerSubtitle}</p>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          {updatedAt ? <p className="mt-2 text-[11px] text-[var(--foreground)]/45">{labels.updatedAt.replace('{date}', formatJobDate(updatedAt, locale))}</p> : null}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            <Input label={labels.professionalTitle} placeholder={labels.professionalTitlePlaceholder} value={form.professionalTitle} onChange={(event) => onChange({ professionalTitle: event.target.value })} />

            <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
              <span className="font-medium text-[var(--foreground)]/90">{labels.summary}</span>
              <textarea
                rows={3}
                value={form.summary}
                placeholder={labels.summaryPlaceholder}
                onChange={(event) => onChange({ summary: event.target.value })}
                className="resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
              />
            </label>

            <ResumeExperienceSection
              experiences={form.experiences}
              labels={{
                title: labels.experiences,
                add: labels.addExperience,
                empty: labels.noExperiences,
                role: labels.role,
                company: labels.company,
                startDate: labels.startDate,
                endDate: labels.endDate,
                description: labels.description,
                collapse: labels.collapse,
                remove: labels.removeExperience,
              }}
              onChange={(value) => onChange({ experiences: value })}
            />

            <ResumeEducationSection
              education={form.education}
              labels={{
                title: labels.education,
                add: labels.addEducation,
                empty: labels.noEducation,
                institution: labels.institution,
                course: labels.course,
                startYear: labels.startYear,
                endYear: labels.endYear,
                collapse: labels.collapse,
                remove: labels.removeEducation,
              }}
              onChange={(value) => onChange({ education: value })}
            />

            <ResumeSkillsSection
              skills={form.skills}
              labels={{ title: labels.skills, placeholder: labels.skillsPlaceholder, hint: labels.skillsHint }}
              onChange={(value) => onChange({ skills: value })}
            />

            <ResumeLinksSection
              linkedinUrl={form.linkedinUrl}
              portfolioUrl={form.portfolioUrl}
              labels={{ title: labels.links, linkedin: labels.linkedinPlaceholder, portfolio: labels.portfolioPlaceholder }}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex-1 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]/65 transition hover:bg-[var(--surface-muted)]"
              onClick={onClose}
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              className="flex-[1.3] rounded-full bg-[var(--sidebar)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              disabled={isSaving || !form.professionalTitle.trim()}
              onClick={onSave}
            >
              {labels.save}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
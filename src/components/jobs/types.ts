import type { JobListing, JobResume } from '@/lib/api/jobs';

export type JobStatus = JobListing['status'];
export type ViewMode = 'kanban' | 'list';
export type JobType = 'clt' | 'pj' | 'freelance' | 'internship' | 'other';

export type JobUiMeta = {
  type: JobType | null;
  salary: string | null;
  appliedAt: string | null;
};

export type JobRecord = JobListing & JobUiMeta;

export type JobFormValues = {
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary: string;
  status: JobStatus;
  source: string;
  url: string;
  appliedAt: string;
  notes: string;
};

export type ResumeExperience = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type ResumeEducation = {
  id: string;
  institution: string;
  course: string;
  startYear: string;
  endYear: string;
};

export type ResumeFormValues = {
  professionalTitle: string;
  summary: string;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  linkedinUrl: string;
  portfolioUrl: string;
  additionalLinks: Array<{ label: string; url: string }>;
};

const STRUCTURED_PREFIX = '__org_jobs_structured_v1__:';

export const JOB_STATUSES: JobStatus[] = ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

export const JOB_STATUS_CONFIG: Record<JobStatus, { labelKey: string; dot: string; bg: string; text: string }> = {
  SAVED: { labelKey: 'jobs.status.saved', dot: '#4f46e5', bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300' },
  APPLIED: { labelKey: 'jobs.status.applied', dot: '#d97706', bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  INTERVIEW: { labelKey: 'jobs.status.interview', dot: '#7c3aed', bg: 'bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300' },
  OFFER: { labelKey: 'jobs.status.offer', dot: '#059669', bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
  REJECTED: { labelKey: 'jobs.status.rejected', dot: '#dc2626', bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300' },
};

export const defaultJobForm = (status: JobStatus = 'SAVED'): JobFormValues => ({
  title: '',
  company: '',
  location: '',
  type: 'clt',
  salary: '',
  status,
  source: '',
  url: '',
  appliedAt: '',
  notes: '',
});

export function createLocalId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `job-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyExperience(): ResumeExperience {
  return { id: createLocalId(), role: '', company: '', startDate: '', endDate: '', description: '' };
}

export function createEmptyEducation(): ResumeEducation {
  return { id: createLocalId(), institution: '', course: '', startYear: '', endYear: '' };
}

export const defaultResumeForm = (): ResumeFormValues => ({
  professionalTitle: '',
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  linkedinUrl: '',
  portfolioUrl: '',
  additionalLinks: [],
});

export function toJobRecord(job: JobListing, meta?: JobUiMeta): JobRecord {
  return {
    ...job,
    type: meta?.type ?? null,
    salary: meta?.salary ?? null,
    appliedAt: meta?.appliedAt ?? null,
  };
}

export function getStatusCounts(jobs: JobListing[]): Record<JobStatus, number> {
  return jobs.reduce(
    (acc, job) => ({ ...acc, [job.status]: acc[job.status] + 1 }),
    { SAVED: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 } as Record<JobStatus, number>,
  );
}

function parseStructuredValue<T>(value: string | null | undefined): T | null {
  if (!value || !value.startsWith(STRUCTURED_PREFIX)) {
    return null;
  }

  try {
    return JSON.parse(value.slice(STRUCTURED_PREFIX.length)) as T;
  } catch {
    return null;
  }
}

function serializeStructuredValue<T>(value: T): string {
  return `${STRUCTURED_PREFIX}${JSON.stringify(value)}`;
}

function sanitizeExperiences(experiences: ResumeExperience[]): ResumeExperience[] {
  return experiences.filter((item) => Object.values(item).some((value) => value && value !== item.id));
}

function sanitizeEducation(education: ResumeEducation[]): ResumeEducation[] {
  return education.filter((item) => Object.values(item).some((value) => value && value !== item.id));
}

export function parseResumeForm(resume: JobResume | null): ResumeFormValues {
  if (!resume) {
    return defaultResumeForm();
  }

  const structuredExperiences = parseStructuredValue<ResumeExperience[]>(resume.experience);
  const structuredEducation = parseStructuredValue<ResumeEducation[]>(resume.education);
  const structuredSkills = parseStructuredValue<string[]>(resume.skills);
  const linkedinLink = resume.links?.find((item) => /linkedin/i.test(item.label) || /linkedin/i.test(item.url));
  const portfolioLink = resume.links?.find((item) => item !== linkedinLink);
  const additionalLinks = (resume.links ?? []).filter((item) => item !== linkedinLink && item !== portfolioLink);

  return {
    professionalTitle: resume.title ?? '',
    summary: resume.summary ?? '',
    experiences:
      structuredExperiences ??
      (resume.experience ? [{ ...createEmptyExperience(), description: resume.experience }] : []),
    education:
      structuredEducation ??
      (resume.education ? [{ ...createEmptyEducation(), course: resume.education }] : []),
    skills:
      structuredSkills ??
      (resume.skills
        ? resume.skills
            .split(/,|\n/)
            .map((item) => item.trim())
            .filter(Boolean)
        : []),
    linkedinUrl: linkedinLink?.url ?? '',
    portfolioUrl: portfolioLink?.url ?? '',
    additionalLinks,
  };
}

export function serializeResumeForm(form: ResumeFormValues): Omit<JobResume, 'id' | 'workspaceId' | 'userId' | 'createdAt' | 'updatedAt'> {
  const experiences = sanitizeExperiences(form.experiences);
  const education = sanitizeEducation(form.education);
  const skills = form.skills.map((item) => item.trim()).filter(Boolean);
  const links = [
    form.linkedinUrl.trim() ? { label: 'LinkedIn', url: form.linkedinUrl.trim() } : null,
    form.portfolioUrl.trim() ? { label: 'Portfolio', url: form.portfolioUrl.trim() } : null,
    ...form.additionalLinks,
  ].filter((item): item is { label: string; url: string } => Boolean(item));

  return {
    title: form.professionalTitle.trim(),
    summary: form.summary.trim() || null,
    experience: experiences.length ? serializeStructuredValue(experiences) : null,
    education: education.length ? serializeStructuredValue(education) : null,
    skills: skills.length ? serializeStructuredValue(skills) : null,
    links: links.length ? links : null,
  };
}

export function formatJobDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
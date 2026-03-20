'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  createJob,
  deleteJob,
  getResume,
  listJobs,
  type JobListing,
  type JobResume,
  updateJob,
  upsertResume,
} from '@/lib/api/jobs';
import { useLanguage } from '@/lib/i18n/language-context';
import { getJobMetaMap, setJobMetaMap } from '@/lib/storage/jobs';
import {
  JOB_STATUSES,
  defaultJobForm,
  defaultResumeForm,
  getStatusCounts,
  parseResumeForm,
  serializeResumeForm,
  toJobRecord,
  type JobFormValues,
  type JobStatus,
  type JobUiMeta,
  type ResumeFormValues,
  type ViewMode,
} from './types';

export function useJobsPage() {
  const { t, language } = useLanguage();
  const locale = language === 'pt' ? 'pt-BR' : 'en-US';
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [resume, setResume] = useState<JobResume | null>(null);
  const [jobMeta, setJobMeta] = useState<Record<string, JobUiMeta>>(getJobMetaMap());
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  const [isResumeDrawerOpen, setIsResumeDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [jobForm, setJobForm] = useState<JobFormValues>(defaultJobForm());
  const [resumeForm, setResumeForm] = useState<ResumeFormValues>(defaultResumeForm());
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [jobsResponse, resumeResponse] = await Promise.all([listJobs({ pageSize: 100 }), getResume()]);
      setJobs(jobsResponse.items);
      setResume(resumeResponse);
      setResumeForm(parseResumeForm(resumeResponse));
      setJobMeta(getJobMetaMap());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.jobs.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [t.jobs.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const persistMeta = useCallback((jobId: string, meta: JobUiMeta) => {
    const next = { ...jobMeta, [jobId]: meta };
    setJobMeta(next);
    setJobMetaMap(next);
  }, [jobMeta]);

  const jobRecords = useMemo(() => jobs.map((job) => toJobRecord(job, jobMeta[job.id])), [jobMeta, jobs]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobRecords.filter((job) => {
      if (!term) return true;
      return [job.title, job.company, job.location, job.source, job.salary]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [jobRecords, search]);

  const statusCounts = useMemo(() => getStatusCounts(jobs), [jobs]);

  const jobsByStatus = useMemo(
    () =>
      JOB_STATUSES.reduce(
        (acc, status) => ({ ...acc, [status]: filteredJobs.filter((job) => job.status === status) }),
        {} as Record<JobStatus, typeof filteredJobs>,
      ),
    [filteredJobs],
  );

  const openCreateJobDrawer = (status: JobStatus = 'SAVED') => {
    setEditingJob(null);
    setJobForm(defaultJobForm(status));
    setIsJobDrawerOpen(true);
  };

  const openEditJobDrawer = (jobId: string) => {
    const selected = jobRecords.find((job) => job.id === jobId);
    if (!selected) return;
    setEditingJob(selected);
    setJobForm({
      title: selected.title,
      company: selected.company ?? '',
      location: selected.location ?? '',
      type: selected.type ?? 'clt',
      salary: selected.salary ?? '',
      status: selected.status,
      source: selected.source ?? '',
      url: selected.url ?? '',
      appliedAt: selected.appliedAt ?? '',
      notes: selected.notes ?? '',
    });
    setIsJobDrawerOpen(true);
  };

  const closeJobDrawer = () => {
    setIsJobDrawerOpen(false);
    setEditingJob(null);
    setJobForm(defaultJobForm());
  };

  const saveJob = async () => {
    if (!jobForm.title.trim()) {
      setError(t.jobs.saveError);
      return;
    }

    setIsSavingJob(true);
    setError(null);
    const payload = {
      title: jobForm.title.trim(),
      company: jobForm.company.trim() || null,
      location: jobForm.location.trim() || null,
      url: jobForm.url.trim() || null,
      status: jobForm.status,
      source: jobForm.source.trim() || null,
      notes: jobForm.notes.trim() || null,
    };

    try {
      const saved = editingJob ? await updateJob({ id: editingJob.id, ...payload }) : await createJob(payload);
      persistMeta(saved.id, {
        type: jobForm.type,
        salary: jobForm.salary.trim() || null,
        appliedAt: jobForm.appliedAt || null,
      });
      closeJobDrawer();
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.jobs.saveError);
    } finally {
      setIsSavingJob(false);
    }
  };

  const removeJob = async (jobId: string) => {
    const confirmed = window.confirm(t.jobs.deleteConfirm);
    if (!confirmed) return;

    setIsDeletingJob(true);
    setError(null);
    try {
      await deleteJob({ id: jobId });
      closeJobDrawer();
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.jobs.saveError);
    } finally {
      setIsDeletingJob(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    const current = jobs.find((item) => item.id === jobId);
    if (!current || current.status === status) return;

    try {
      const updated = await updateJob({ id: jobId, status });
      setJobs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.jobs.saveError);
    }
  };

  const saveResume = async () => {
    if (!resumeForm.professionalTitle.trim()) {
      setError(t.jobs.saveError);
      return;
    }

    setIsSavingResume(true);
    setError(null);
    try {
      await upsertResume(serializeResumeForm(resumeForm));
      setIsResumeDrawerOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.jobs.saveError);
    } finally {
      setIsSavingResume(false);
    }
  };

  return {
    t,
    locale,
    search,
    viewMode,
    isLoading,
    error,
    statusCounts,
    jobsByStatus,
    filteredJobs,
    resume,
    resumeForm,
    jobForm,
    editingJob,
    isJobDrawerOpen,
    isResumeDrawerOpen,
    isSavingJob,
    isSavingResume,
    isDeletingJob,
    setSearch,
    setViewMode,
    setJobForm,
    setResumeForm,
    openCreateJobDrawer,
    openEditJobDrawer,
    closeJobDrawer,
    setIsResumeDrawerOpen,
    saveJob,
    saveResume,
    removeJob,
    updateJobStatus,
  };
}
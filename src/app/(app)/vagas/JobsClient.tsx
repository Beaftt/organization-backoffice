"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import {
  createJob,
  deleteJob,
  getResume,
  listJobs,
  updateJob,
  upsertResume,
  type JobListing,
  type JobResume,
} from "@/lib/api/jobs";
import { useLanguage } from "@/lib/i18n/language-context";

const parseLinks = (value: string) => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("-").map((part) => part.trim());
      return label && url ? { label, url } : null;
    })
    .filter((item): item is { label: string; url: string } => Boolean(item));
};

const formatLinks = (links?: Array<{ label: string; url: string }> | null) =>
  (links ?? []).map((link) => `${link.label} - ${link.url}`).join("\n");

type ModalProps = {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ open, title, closeLabel, onClose, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default function JobsClient() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [resume, setResume] = useState<JobResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    url: "",
    source: "",
    notes: "",
  });

  const [resumeForm, setResumeForm] = useState({
    title: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    links: "",
  });
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const statusLabels = useMemo(
    () => ({
      SAVED: t.jobs.status.saved,
      APPLIED: t.jobs.status.applied,
      INTERVIEW: t.jobs.status.interview,
      OFFER: t.jobs.status.offer,
      REJECTED: t.jobs.status.rejected,
    }),
    [t],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsResponse, resumeResponse] = await Promise.all([
        listJobs({ pageSize: 50 }),
        getResume(),
      ]);
      setJobs(jobsResponse.items);
      setResume(resumeResponse);
      if (resumeResponse) {
        setResumeForm({
          title: resumeResponse.title ?? "",
          summary: resumeResponse.summary ?? "",
          experience: resumeResponse.experience ?? "",
          education: resumeResponse.education ?? "",
          skills: resumeResponse.skills ?? "",
          links: formatLinks(resumeResponse.links),
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.jobs.loadError);
      }
    } finally {
      setLoading(false);
    }
  }, [t.jobs.loadError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateJob = async () => {
    if (!jobForm.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createJob({
        title: jobForm.title.trim(),
        company: jobForm.company.trim() || null,
        location: jobForm.location.trim() || null,
        url: jobForm.url.trim() || null,
        source: jobForm.source.trim() || null,
        notes: jobForm.notes.trim() || null,
        status: "SAVED",
      });
      setJobForm({
        title: "",
        company: "",
        location: "",
        url: "",
        source: "",
        notes: "",
      });
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.jobs.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (job: JobListing, status: JobListing["status"]) => {
    setSaving(true);
    setError(null);
    try {
      await updateJob({
        id: job.id,
        status,
      });
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.jobs.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteJob({ id });
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.jobs.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResume = async () => {
    if (!resumeForm.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await upsertResume({
        title: resumeForm.title.trim(),
        summary: resumeForm.summary.trim() || null,
        experience: resumeForm.experience.trim() || null,
        education: resumeForm.education.trim() || null,
        skills: resumeForm.skills.trim() || null,
        links: parseLinks(resumeForm.links),
      });
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.jobs.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t.jobs.title}</h2>
        <p className="text-sm text-zinc-500">{t.jobs.subtitle}</p>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t.jobs.listTitle}</h3>
              <p className="text-sm text-zinc-500">{t.jobs.subtitle}</p>
            </div>
            <Button onClick={() => setIsJobModalOpen(true)}>
              {t.jobs.createJob}
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-sm text-zinc-500">{t.jobs.loading}</p>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.jobs.empty}</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{job.title}</p>
                      <p className="text-xs text-zinc-500">
                        {[job.company, job.location]
                          .filter(Boolean)
                          .join(" • ") || "—"}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={saving}
                    >
                      {t.jobs.deleteAction}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-500">{t.jobs.statusLabel}</span>
                    <select
                      value={job.status}
                      onChange={(event) =>
                        handleUpdateStatus(job, event.target.value as JobListing["status"])
                      }
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 underline"
                    >
                      {job.url}
                    </a>
                  ) : null}
                  {job.notes ? (
                    <p className="text-xs text-zinc-500">{job.notes}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <h3 className="text-lg font-semibold">{t.jobs.resumeTitle}</h3>
            <p className="text-sm text-zinc-500">{t.jobs.subtitle}</p>
          </div>
          <div className="mt-4">
            <Button onClick={() => setIsResumeModalOpen(true)}>
              {t.jobs.saveResume}
            </Button>
          </div>

          {resume ? (
            <p className="mt-3 text-xs text-zinc-500">
              Atualizado em {new Date(resume.updatedAt).toLocaleDateString("pt-BR")}
            </p>
          ) : null}
        </Card>
      </div>

      <Modal
        open={isJobModalOpen}
        title={t.jobs.createJob}
        closeLabel={t.jobs.closeAction}
        onClose={() => setIsJobModalOpen(false)}
      >
        <div className="grid gap-3">
          <Input
            placeholder={t.jobs.form.title}
            value={jobForm.title}
            onChange={(event) =>
              setJobForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
          <Input
            placeholder={t.jobs.form.company}
            value={jobForm.company}
            onChange={(event) =>
              setJobForm((prev) => ({ ...prev, company: event.target.value }))
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder={t.jobs.form.location}
              value={jobForm.location}
              onChange={(event) =>
                setJobForm((prev) => ({ ...prev, location: event.target.value }))
              }
            />
            <Input
              placeholder={t.jobs.form.source}
              value={jobForm.source}
              onChange={(event) =>
                setJobForm((prev) => ({ ...prev, source: event.target.value }))
              }
            />
          </div>
          <Input
            placeholder={t.jobs.form.url}
            value={jobForm.url}
            onChange={(event) =>
              setJobForm((prev) => ({ ...prev, url: event.target.value }))
            }
          />
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.jobs.form.notes}
            value={jobForm.notes}
            onChange={(event) =>
              setJobForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
          <Button onClick={handleCreateJob} disabled={saving}>
            {t.jobs.createJob}
          </Button>
        </div>
      </Modal>

      <Modal
        open={isResumeModalOpen}
        title={t.jobs.resumeTitle}
        closeLabel={t.jobs.closeAction}
        onClose={() => setIsResumeModalOpen(false)}
      >
        <div className="grid gap-3">
          <Input
            placeholder={t.jobs.form.resumeTitle}
            value={resumeForm.title}
            onChange={(event) =>
              setResumeForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.jobs.form.summary}
            value={resumeForm.summary}
            onChange={(event) =>
              setResumeForm((prev) => ({ ...prev, summary: event.target.value }))
            }
          />
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.jobs.form.experience}
            value={resumeForm.experience}
            onChange={(event) =>
              setResumeForm((prev) => ({ ...prev, experience: event.target.value }))
            }
          />
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.jobs.form.education}
            value={resumeForm.education}
            onChange={(event) =>
              setResumeForm((prev) => ({ ...prev, education: event.target.value }))
            }
          />
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.jobs.form.skills}
            value={resumeForm.skills}
            onChange={(event) =>
              setResumeForm((prev) => ({ ...prev, skills: event.target.value }))
            }
          />
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.jobs.form.links}
            value={resumeForm.links}
            onChange={(event) =>
              setResumeForm((prev) => ({ ...prev, links: event.target.value }))
            }
          />
          <Button onClick={handleSaveResume} disabled={saving}>
            {t.jobs.saveResume}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { ApiError } from "@/lib/api/client";
import {
  addHrJobParticipant,
  createHrJob,
  deleteHrJob,
  listHrJobParticipants,
  listHrJobs,
  type HrJob,
  type HrJobParticipant,
} from "@/lib/api/hr";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { listUserProfiles } from "@/lib/api/user-profile";
import { getWorkspaceId } from "@/lib/storage/workspace";

type MemberOption = {
  userId: string;
  label: string;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

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
    <div className="modal-overlay fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="modal-content w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
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

export default function HrJobsClient() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<HrJob[]>([]);
  const [participantsByJob, setParticipantsByJob] = useState<
    Record<string, HrJobParticipant[]>
  >({});
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [participantSelection, setParticipantSelection] = useState<
    Record<string, string>
  >({});

  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
  });
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const membersById = useMemo(
    () => new Map(members.map((member) => [member.userId, member])),
    [members],
  );

  const loadMembers = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;

    const [membershipsResult, profilesResult] = await Promise.allSettled([
      getWorkspaceMemberships(workspaceId),
      listUserProfiles({ page: 1, pageSize: 80 }),
    ]);

    const memberships =
      membershipsResult.status === "fulfilled" ? membershipsResult.value : null;
    const profiles =
      profilesResult.status === "fulfilled" ? profilesResult.value : null;

    const profileMap = new Map(
      (profiles?.items ?? []).map((profile) => [
        profile.userId,
        {
          label: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim(),
        },
      ]),
    );

    const resolvedMembers = (memberships?.items ?? [])
      .filter((membership) => isUuid(membership.userId))
      .map((membership) => {
        const profile = profileMap.get(membership.userId);
        return {
          userId: membership.userId,
          label: profile?.label || membership.userId.slice(0, 8),
        };
      });

    setMembers(resolvedMembers);
  }, []);

  const loadJobs = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await listHrJobs({ workspaceId, pageSize: 100 });
      setJobs(response.items);

      const participantsEntries = await Promise.all(
        response.items.map(async (job) => {
          const participants = await listHrJobParticipants({
            workspaceId,
            jobId: job.id,
          });
          return [job.id, participants] as const;
        }),
      );
      setParticipantsByJob(Object.fromEntries(participantsEntries));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [t.hr.loadError]);

  useEffect(() => {
    loadJobs();
    loadMembers();
  }, [loadJobs, loadMembers]);

  const refreshParticipants = useCallback(async (jobId: string) => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    const participants = await listHrJobParticipants({ workspaceId, jobId });
    setParticipantsByJob((prev) => ({ ...prev, [jobId]: participants }));
  }, []);

  const handleCreateJob = async () => {
    if (!jobForm.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createHrJob({
        title: jobForm.title.trim(),
        department: jobForm.department.trim() || null,
        location: jobForm.location.trim() || null,
        description: jobForm.description.trim() || null,
        type: "INTERNAL",
      });
      setJobForm({ title: "", department: "", location: "", description: "" });
      setIsJobModalOpen(false);
      await loadJobs();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteHrJob({ id });
      await loadJobs();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.deleteError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddParticipant = async (jobId: string) => {
    const userId = participantSelection[jobId];
    if (!userId) {
      setError(t.hr.participantSelectRequired);
      return;
    }
    if (!isUuid(userId)) {
      setError(t.hr.participantInvalid);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addHrJobParticipant({ jobId, userId, status: "APPLIED" });
      setParticipantSelection((prev) => ({ ...prev, [jobId]: "" }));
      await refreshParticipants(jobId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t.hr.jobsTitle}</h2>
        <p className="text-sm text-zinc-500">{t.hr.jobsSubtitle}</p>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              {t.hr.cards.totalLabel}
            </p>
            <p className="text-3xl font-semibold">
              {isLoading ? "—" : jobs.length}
            </p>
          </div>
          <Button onClick={() => setIsJobModalOpen(true)}>
            {t.hr.createJob}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-zinc-500">{t.hr.loading}</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.hr.jobsEmpty}</p>
        ) : (
          jobs.map((job) => {
            const participants = participantsByJob[job.id] ?? [];
            return (
              <div
                key={job.id}
                className="list-item-animate space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{job.title}</p>
                    <p className="text-xs text-zinc-500">
                      {[job.department, job.location]
                        .filter(Boolean)
                        .join(" • ") || "Interna"}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={saving}
                  >
                    {t.hr.deleteAction}
                  </Button>
                </div>

                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="text-xs font-semibold text-zinc-600">
                    {t.hr.participantTitle}
                  </p>
                  {participants.length === 0 ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {t.hr.participantEmpty}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {participants.map((participant) => {
                        const member = membersById.get(participant.userId);
                        return (
                          <div
                            key={participant.id}
                            className="list-item-animate flex items-center justify-between text-xs"
                          >
                            <span>
                              {member?.label || participant.userId.slice(0, 6)}
                            </span>
                            <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px]">
                              {participant.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      value={participantSelection[job.id] ?? ""}
                      onChange={(event) =>
                        setParticipantSelection((prev) => ({
                          ...prev,
                          [job.id]: event.target.value,
                        }))
                      }
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
                    >
                      <option value="">{t.hr.participantSelect}</option>
                      {members.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="secondary"
                      onClick={() => handleAddParticipant(job.id)}
                      disabled={saving || !participantSelection[job.id]}
                    >
                      {t.hr.participantAdd}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => refreshParticipants(job.id)}
                    >
                      {t.hr.participantRefresh}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        open={isJobModalOpen}
        title={t.hr.createJob}
        closeLabel={t.hr.closeAction}
        onClose={() => setIsJobModalOpen(false)}
      >
        <div className="grid gap-3">
          <Input
            placeholder={t.hr.form.jobTitle}
            value={jobForm.title}
            onChange={(event) =>
              setJobForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder={t.hr.form.jobDepartment}
              value={jobForm.department}
              onChange={(event) =>
                setJobForm((prev) => ({
                  ...prev,
                  department: event.target.value,
                }))
              }
            />
            <Input
              placeholder={t.hr.form.jobLocation}
              value={jobForm.location}
              onChange={(event) =>
                setJobForm((prev) => ({ ...prev, location: event.target.value }))
              }
            />
          </div>
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.hr.form.jobDescription}
            value={jobForm.description}
            onChange={(event) =>
              setJobForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <Button onClick={handleCreateJob} disabled={saving}>
            {t.hr.createJob}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

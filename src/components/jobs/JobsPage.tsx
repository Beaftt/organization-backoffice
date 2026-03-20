'use client';

import { JobsHeader } from './header/JobsHeader';
import { KanbanView } from './views/KanbanView';
import { JobsListView } from './views/JobsListView';
import { JobDrawer } from './drawers/JobDrawer';
import { ResumeDrawer } from './drawers/ResumeDrawer';
import { useJobsPage } from './use-jobs-page';

export function JobsPage() {
  const vm = useJobsPage();

  return (
    <div className="page-transition flex flex-col gap-4 p-4 md:p-6">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <JobsHeader
          title={vm.t.jobs.title}
          subtitle={vm.t.jobs.subtitle}
          search={vm.search}
          searchPlaceholder={vm.t.jobs.search}
          viewMode={vm.viewMode}
          counts={vm.statusCounts}
          labels={{
            resume: vm.t.jobs.resume,
            addJob: vm.t.jobs.addJob,
            kanban: vm.t.jobs.views.kanban,
            list: vm.t.jobs.views.list,
            stats: {
              SAVED: vm.t.jobs.status.saved,
              APPLIED: vm.t.jobs.status.applied,
              INTERVIEW: vm.t.jobs.status.interview,
              OFFER: vm.t.jobs.status.offer,
              REJECTED: vm.t.jobs.status.rejected,
            },
          }}
          onSearchChange={vm.setSearch}
          onOpenResume={() => vm.setIsResumeDrawerOpen(true)}
          onOpenJob={() => vm.openCreateJobDrawer()}
          onViewModeChange={vm.setViewMode}
        />

        <div className="p-4 md:p-5">
          {vm.error ? (
            <div className="mb-4 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {vm.error}
            </div>
          ) : null}

          {vm.viewMode === 'kanban' ? (
            <KanbanView
              isLoading={vm.isLoading}
              locale={vm.locale}
              jobsByStatus={vm.jobsByStatus}
              labels={{
                statuses: {
                  SAVED: vm.t.jobs.status.saved,
                  APPLIED: vm.t.jobs.status.applied,
                  INTERVIEW: vm.t.jobs.status.interview,
                  OFFER: vm.t.jobs.status.offer,
                  REJECTED: vm.t.jobs.status.rejected,
                },
                types: vm.t.jobs.types,
                view: vm.t.jobs.viewLink,
                add: vm.t.jobs.add,
                emptyTitle: vm.t.jobs.empty.title,
                emptySubtitle: vm.t.jobs.empty.subtitle,
                emptyCta: vm.t.jobs.empty.cta,
              }}
              onAdd={vm.openCreateJobDrawer}
              onCreate={() => vm.openCreateJobDrawer()}
              onSelect={vm.openEditJobDrawer}
              onDropJob={(jobId, status) => void vm.updateJobStatus(jobId, status)}
            />
          ) : (
            <JobsListView
              jobs={vm.filteredJobs}
              locale={vm.locale}
              isLoading={vm.isLoading}
              labels={{
                statuses: {
                  SAVED: vm.t.jobs.status.saved,
                  APPLIED: vm.t.jobs.status.applied,
                  INTERVIEW: vm.t.jobs.status.interview,
                  OFFER: vm.t.jobs.status.offer,
                  REJECTED: vm.t.jobs.status.rejected,
                },
                types: vm.t.jobs.types,
                edit: vm.t.jobs.edit,
                delete: vm.t.jobs.delete,
                view: vm.t.jobs.viewLink,
                emptyTitle: vm.t.jobs.empty.title,
                emptySubtitle: vm.t.jobs.empty.subtitle,
                emptyCta: vm.t.jobs.empty.cta,
              }}
              onCreate={() => vm.openCreateJobDrawer()}
              onEdit={vm.openEditJobDrawer}
              onDelete={(jobId) => void vm.removeJob(jobId)}
            />
          )}
        </div>
      </div>

      <JobDrawer
        open={vm.isJobDrawerOpen}
        isEditing={!!vm.editingJob}
        isSaving={vm.isSavingJob}
        isDeleting={vm.isDeletingJob}
        form={vm.jobForm}
        labels={{
          newJob: vm.t.jobs.newJob,
          editJob: vm.t.jobs.editJob,
          newJobSubtitle: vm.t.jobs.newJobSubtitle,
          cancel: vm.t.jobs.cancel,
          save: vm.t.jobs.form.save,
          add: vm.t.jobs.form.add,
          delete: vm.t.jobs.delete,
          title: vm.t.jobs.form.title,
          titlePlaceholder: vm.t.jobs.form.titlePlaceholder,
          company: vm.t.jobs.form.company,
          companyPlaceholder: vm.t.jobs.form.companyPlaceholder,
          location: vm.t.jobs.form.location,
          locationPlaceholder: vm.t.jobs.form.locationPlaceholder,
          type: vm.t.jobs.form.type,
          salary: vm.t.jobs.form.salary,
          salaryPlaceholder: vm.t.jobs.form.salaryPlaceholder,
          status: vm.t.jobs.form.status,
          source: vm.t.jobs.form.source,
          sourcePlaceholder: vm.t.jobs.form.sourcePlaceholder,
          url: vm.t.jobs.form.url,
          urlPlaceholder: vm.t.jobs.form.urlPlaceholder,
          appliedAt: vm.t.jobs.form.appliedAt,
          notes: vm.t.jobs.form.notes,
          notesPlaceholder: vm.t.jobs.form.notesPlaceholder,
          typeOptions: vm.t.jobs.types,
          statusOptions: {
            SAVED: vm.t.jobs.status.saved,
            APPLIED: vm.t.jobs.status.applied,
            INTERVIEW: vm.t.jobs.status.interview,
            OFFER: vm.t.jobs.status.offer,
            REJECTED: vm.t.jobs.status.rejected,
          },
        }}
        onChange={(patch) => vm.setJobForm({ ...vm.jobForm, ...patch })}
        onClose={vm.closeJobDrawer}
        onSave={() => void vm.saveJob()}
        onDelete={vm.editingJob ? () => void vm.removeJob(vm.editingJob!.id) : undefined}
      />

      <ResumeDrawer
        open={vm.isResumeDrawerOpen}
        isSaving={vm.isSavingResume}
        updatedAt={vm.resume?.updatedAt ?? null}
        locale={vm.locale}
        form={vm.resumeForm}
        labels={vm.t.jobs.resumeForm}
        onChange={(patch) => vm.setResumeForm({ ...vm.resumeForm, ...patch })}
        onClose={() => vm.setIsResumeDrawerOpen(false)}
        onSave={() => void vm.saveResume()}
      />
    </div>
  );
}
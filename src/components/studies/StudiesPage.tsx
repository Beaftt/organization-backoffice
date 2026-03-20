'use client';

import { StudiesHeader } from './header/StudiesHeader';
import { StudiesTabBar } from './tabs/StudiesTabBar';
import { MyCoursesList } from './tabs/MyCoursesList';
import { StudiesSidebar } from './sidebar/StudiesSidebar';
import { CourseDrawer } from './drawers/CourseDrawer';
import { DeleteCourseConfirm } from './modals/DeleteCourseConfirm';
import { useStudiesPage } from './use-studies-page';

export function StudiesPage() {
  const vm = useStudiesPage();
  const selectedCourse = vm.editingCourse;

  return (
    <div className="page-transition flex flex-col gap-4 p-4 md:p-6">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <StudiesHeader
          title={vm.t.studies.title}
          subtitle={vm.t.studies.subtitle}
          search={vm.search}
          searchPlaceholder={vm.t.studies.search}
          stats={vm.stats}
          labels={{
            active: vm.t.studies.stats.active,
            avgProgress: vm.t.studies.stats.avgProgress,
            total: vm.t.studies.stats.total,
            completed: vm.t.studies.stats.completed,
            newCourse: vm.t.studies.newCourse,
          }}
          onSearchChange={vm.setSearch}
          onNewCourse={vm.openCreateDrawer}
        />
        <StudiesTabBar
          activeTab={vm.activeTab}
          labels={{
            all: vm.t.studies.tabs.all,
            active: vm.t.studies.tabs.active,
            paused: vm.t.studies.tabs.paused,
            completed: vm.t.studies.tabs.completed,
          }}
          onChange={vm.setActiveTab}
        />
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-5">
          <div className="space-y-3">
            {vm.error ? (
              <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger)] px-4 py-3 text-sm text-[var(--danger-text)]">
                {vm.error}
              </div>
            ) : null}
            <MyCoursesList
              courses={vm.filteredCourses}
              isLoading={vm.isLoading}
              labels={{
                lessons: vm.t.studies.lessons,
                progress: vm.t.studies.progress,
                edit: vm.t.studies.edit,
                delete: vm.t.studies.delete,
                newCourse: vm.t.studies.newCourse,
                emptyTitle: vm.t.studies.empty.title,
                emptySubtitle: vm.t.studies.empty.subtitle,
                emptyCta: vm.t.studies.empty.cta,
              }}
              onCreate={vm.openCreateDrawer}
              onEdit={(courseId) => {
                const course = vm.filteredCourses.find((item) => item.id === courseId);
                if (course) vm.openEditDrawer(course);
              }}
              onDelete={(courseId) => {
                const course = vm.filteredCourses.find((item) => item.id === courseId);
                if (course) vm.setDeleteTarget(course);
              }}
            />
          </div>
          <StudiesSidebar
            profile={vm.profileView}
            calendar={vm.calendar}
            weekdays={vm.t.studies.calendarWeekdays}
            premiumHref="/plans"
            labels={{
              profileSection: vm.t.studies.sidebar.profile,
              calendarSection: vm.t.studies.sidebar.calendar,
              openCalendar: vm.t.studies.sidebar.open,
              profileName: vm.t.studies.profile.name,
              profileLevel: vm.t.studies.profile.level,
              profileNextLevel: vm.t.studies.profile.nextLevel,
              profileEdit: vm.t.studies.profile.edit,
              premiumTitle: vm.t.studies.premium.title,
              premiumSubtitle: vm.t.studies.premium.subtitle,
              premiumCta: vm.t.studies.premium.cta,
            }}
          />
        </div>
      </div>

      <CourseDrawer
        open={vm.isDrawerOpen}
        isEditing={!!selectedCourse}
        form={vm.form}
        isSaving={vm.isSaving}
        labels={{
          newCourse: vm.t.studies.newCourse,
          editCourse: vm.t.studies.editCourse,
          cancel: vm.t.studies.cancel,
          create: vm.t.studies.form.create,
          save: vm.t.studies.form.save,
          title: vm.t.studies.form.title,
          titlePlaceholder: vm.t.studies.form.titlePlaceholder,
          institution: vm.t.studies.form.institution,
          institutionPlaceholder: vm.t.studies.form.institutionPlaceholder,
          lessons: vm.t.studies.form.lessons,
          status: vm.t.studies.form.status,
          color: vm.t.studies.form.color,
          startDate: vm.t.studies.form.startDate,
          description: vm.t.studies.form.description,
          descriptionPlaceholder: vm.t.studies.form.descriptionPlaceholder,
          completedLessons: vm.t.studies.form.completedLessons,
          progressPreview: vm.t.studies.form.progressPreview,
          hint: vm.t.studies.form.hint,
          statusActive: vm.t.studies.status.active,
          statusPaused: vm.t.studies.status.paused,
          statusCompleted: vm.t.studies.status.completed,
        }}
        onChange={(patch) => vm.setForm({ ...vm.form, ...patch })}
        onClose={vm.closeDrawer}
        onSave={() => void vm.saveCourse()}
      />

      <DeleteCourseConfirm
        open={!!vm.deleteTarget}
        title={vm.t.studies.deleteCourseTitle}
        message={vm.t.studies.deleteCourseMessage}
        courseName={vm.deleteTarget?.title ?? ''}
        confirmLabel={vm.t.studies.delete}
        cancelLabel={vm.t.studies.cancel}
        isDeleting={vm.isDeleting}
        onCancel={() => vm.setDeleteTarget(null)}
        onConfirm={() => void vm.confirmDelete()}
      />
    </div>
  );
}

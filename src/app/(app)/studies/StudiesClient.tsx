"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import {
  createStudyCourse,
  createStudyTask,
  listStudyCourses,
  listStudyTasks,
  updateStudyCourse,
  updateStudyTask,
  type StudyCourse,
  type StudyTask,
} from "@/lib/api/studies";
import { getMyProfile, type UserProfile } from "@/lib/api/user-profile";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCallback, useEffect, useMemo, useState } from "react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function StudiesClient() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<StudyCourse[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    provider: "",
    lessonCount: "",
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    dueAt: "",
    courseId: "",
  });
  const [editingCourse, setEditingCourse] = useState<StudyCourse | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const statusLabels = useMemo(
    () => ({
      ACTIVE: t.studies.statusActive,
      PAUSED: t.studies.statusPaused,
      COMPLETED: t.studies.statusCompleted,
    }),
    [t],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [coursesResponse, tasksResponse, profileResponse] =
        await Promise.all([
          listStudyCourses(),
          listStudyTasks(),
          getMyProfile().catch(() => null),
        ]);
      setCourses(coursesResponse);
      setTasks(tasksResponse);
      setProfile(profileResponse);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.studies.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const query = search.trim().toLowerCase();
    return courses.filter((course) =>
      course.title.toLowerCase().includes(query),
    );
  }, [courses, search]);

  const newCourses = useMemo(() => {
    const palette = [
      { color: "from-amber-200 via-amber-100 to-amber-50", accent: "bg-amber-500" },
      { color: "from-violet-200 via-violet-100 to-violet-50", accent: "bg-violet-500" },
      { color: "from-sky-200 via-sky-100 to-sky-50", accent: "bg-sky-500" },
    ];
    return [...filteredCourses]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3)
      .map((course, index) => ({
        ...course,
        ...palette[index % palette.length],
      }));
  }, [filteredCourses]);

  const formatDate = useCallback((value: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(date);
  }, []);

  const handleCreateCourse = useCallback(async () => {
    if (!courseForm.title.trim()) return;
    setIsSavingCourse(true);
    setError(null);
    try {
      await createStudyCourse({
        title: courseForm.title.trim(),
        provider: courseForm.provider.trim() || null,
        lessonCount: courseForm.lessonCount
          ? Number(courseForm.lessonCount)
          : null,
      });
      setCourseForm({ title: "", provider: "", lessonCount: "" });
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.studies.saveError);
      }
    } finally {
      setIsSavingCourse(false);
    }
  }, [courseForm, loadData, t]);

  const handleUpdateCourse = useCallback(async () => {
    if (!editingCourse) return;
    setIsSavingCourse(true);
    setError(null);
    try {
      await updateStudyCourse({
        id: editingCourse.id,
        title: editingCourse.title,
        status: editingCourse.status,
        progress: editingCourse.progress,
      });
      setEditingCourse(null);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.studies.saveError);
      }
    } finally {
      setIsSavingCourse(false);
    }
  }, [editingCourse, loadData, t]);

  const handleCreateTask = useCallback(async () => {
    if (!taskForm.title.trim()) return;
    setIsSavingTask(true);
    setError(null);
    try {
      await createStudyTask({
        title: taskForm.title.trim(),
        dueAt: taskForm.dueAt ? new Date(taskForm.dueAt).toISOString() : null,
        courseId: taskForm.courseId || null,
      });
      setTaskForm({ title: "", dueAt: "", courseId: "" });
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.studies.saveError);
      }
    } finally {
      setIsSavingTask(false);
    }
  }, [taskForm, loadData, t]);

  const toggleTaskStatus = useCallback(
    async (task: StudyTask) => {
      if (editingTaskId) return;
      setEditingTaskId(task.id);
      setError(null);
      try {
        await updateStudyTask({
          id: task.id,
          status: task.status === "DONE" ? "OPEN" : "DONE",
        });
        await loadData();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(t.studies.saveError);
        }
      } finally {
        setEditingTaskId(null);
      }
    },
    [editingTaskId, loadData, t],
  );

  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthLabel = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month, 1));
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const slots: Array<number | null> = [];
    for (let i = 0; i < firstDay; i += 1) {
      slots.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      slots.push(day);
    }
    const today = now.getDate();
    return { monthLabel, slots, today };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {t.modules.studies}
          </p>
          <h2 className="text-2xl font-semibold">{t.studies.dashboardTitle}</h2>
          <p className="text-sm text-zinc-600">{t.studies.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder={t.studies.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-[200px]"
          />
          <Button variant="secondary" className="rounded-xl">
            {t.studies.newCourseAction}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.studies.newCoursesTitle}</h3>
              <Button variant="ghost" className="rounded-full">
                {t.studies.viewAll}
              </Button>
            </div>
            {isLoading ? (
              <p className="mt-4 text-sm text-zinc-500">{t.studies.loading}</p>
            ) : error ? (
              <p className="mt-4 text-sm text-rose-500">{error}</p>
            ) : newCourses.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {newCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-transparent bg-gradient-to-br p-4 shadow-sm"
                    style={{
                      backgroundImage: `linear-gradient(135deg, var(--surface-muted), var(--surface))`,
                    }}
                  >
                    <div
                      className={`flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br ${course.color}`}
                    >
                      <span className="text-2xl">📚</span>
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-semibold text-zinc-800">
                        {course.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {(course.lessonCount ?? 0).toString()} {t.studies.lessonsLabel}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[0, 1, 2].map((item) => (
                          <span
                            key={item}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-zinc-100 text-[10px] font-semibold text-zinc-600"
                          >
                            {item + 1}
                          </span>
                        ))}
                      </div>
                      <button
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${course.accent} text-white`}
                        type="button"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">{t.studies.emptyCourses}</p>
            )}
            <div className="mt-6 space-y-4 border-t border-zinc-100 pt-4">
              <h4 className="text-sm font-semibold text-zinc-700">
                {t.studies.newCourseFormTitle}
              </h4>
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  label={t.studies.courseTitleLabel}
                  value={courseForm.title}
                  onChange={(event) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
                <Input
                  label={t.studies.courseProviderLabel}
                  value={courseForm.provider}
                  onChange={(event) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      provider: event.target.value,
                    }))
                  }
                />
                <Input
                  label={t.studies.courseLessonCountLabel}
                  type="number"
                  min={0}
                  value={courseForm.lessonCount}
                  onChange={(event) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      lessonCount: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleCreateCourse}
                  disabled={isSavingCourse || !courseForm.title.trim()}
                >
                  {isSavingCourse ? t.studies.saving : t.studies.createAction}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.studies.myCoursesTitle}</h3>
              <Button variant="ghost" className="rounded-full">
                {t.studies.viewAll}
              </Button>
            </div>
            {isLoading ? (
              <p className="mt-4 text-sm text-zinc-500">{t.studies.loading}</p>
            ) : error ? (
              <p className="mt-4 text-sm text-rose-500">{error}</p>
            ) : filteredCourses.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="pb-3">{t.studies.courseNameLabel}</th>
                      <th className="pb-3">{t.studies.courseStartLabel}</th>
                      <th className="pb-3">{t.studies.courseProgressLabel}</th>
                      <th className="pb-3">{t.studies.courseStatusLabel}</th>
                      <th className="pb-3 text-right">{t.studies.actionsLabel}</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-700">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-t border-zinc-100">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-500">
                              {course.title.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <p className="text-sm font-semibold">
                                {course.title}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {(course.lessonCount ?? 0).toString()} {t.studies.lessonsLabel}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-zinc-500">
                          {formatDate(course.startAt)}
                        </td>
                        <td className="py-3 text-sm text-zinc-500">
                          {course.progress}%
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                            {statusLabels[course.status]}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                            onClick={() => setEditingCourse(course)}
                          >
                            {t.studies.editAction}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">{t.studies.emptyCourses}</p>
            )}
            {editingCourse ? (
              <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                <h4 className="text-sm font-semibold text-zinc-700">
                  {t.studies.editCourseTitle}
                </h4>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <Input
                    label={t.studies.courseTitleLabel}
                    value={editingCourse.title}
                    onChange={(event) =>
                      setEditingCourse((prev) =>
                        prev
                          ? { ...prev, title: event.target.value }
                          : prev,
                      )
                    }
                  />
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-700">
                      {t.studies.courseStatusLabel}
                    </span>
                    <select
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
                      value={editingCourse.status}
                      onChange={(event) =>
                        setEditingCourse((prev) =>
                          prev
                            ? {
                                ...prev,
                                status: event.target.value as StudyCourse["status"],
                              }
                            : prev,
                        )
                      }
                    >
                      <option value="ACTIVE">{t.studies.statusActive}</option>
                      <option value="PAUSED">{t.studies.statusPaused}</option>
                      <option value="COMPLETED">{t.studies.statusCompleted}</option>
                    </select>
                  </label>
                  <Input
                    label={t.studies.courseProgressLabel}
                    type="number"
                    min={0}
                    max={100}
                    value={editingCourse.progress.toString()}
                    onChange={(event) =>
                      setEditingCourse((prev) =>
                        prev
                          ? {
                              ...prev,
                              progress: Number(event.target.value || 0),
                            }
                          : prev,
                      )
                    }
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={handleUpdateCourse}
                    disabled={isSavingCourse || !editingCourse.title.trim()}
                  >
                    {isSavingCourse ? t.studies.saving : t.studies.updateAction}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingCourse(null)}
                  >
                    {t.studies.cancelAction}
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t.studies.premiumTitle}</h3>
              <p className="mt-1 text-sm text-zinc-600">
                {t.studies.premiumSubtitle}
              </p>
            </div>
            <Button className="rounded-full">{t.studies.premiumAction}</Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
              {getInitials(
                profile?.firstName || profile?.lastName
                  ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
                  : t.studies.profileFallback,
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800">
                {profile?.firstName || profile?.lastName
                  ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
                  : t.studies.profileFallback}
              </p>
              <p className="text-xs text-zinc-500">{t.studies.profileRole}</p>
            </div>
            <Button variant="secondary" className="rounded-full">
              {t.studies.editProfile}
            </Button>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.studies.calendarTitle}</h3>
              <Button variant="ghost" className="rounded-full">
                {t.studies.viewCalendarAction}
              </Button>
            </div>
            <p className="mt-2 text-sm text-zinc-500">{calendar.monthLabel}</p>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-zinc-500">
              {t.studies.calendarWeekdays.map((day) => (
                <span key={day} className="font-semibold">
                  {day}
                </span>
              ))}
              {calendar.slots.map((day, index) => (
                <span
                  key={`${day ?? "empty"}-${index}`}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                    day === calendar.today
                      ? "bg-violet-500 text-white"
                      : "text-zinc-600"
                  } ${day ? "" : "opacity-0"}`}
                >
                  {day ?? 0}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {t.studies.homeworkTitle}
              </h3>
              <Button variant="ghost" className="rounded-full">
                {t.studies.viewAll}
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid gap-3">
                <Input
                  label={t.studies.taskTitleLabel}
                  value={taskForm.title}
                  onChange={(event) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
                <Input
                  label={t.studies.taskDueLabel}
                  type="datetime-local"
                  value={taskForm.dueAt}
                  onChange={(event) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      dueAt: event.target.value,
                    }))
                  }
                />
                <label className="flex flex-col gap-2 text-sm text-zinc-600">
                  <span className="font-medium text-zinc-700">
                    {t.studies.taskCourseLabel}
                  </span>
                  <select
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
                    value={taskForm.courseId}
                    onChange={(event) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        courseId: event.target.value,
                      }))
                    }
                  >
                    <option value="">{t.studies.unassignedCourseLabel}</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  onClick={handleCreateTask}
                  disabled={isSavingTask || !taskForm.title.trim()}
                >
                  {isSavingTask ? t.studies.saving : t.studies.taskCreateAction}
                </Button>
              </div>
              {isLoading ? (
                <p className="text-sm text-zinc-500">{t.studies.loading}</p>
              ) : error ? (
                <p className="text-sm text-rose-500">{error}</p>
              ) : tasks.length ? (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-zinc-700">
                          {task.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(task.dueAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600"
                        onClick={() => toggleTaskStatus(task)}
                        disabled={editingTaskId === task.id}
                      >
                        {task.status === "DONE"
                          ? t.studies.taskStatusDone
                          : t.studies.taskStatusOpen}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">{t.studies.emptyTasks}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

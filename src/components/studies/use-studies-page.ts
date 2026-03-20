'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  createStudyCourse,
  deleteStudyCourse,
  listStudyCourses,
  type StudyCourse,
  updateStudyCourse,
} from '@/lib/api/studies';
import { getMyProfile, type UserProfile } from '@/lib/api/user-profile';
import { useLanguage } from '@/lib/i18n/language-context';
import { getStudyCourseMetaMap, setStudyCourseMetaMap } from '@/lib/storage/studies';
import {
  buildMiniCalendar,
  getInitials,
  getProfileName,
  getStudyStats,
  toStudyCourseCard,
  type CourseFormValues,
  type StudyTab,
} from './types';

const defaultForm = (): CourseFormValues => ({
  title: '',
  institution: '',
  totalLessons: '',
  status: 'ACTIVE',
  color: '#eef0ff',
  startDate: '',
  description: '',
  completedLessons: '0',
});

export function useStudiesPage() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StudyTab>('all');
  const [courses, setCourses] = useState<StudyCourse[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courseMeta, setCourseMeta] = useState(getStudyCourseMetaMap());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<StudyCourse | null>(null);
  const [form, setForm] = useState<CourseFormValues>(defaultForm());
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudyCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [coursesResponse, profileResponse] = await Promise.all([
        listStudyCourses(),
        getMyProfile().catch(() => null),
      ]);
      setCourses(coursesResponse);
      setProfile(profileResponse);
      setCourseMeta(getStudyCourseMetaMap());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.studies.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [t.studies.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(() => getStudyStats(courses), [courses]);
  const courseCards = useMemo(
    () => courses.map((course) => toStudyCourseCard(course, courseMeta[course.id])),
    [courseMeta, courses],
  );
  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courseCards.filter((course) => {
      const matchesSearch = !term || course.title.toLowerCase().includes(term);
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'active' && course.status === 'ACTIVE') ||
        (activeTab === 'paused' && course.status === 'PAUSED') ||
        (activeTab === 'completed' && course.status === 'COMPLETED');
      return matchesSearch && matchesTab;
    });
  }, [activeTab, courseCards, search]);

  const profileView = useMemo(() => {
    const name = getProfileName(profile, t.studies.profile.name);
    const level =
      stats.completedCourses >= 4 || stats.averageProgress >= 75
        ? t.studies.profile.levelAdvanced
        : stats.completedCourses >= 1 || stats.averageProgress >= 35
          ? t.studies.profile.levelIntermediate
          : t.studies.profile.levelBeginner;
    return {
      name,
      level,
      xp: stats.averageProgress,
      xpForNextLevel: 100,
      avatarInitials: getInitials(name),
      photoUrl: profile?.photoUrl ?? null,
    };
  }, [profile, stats, t.studies.profile]);

  const calendar = useMemo(
    () => buildMiniCalendar(language === 'pt' ? 'pt-BR' : 'en-US'),
    [language],
  );

  const openCreateDrawer = () => {
    setEditingCourse(null);
    setForm(defaultForm());
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (course: StudyCourse) => {
    const meta = courseMeta[course.id];
    const totalLessons = course.lessonCount ?? 0;
    const completedLessons = totalLessons > 0
      ? Math.min(totalLessons, Math.round((course.progress / 100) * totalLessons))
      : 0;

    setEditingCourse(course);
    setForm({
      title: course.title,
      institution: course.provider ?? '',
      totalLessons: course.lessonCount ? String(course.lessonCount) : '',
      status: course.status,
      color: meta?.color ?? '#eef0ff',
      startDate: course.startAt ?? '',
      description: meta?.description ?? '',
      completedLessons: String(completedLessons),
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingCourse(null);
    setForm(defaultForm());
  };

  const persistMeta = (courseId: string, nextMeta: { color: string; description: string }) => {
    const next = { ...courseMeta, [courseId]: nextMeta };
    setCourseMeta(next);
    setStudyCourseMetaMap(next);
  };

  const saveCourse = async () => {
    if (!form.title.trim()) {
      setError(t.studies.saveError);
      return;
    }

    setIsSaving(true);
    setError(null);
    const totalLessons = form.totalLessons ? Number(form.totalLessons) : 0;
    const safeCompletedLessons = editingCourse
      ? Math.max(0, Math.min(totalLessons, Number(form.completedLessons || 0)))
      : 0;
    const progress = editingCourse && totalLessons > 0
      ? Math.round((safeCompletedLessons / totalLessons) * 100)
      : 0;

    const payload = {
      title: form.title.trim(),
      provider: form.institution.trim() || null,
      lessonCount: totalLessons || null,
      status: form.status,
      startAt: form.startDate || null,
      progress,
    };

    try {
      const saved = editingCourse
        ? await updateStudyCourse({ id: editingCourse.id, ...payload })
        : await createStudyCourse(payload);
      persistMeta(saved.id, { color: form.color, description: form.description.trim() });
      closeDrawer();
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.studies.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteStudyCourse({ id: deleteTarget.id });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.studies.saveError);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    t,
    search,
    activeTab,
    filteredCourses,
    stats,
    profileView,
    calendar,
    isLoading,
    error,
    isDrawerOpen,
    editingCourse,
    form,
    isSaving,
    deleteTarget,
    isDeleting,
    setSearch,
    setActiveTab,
    setForm,
    setDeleteTarget,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    saveCourse,
    confirmDelete,
  };
}

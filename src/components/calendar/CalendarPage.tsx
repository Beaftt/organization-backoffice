'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getMyCalendarShare,
  listCalendarEvents,
  updateCalendarEvent,
  updateMyCalendarShare,
  type CalendarRecurrence,
  type CalendarShare,
} from '@/lib/api/calendar';
import { listDocuments, type DocumentSummary } from '@/lib/api/documents';
import { listFinanceRecurring, type FinanceRecurring } from '@/lib/api/finance';
import { getWorkspaceMemberships } from '@/lib/api/workspace-memberships';
import { getWorkspaceId } from '@/lib/storage/workspace';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  buildFinanceSubscriptionDisplayEvents,
  mergeCalendarDisplayEvents,
} from './calendar-display-events';
import type {
  CalendarDisplayEvent,
  CalendarEvent,
  EventFormValues,
  MemberOption,
  ViewMode,
} from './types';
import { CalendarTopbar } from './topbar/CalendarTopbar';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';
import { DayView } from './views/DayView';
import { YearView } from './views/YearView';
import { EventDrawer } from './drawers/EventDrawer';
import { EventDetailModal } from './modals/EventDetailModal';
import { DeleteEventConfirm } from './modals/DeleteEventConfirm';
import { FiltersModal } from './modals/FiltersModal';
import { SharingModal } from './modals/SharingModal';

interface CalendarPageProps {
  initialOwners?: string[];
  initialFrom?: string;
  initialTo?: string;
  initialTag?: string;
}

const EMPTY_FORM: EventFormValues = {
  title: '',
  description: '',
  startAt: '',
  endAt: '',
  allDay: false,
  tags: '',
  participantIds: [],
  documentIds: '',
  minutesText: '',
  minutesDocumentIds: '',
  recurrenceEnabled: false,
  recurrenceFrequency: 'DAILY',
  recurrenceInterval: '1',
  recurrenceWeekdays: [],
  recurrenceMonthDays: [],
  recurrenceUntil: '',
  documentOnly: false,
};

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toDateTimeInput(value?: string | null): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const date = toDateKey(parsed);
  const hh = String(parsed.getHours()).padStart(2, '0');
  const mm = String(parsed.getMinutes()).padStart(2, '0');
  return `${date}T${hh}:${mm}`;
}

function toIso(value: string): string {
  if (!value) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export function CalendarPage({
  initialOwners = [],
  initialFrom,
  initialTo,
  initialTag = '',
}: CalendarPageProps) {
  const router = useRouter();
  const { language, t } = useLanguage();

  // ── Data state ──────────────────────────────────────────────
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [financeRecurring, setFinanceRecurring] = useState<FinanceRecurring[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [share, setShare] = useState<CalendarShare | null>(null);

  // ── Filter / navigation state ────────────────────────────────
  const [selectedOwners, setSelectedOwners] = useState<string[]>(initialOwners);
  const [fromDate, setFromDate] = useState(initialFrom ?? '');
  const [toDate, setToDate] = useState(initialTo ?? '');
  const [tagFilter, setTagFilter] = useState(initialTag);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // ── UI open/close state ──────────────────────────────────────
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarDisplayEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarDisplayEvent | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // ── Async loading state ───────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShareSaving, setIsShareSaving] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Share form ────────────────────────────────────────────────
  const [shareForm, setShareForm] = useState({ shareWithAll: false, allowedUserIds: [] as string[] });

  // ── Event form ────────────────────────────────────────────────
  const [eventForm, setEventForm] = useState<EventFormValues>(EMPTY_FORM);

  // ── Utilities ─────────────────────────────────────────────────
  const parseCsv = (value: string) =>
    value.split(',').map((s) => s.trim()).filter(Boolean);

  const toggleCsvValue = (value: string, id: string) => {
    const set = new Set(parseCsv(value));
    if (set.has(id)) { set.delete(id); } else { set.add(id); }
    return Array.from(set).join(', ');
  };

  const formatDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
  };

  const formatTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(parsed);
  };

  const formatDayLabel = useCallback((value: string) => {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
  }, []);

  const formatMonthLabel = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);

  const formatShortDate = useCallback((date: Date) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date), []);

  const toLocalDateKey = useCallback((value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return toDateKey(parsed);
  }, []);

  const todayKey = useMemo(() => toDateKey(new Date()), []);

  // ── Range helpers ─────────────────────────────────────────────
  const setRangeForMode = useCallback((mode: ViewMode, anchorKey?: string) => {
    const baseKey = anchorKey || todayKey;
    const base = new Date(`${baseKey}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;

    if (mode === 'day') {
      const k = toDateKey(base);
      setFromDate(k); setToDate(k);
    } else if (mode === 'week') {
      const start = new Date(base);
      start.setDate(base.getDate() - base.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setFromDate(toDateKey(start)); setToDate(toDateKey(end));
    } else if (mode === 'year') {
      setFromDate(toDateKey(new Date(base.getFullYear(), 0, 1)));
      setToDate(toDateKey(new Date(base.getFullYear(), 11, 31)));
    } else {
      setFromDate(toDateKey(new Date(base.getFullYear(), base.getMonth(), 1)));
      setToDate(toDateKey(new Date(base.getFullYear(), base.getMonth() + 1, 0)));
    }
  }, [todayKey]);

  // ── Initial range ─────────────────────────────────────────────
  useEffect(() => {
    if (!initialFrom || !initialTo) {
      const now = new Date();
      setFromDate((p) => p || toDateKey(new Date(now.getFullYear(), now.getMonth(), 1)));
      setToDate((p) => p || toDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
    }
  }, [initialFrom, initialTo]);

  // ── URL sync ──────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedOwners.length) params.set('owners', selectedOwners.join(','));
    else params.delete('owners');
    if (fromDate) params.set('from', fromDate);
    else params.delete('from');
    if (toDate) params.set('to', toDate);
    else params.delete('to');
    if (tagFilter.trim()) params.set('tag', tagFilter.trim());
    else params.delete('tag');
    const qs = params.toString();
    router.replace(`/calendar${qs ? `?${qs}` : ''}`);
  }, [selectedOwners, fromDate, toDate, tagFilter, router]);

  // ── Data loaders ──────────────────────────────────────────────
  const loadMembers = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    try {
      const memberships = await getWorkspaceMemberships(workspaceId);
      setMembers((memberships?.items ?? []).map((m) => ({
        userId: m.userId,
        label: m.displayName || `${m.userId.slice(0, 8)}...`,
        photoUrl: m.photoUrl,
      })));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) return;
      setError(err instanceof ApiError ? err.message : t.calendar.loadError);
    }
  }, [t]);

  const loadFinanceRecurringItems = useCallback(async () => {
    try {
      setFinanceRecurring(await listFinanceRecurring());
    } catch {
      setFinanceRecurring([]);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setIsLoading(true); setError(null);
    try {
      const response = await listCalendarEvents({
        workspaceId,
        from: fromDate ? toIso(`${fromDate}T00:00:00`) : undefined,
        to: toDate ? toIso(`${toDate}T23:59:59`) : undefined,
        ownerUserIds: selectedOwners.length ? selectedOwners : undefined,
      });
      setEvents(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.calendar.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, selectedOwners, t]);

  const loadShare = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setShareError(null);
    try {
      const response = await getMyCalendarShare(workspaceId);
      setShare(response);
      setShareForm({ shareWithAll: response.shareWithAll, allowedUserIds: response.allowedUserIds ?? [] });
    } catch (err) {
      setShareError(err instanceof ApiError ? err.message : t.calendar.shareLoadError);
    }
  }, [t]);

  const loadDocuments = useCallback(async () => {
    setIsDocumentsLoading(true); setDocumentsError(null);
    try {
      const response = await listDocuments({ page: 1, pageSize: 80, orderBy: 'name', orderDirection: 'asc' });
      setDocuments(response.items.filter((doc) => !doc.folderId));
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDocumentsError(err instanceof ApiError ? err.message : ((t as any).documents?.loadError ?? t.calendar.loadError));
    } finally {
      setIsDocumentsLoading(false);
    }
  }, [t]);

  useEffect(() => { void loadMembers(); }, [loadMembers]);
  useEffect(() => { void loadFinanceRecurringItems(); }, [loadFinanceRecurringItems]);
  useEffect(() => { if (fromDate && toDate) void loadEvents(); }, [fromDate, toDate, selectedOwners, loadEvents]);
  useEffect(() => { void loadShare(); }, [loadShare]);
  useEffect(() => { if (isDrawerOpen) void loadDocuments(); }, [isDrawerOpen, loadDocuments]);

  // ── Recurrence engine (preserved exactly) ────────────────────
  const matchesRecurrence = useCallback((date: Date, start: Date, recurrence: CalendarRecurrence) => {
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffMs = targetDate.getTime() - startDate.getTime();
    if (diffMs < 0) return false;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const interval = recurrence.interval ?? 1;

    switch (recurrence.frequency) {
      case 'DAILY': return diffDays % interval === 0;
      case 'WEEKLY': {
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks % interval !== 0) return false;
        const weekdays = recurrence.byWeekday?.length ? recurrence.byWeekday : [start.getDay()];
        return weekdays.includes(targetDate.getDay());
      }
      case 'MONTHLY': {
        const monthDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + (targetDate.getMonth() - startDate.getMonth());
        if (monthDiff % interval !== 0) return false;
        const days = recurrence.byMonthDay?.length ? recurrence.byMonthDay : [start.getDate()];
        return days.includes(targetDate.getDate());
      }
      case 'YEARLY': {
        const yearDiff = targetDate.getFullYear() - startDate.getFullYear();
        if (yearDiff % interval !== 0) return false;
        return targetDate.getMonth() === startDate.getMonth() && targetDate.getDate() === startDate.getDate();
      }
      default: return false;
    }
  }, []);

  const expandRecurringEvents = useCallback((event: CalendarDisplayEvent, rangeStart: Date, rangeEnd: Date) => {
    if (event.source !== 'calendar' || !event.recurrence) return [event];
    const start = new Date(event.startAt);
    if (Number.isNaN(start.getTime())) return [event];
    const duration = event.endAt ? new Date(event.endAt).getTime() - start.getTime() : 0;
    const until = event.recurrence.until ? new Date(event.recurrence.until) : null;
    const limit = until && until < rangeEnd ? until : rangeEnd;
    const results: CalendarDisplayEvent[] = [];

    for (let cursor = new Date(rangeStart); cursor <= limit; cursor.setDate(cursor.getDate() + 1)) {
      if (!matchesRecurrence(cursor, start, event.recurrence)) continue;
      const oStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(),
        start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());
      const oEnd = duration ? new Date(oStart.getTime() + duration) : null;
      results.push({ ...event, startAt: oStart.toISOString(), endAt: oEnd ? oEnd.toISOString() : null });
    }
    return results;
  }, [matchesRecurrence]);

  // ── Derived event lists ───────────────────────────────────────
  const subscriptionEvents = useMemo(() => {
    if (!fromDate || !toDate) {
      return [] as CalendarDisplayEvent[];
    }

    return buildFinanceSubscriptionDisplayEvents(financeRecurring, fromDate, toDate, {
      language,
      badgeLabel:
        t.calendar.subscriptionBadge ??
        (language === 'pt' ? 'Assinatura' : 'Subscription'),
      descriptionLabel:
        t.calendar.subscriptionDescription ??
        (language === 'pt' ? 'Assinatura do Financeiro' : 'Finance subscription'),
    });
  }, [financeRecurring, fromDate, language, t.calendar, toDate]);

  const filteredEvents = useMemo(() => {
    const filter = tagFilter.trim().toLowerCase();
    const mergedEvents = mergeCalendarDisplayEvents(events, subscriptionEvents);

    if (!filter) return mergedEvents;
    return mergedEvents.filter((e) => (e.tags ?? []).some((tag) => tag.toLowerCase().includes(filter)));
  }, [events, subscriptionEvents, tagFilter]);

  const expandedEvents = useMemo(() => {
    if (!fromDate || !toDate) return filteredEvents;
    const rangeStart = new Date(`${fromDate}T00:00:00`);
    const rangeEnd = new Date(`${toDate}T23:59:59`);
    return filteredEvents.flatMap((e) => expandRecurringEvents(e, rangeStart, rangeEnd));
  }, [filteredEvents, fromDate, toDate, expandRecurringEvents]);

  const eventsByDay = useMemo(() =>
    expandedEvents.reduce<Record<string, CalendarDisplayEvent[]>>((acc, event) => {
      const key = toLocalDateKey(event.startAt);
      if (!key) return acc;
      (acc[key] ??= []).push(event);
      return acc;
    }, {}),
  [expandedEvents, toLocalDateKey]);

  // ── View-specific derived state ───────────────────────────────
  const viewAnchorKey = fromDate || todayKey;
  const monthDate = useMemo(() => new Date(`${viewAnchorKey}T00:00:00`), [viewAnchorKey]);

  const weekStartDate = useMemo(() => {
    if (viewMode !== 'week') return null;
    const base = new Date(`${viewAnchorKey}T00:00:00`);
    if (Number.isNaN(base.getTime())) return null;
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    return start;
  }, [viewAnchorKey, viewMode]);

  const weekDays = useMemo(() => {
    if (!weekStartDate) return [] as Array<{ key: string; label: string; day: number }>;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      return { key: toDateKey(d), label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d), day: d.getDate() };
    });
  }, [weekStartDate]);

  const yearReference = useMemo(() => {
    if (viewMode !== 'year') return null;
    const base = new Date(`${viewAnchorKey}T00:00:00`);
    return Number.isNaN(base.getTime()) ? null : base.getFullYear();
  }, [viewAnchorKey, viewMode]);

  const yearMonths = useMemo(() =>
    yearReference !== null ? Array.from({ length: 12 }, (_, i) => new Date(yearReference, i, 1)) : [],
  [yearReference]);

  const eventsByMonth = useMemo(() => {
    if (yearReference === null) return new Map<number, number>();
    const map = new Map<number, number>();
    expandedEvents.forEach((e) => {
      const parsed = new Date(e.startAt);
      if (!Number.isNaN(parsed.getTime()) && parsed.getFullYear() === yearReference) {
        map.set(parsed.getMonth(), (map.get(parsed.getMonth()) ?? 0) + 1);
      }
    });
    return map;
  }, [expandedEvents, yearReference]);

  // ── Range label ───────────────────────────────────────────────
  const rangeLabel = useMemo(() => {
    if (viewMode === 'day') return formatDayLabel(viewAnchorKey);
    if (viewMode === 'week' && weekStartDate) {
      const end = new Date(weekStartDate);
      end.setDate(weekStartDate.getDate() + 6);
      return `${formatShortDate(weekStartDate)} - ${formatShortDate(end)}`;
    }
    if (viewMode === 'year' && yearReference !== null) return `${yearReference}`;
    return formatMonthLabel(monthDate);
  }, [viewMode, viewAnchorKey, weekStartDate, yearReference, monthDate, formatDayLabel, formatShortDate]);

  // ── Navigation handlers ───────────────────────────────────────
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setRangeForMode(mode, fromDate || todayKey);
  };

  const handleToday = () => setRangeForMode(viewMode, todayKey);

  const handlePrevRange = () => {
    const base = new Date(`${fromDate || todayKey}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;
    if (viewMode === 'day') { base.setDate(base.getDate() - 1); setRangeForMode('day', toDateKey(base)); return; }
    if (viewMode === 'week') { base.setDate(base.getDate() - 7); setRangeForMode('week', toDateKey(base)); return; }
    if (viewMode === 'year') { base.setFullYear(base.getFullYear() - 1); setRangeForMode('year', toDateKey(base)); return; }
    const prev = base.getMonth() - 1;
    setFromDate(toDateKey(new Date(base.getFullYear(), prev, 1)));
    setToDate(toDateKey(new Date(base.getFullYear(), prev + 1, 0)));
  };

  const handleNextRange = () => {
    const base = new Date(`${fromDate || todayKey}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;
    if (viewMode === 'day') { base.setDate(base.getDate() + 1); setRangeForMode('day', toDateKey(base)); return; }
    if (viewMode === 'week') { base.setDate(base.getDate() + 7); setRangeForMode('week', toDateKey(base)); return; }
    if (viewMode === 'year') { base.setFullYear(base.getFullYear() + 1); setRangeForMode('year', toDateKey(base)); return; }
    const next = base.getMonth() + 1;
    setFromDate(toDateKey(new Date(base.getFullYear(), next, 1)));
    setToDate(toDateKey(new Date(base.getFullYear(), next + 1, 0)));
  };

  // ── Owner filter ──────────────────────────────────────────────
  const handleToggleOwner = (userId: string) => {
    setSelectedOwners((prev) => {
      if (prev.length === 0) return [userId];
      return prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId];
    });
  };

  // ── Drawer helpers ────────────────────────────────────────────
  const openNewEvent = (dateKey?: string) => {
    setFormError(null);
    setEditingEventId(null);
    setEventForm({ ...EMPTY_FORM, startAt: dateKey ? `${dateKey}T09:00` : '', endAt: dateKey ? `${dateKey}T10:00` : '' });
    setIsDrawerOpen(true);
  };

  const handleEditEvent = (event: CalendarDisplayEvent) => {
    if (event.readOnly) {
      return;
    }

    setFormError(null);
    setEditingEventId(event.id);
    const isSemi = event.recurrence?.frequency === 'MONTHLY' && event.recurrence.interval === 6;
    setEventForm({
      title: event.title,
      description: event.description ?? '',
      startAt: toDateTimeInput(event.startAt),
      endAt: toDateTimeInput(event.endAt ?? null),
      allDay: event.allDay,
      tags: (event.tags ?? []).join(', '),
      participantIds: event.participantIds ?? [],
      documentIds: (event.documentIds ?? []).join(', '),
      minutesText: event.minutesText ?? '',
      minutesDocumentIds: (event.minutesDocumentIds ?? []).join(', '),
      recurrenceEnabled: Boolean(event.recurrence),
      recurrenceFrequency: isSemi ? 'SEMIANNUAL' : (event.recurrence?.frequency ?? 'DAILY'),
      recurrenceInterval: isSemi ? '6' : String(event.recurrence?.interval ?? 1),
      recurrenceWeekdays: event.recurrence?.byWeekday ?? [],
      recurrenceMonthDays: event.recurrence?.byMonthDay ?? [],
      recurrenceUntil: event.recurrence?.until ? toDateKey(new Date(event.recurrence.until)) : '',
      documentOnly: false,
    });
    setSelectedEvent(null);
    setIsDrawerOpen(true);
  };

  const handleToggleDocumentId = (id: string) =>
    setEventForm((prev) => ({ ...prev, documentIds: toggleCsvValue(prev.documentIds, id) }));

  const handleToggleMinutesDocumentId = (id: string) =>
    setEventForm((prev) => ({ ...prev, minutesDocumentIds: toggleCsvValue(prev.minutesDocumentIds, id) }));

  const handleToggleParticipant = (userId: string) =>
    setEventForm((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter((id) => id !== userId)
        : [...prev.participantIds, userId],
    }));

  // ── Submit handler ────────────────────────────────────────────
  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const resolvedTitle = eventForm.title.trim() || (eventForm.documentOnly ? t.calendar.documentOnlyTitle : '');
    if (!resolvedTitle) { setFormError(t.calendar.titleRequired); return; }
    if (!eventForm.startAt) { setFormError(t.calendar.startRequired); return; }

    setIsCreating(true);

    const isSemiannual = eventForm.recurrenceFrequency === 'SEMIANNUAL';
    const recurrence: CalendarRecurrence | null = eventForm.recurrenceEnabled
      ? {
          frequency: (isSemiannual ? 'MONTHLY' : eventForm.recurrenceFrequency) as CalendarRecurrence['frequency'],
          interval: isSemiannual ? 6 : Number(eventForm.recurrenceInterval) || 1,
          byWeekday: eventForm.recurrenceWeekdays.length > 0 ? eventForm.recurrenceWeekdays : undefined,
          byMonthDay: eventForm.recurrenceMonthDays.length > 0 ? eventForm.recurrenceMonthDays : undefined,
          until: eventForm.recurrenceUntil || null,
        }
      : null;

    const payload = {
      title: resolvedTitle,
      description: eventForm.documentOnly ? null : eventForm.description.trim() || null,
      startAt: toIso(eventForm.startAt),
      endAt: eventForm.endAt ? toIso(eventForm.endAt) : null,
      allDay: eventForm.allDay,
      tags: parseCsv(eventForm.tags),
      participantIds: eventForm.participantIds,
      documentIds: parseCsv(eventForm.documentIds),
      minutesText: eventForm.documentOnly ? null : eventForm.minutesText.trim() || null,
      minutesDocumentIds: eventForm.documentOnly ? [] : parseCsv(eventForm.minutesDocumentIds),
      recurrence,
    };

    try {
      if (editingEventId) {
        await updateCalendarEvent({ id: editingEventId, ...payload });
      } else {
        await createCalendarEvent(payload);
      }
      setEventForm(EMPTY_FORM);
      setEditingEventId(null);
      setIsDrawerOpen(false);
      void loadEvents();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t.calendar.createError);
    } finally {
      setIsCreating(false);
    }
  };

  // ── Delete handler ────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteTarget.readOnly) return;
    setIsDeleting(true);
    try {
      await deleteCalendarEvent({ id: deleteTarget.id });
      setDeleteTarget(null);
      void loadEvents();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.calendar.deleteError);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Share handler ─────────────────────────────────────────────
  const handleSaveShare = async () => {
    setIsShareSaving(true); setShareError(null);
    try {
      const response = await updateMyCalendarShare({
        shareWithAll: shareForm.shareWithAll,
        allowedUserIds: shareForm.shareWithAll ? [] : shareForm.allowedUserIds,
      });
      setShare(response);
      setIsShareOpen(false);
    } catch (err) {
      setShareError(err instanceof ApiError ? err.message : t.calendar.shareSaveError);
    } finally {
      setIsShareSaving(false);
    }
  };

  // ── Year-view month select ────────────────────────────────────
  const handleMonthSelect = (month: Date) => {
    setViewMode('month');
    setRangeForMode('month', toDateKey(month));
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="page-transition flex flex-col overflow-hidden rounded-2xl border border-[var(--border)]">
      <CalendarTopbar
        rangeLabel={rangeLabel}
        viewMode={viewMode}
        members={members}
        selectedOwners={selectedOwners}
        onPrev={handlePrevRange}
        onNext={handleNextRange}
        onToday={handleToday}
        onViewChange={handleViewModeChange}
        onToggleOwner={handleToggleOwner}
        onFiltersOpen={() => setIsFiltersOpen(true)}
        onShareOpen={() => setIsShareOpen(true)}
        onNewEvent={() => openNewEvent()}
      />

      {error && !isLoading && (
        <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      {viewMode === 'month' && (
        <MonthView
          monthDate={monthDate}
          todayKey={todayKey}
          eventsByDay={eventsByDay}
          onAddEvent={(dateKey) => openNewEvent(dateKey)}
          onSelectEvent={setSelectedEvent}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          weekDays={weekDays}
          todayKey={todayKey}
          eventsByDay={eventsByDay}
          onAddEvent={(dateKey) => openNewEvent(dateKey)}
          onSelectEvent={setSelectedEvent}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          dateLabel={formatDayLabel(viewAnchorKey)}
          events={eventsByDay[viewAnchorKey] ?? []}
          dateKey={viewAnchorKey}
          onAddEvent={(dateKey) => openNewEvent(dateKey)}
          onSelectEvent={setSelectedEvent}
          formatTime={formatTime}
        />
      )}

      {viewMode === 'year' && (
        <YearView
          yearMonths={yearMonths}
          eventsByMonth={eventsByMonth}
          formatMonthLabel={formatMonthLabel}
          onMonthSelect={handleMonthSelect}
        />
      )}

      {/* Right-panel drawer */}
      <EventDrawer
        open={isDrawerOpen}
        isEditing={Boolean(editingEventId)}
        form={eventForm}
        onChange={setEventForm}
        onSubmit={handleSubmitEvent}
        onClose={() => { setIsDrawerOpen(false); setEditingEventId(null); setFormError(null); }}
        isSubmitting={isCreating}
        error={formError}
        members={members}
        documents={documents}
        isDocumentsLoading={isDocumentsLoading}
        documentsError={documentsError}
        onToggleDocument={handleToggleDocumentId}
        onToggleMinutesDocument={handleToggleMinutesDocumentId}
        onToggleParticipant={handleToggleParticipant}
        parseCsv={parseCsv}
      />

      {/* Event detail modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditEvent}
        onRequestDelete={(event) => { setSelectedEvent(null); setDeleteTarget(event); }}
        formatDateTime={formatDateTime}
        formatTime={formatTime}
      />

      {/* Delete confirmation — z-[60] to render above detail modal */}
      <DeleteEventConfirm
        event={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Filters modal */}
      <FiltersModal
        open={isFiltersOpen}
        fromDate={fromDate}
        toDate={toDate}
        tagFilter={tagFilter}
        members={members}
        selectedOwners={selectedOwners}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onTagChange={setTagFilter}
        onToggleOwner={handleToggleOwner}
        onSelectAll={() => setSelectedOwners([])}
        onClearAll={() => { setSelectedOwners([]); setFromDate(''); setToDate(''); setTagFilter(''); }}
        onClose={() => setIsFiltersOpen(false)}
      />

      {/* Sharing modal */}
      <SharingModal
        open={isShareOpen}
        shareForm={shareForm}
        share={share}
        isShareSaving={isShareSaving}
        shareError={shareError}
        members={members}
        onShareFormChange={setShareForm}
        onSave={handleSaveShare}
        onClose={() => setIsShareOpen(false)}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}

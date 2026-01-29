"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getMyCalendarShare,
  listCalendarEvents,
  updateCalendarEvent,
  updateMyCalendarShare,
  type CalendarEvent,
  type CalendarRecurrence,
  type CalendarShare,
} from "@/lib/api/calendar";
import { listDocuments, type DocumentSummary } from "@/lib/api/documents";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { getMyProfile, listUserProfiles } from "@/lib/api/user-profile";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { useLanguage } from "@/lib/i18n/language-context";
import { useTheme } from "@/components/providers/ThemeProvider";

type MemberOption = {
  userId: string;
  label: string;
  photoUrl?: string | null;
};

type CalendarClientProps = {
  initialOwners?: string[];
  initialFrom?: string;
  initialTo?: string;
  initialTag?: string;
};

export default function CalendarClient({
  initialOwners = [],
  initialFrom,
  initialTo,
  initialTag = "",
}: CalendarClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>(initialOwners);
  const [fromDate, setFromDate] = useState(initialFrom ?? "");
  const [toDate, setToDate] = useState(initialTo ?? "");
  const [tagFilter, setTagFilter] = useState(initialTag);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<CalendarShare | null>(null);
  const [shareForm, setShareForm] = useState({
    shareWithAll: false,
    allowedUserIds: [] as string[],
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isShareSaving, setIsShareSaving] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    allDay: false,
    tags: "",
    participantIds: [] as string[],
    documentIds: "",
    minutesText: "",
    minutesDocumentIds: "",
    recurrenceEnabled: false,
    recurrenceFrequency: "DAILY" as CalendarRecurrence["frequency"],
    recurrenceInterval: "1",
    recurrenceWeekdays: "",
    recurrenceMonthDays: "",
    recurrenceUntil: "",
    documentOnly: false,
  });

  const membersById = useMemo(
    () => new Map(members.map((member) => [member.userId, member])),
    [members],
  );

  const rootDocuments = useMemo(
    () => documents.filter((document) => !document.folderId),
    [documents],
  );

  const textStyle = useMemo(
    () => ({ color: theme === "dark" ? "#fff" : "#000" }),
    [theme],
  );

  const toDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toDateTimeInput = (value?: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    const date = toDateInput(parsed);
    const hours = `${parsed.getHours()}`.padStart(2, "0");
    const minutes = `${parsed.getMinutes()}`.padStart(2, "0");
    return `${date}T${hours}:${minutes}`;
  };

  const monthDate = useMemo(() => {
    if (fromDate) {
      return new Date(`${fromDate}T00:00:00`);
    }
    return new Date();
  }, [fromDate]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(monthDate);
  }, [monthDate]);

  const monthDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const startWeekday = start.getDay();
    const daysInMonth = end.getDate();
    return Array.from({ length: startWeekday + daysInMonth }, (_, index) => {
      if (index < startWeekday) return null;
      return index - startWeekday + 1;
    });
  }, [monthDate]);

  const todayKey = toDateInput(new Date());

  useEffect(() => {
    if (!initialFrom || !initialTo) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFromDate((prev) => prev || toDateInput(start));
      setToDate((prev) => prev || toDateInput(end));
    }
  }, [initialFrom, initialTo]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedOwners.length) {
      params.set("owners", selectedOwners.join(","));
    } else {
      params.delete("owners");
    }
    if (fromDate) {
      params.set("from", fromDate);
    } else {
      params.delete("from");
    }
    if (toDate) {
      params.set("to", toDate);
    } else {
      params.delete("to");
    }
    if (tagFilter.trim()) {
      params.set("tag", tagFilter.trim());
    } else {
      params.delete("tag");
    }

    const queryString = params.toString();
    router.replace(`/calendar${queryString ? `?${queryString}` : ""}`);
  }, [selectedOwners, fromDate, toDate, tagFilter, router]);

  const parseCsv = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const toggleCsvValue = (value: string, id: string) => {
    const set = new Set(parseCsv(value));
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    return Array.from(set).join(", ");
  };

  const parseNumberCsv = (value: string) =>
    value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item));

  const toIsoDateTime = (value: string) => {
    if (!value) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  };

  const formatDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  };

  const formatTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("pt-BR", {
      timeStyle: "short",
    }).format(parsed);
  };

  const formatDayLabel = (value: string) => {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsed);
  };

  const toLocalDateKey = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return toDateInput(parsed);
  };

  const loadMembers = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;

    try {
      const [membershipsResult, profilesResult, myProfileResult] =
        await Promise.allSettled([
          getWorkspaceMemberships(workspaceId),
          listUserProfiles({ page: 1, pageSize: 50 }),
          getMyProfile(),
        ]);

      const memberships =
        membershipsResult.status === "fulfilled" ? membershipsResult.value : null;
      const profiles =
        profilesResult.status === "fulfilled" ? profilesResult.value : null;
      const myProfile =
        myProfileResult.status === "fulfilled" ? myProfileResult.value : null;

      const profileMap = new Map(
        (profiles?.items ?? []).map((profile) => [
          profile.userId,
          {
            label: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim(),
            photoUrl: profile.photoUrl,
          },
        ]),
      );

      const membershipMembers = (memberships?.items ?? []).map((membership) => ({
        userId: membership.userId,
        label:
          profileMap.get(membership.userId)?.label ||
          `${membership.userId.slice(0, 8)}...`,
        photoUrl: profileMap.get(membership.userId)?.photoUrl,
      }));

      const membersMap = new Map(
        membershipMembers.map((member) => [member.userId, member]),
      );

      if (myProfile) {
        const myLabel = `${myProfile.firstName ?? ""} ${
          myProfile.lastName ?? ""
        }`.trim();
        membersMap.set(myProfile.userId, {
          userId: myProfile.userId,
          label: myLabel || `${myProfile.userId.slice(0, 8)}...`,
          photoUrl: myProfile.photoUrl,
        });
      }

      setMembers(Array.from(membersMap.values()));

      const membershipError =
        membershipsResult.status === "rejected" ? membershipsResult.reason : null;
      const profileError =
        profilesResult.status === "rejected" ? profilesResult.reason : null;

      if (
        membershipError instanceof ApiError &&
        membershipError.statusCode === 403
      ) {
        return;
      }

      if (membershipError || profileError) {
        const err = membershipError ?? profileError;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(t.calendar.loadError);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.calendar.loadError);
      }
    }
  }, [t]);

  const loadEvents = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await listCalendarEvents({
        workspaceId,
        from: fromDate ? toIsoDateTime(`${fromDate}T00:00:00`) : undefined,
        to: toDate ? toIsoDateTime(`${toDate}T23:59:59`) : undefined,
        ownerUserIds: selectedOwners.length ? selectedOwners : undefined,
      });
      setEvents(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.calendar.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, selectedOwners, toDate, t]);

  const loadShare = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setShareError(null);

    try {
      const response = await getMyCalendarShare(workspaceId);
      setShare(response);
      setShareForm({
        shareWithAll: response.shareWithAll,
        allowedUserIds: response.allowedUserIds ?? [],
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setShareError(err.message);
      } else {
        setShareError(t.calendar.shareLoadError);
      }
    }
  }, [t]);

  const loadDocuments = useCallback(async () => {
    setIsDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const response = await listDocuments({
        page: 1,
        pageSize: 80,
        orderBy: "name",
        orderDirection: "asc",
      });
      setDocuments(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setDocumentsError(err.message);
      } else {
        setDocumentsError(t.documents?.loadError ?? t.calendar.loadError);
      }
    } finally {
      setIsDocumentsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (fromDate && toDate) {
      void loadEvents();
    }
  }, [fromDate, toDate, selectedOwners, loadEvents]);

  useEffect(() => {
    void loadShare();
  }, [loadShare]);

  useEffect(() => {
    if (isCreateOpen) {
      void loadDocuments();
    }
  }, [isCreateOpen, loadDocuments]);

  const matchesRecurrence = (
    date: Date,
    start: Date,
    recurrence: CalendarRecurrence,
  ) => {
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffMs = targetDate.getTime() - startDate.getTime();
    if (diffMs < 0) return false;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const interval = recurrence.interval ?? 1;

    switch (recurrence.frequency) {
      case "DAILY":
        return diffDays % interval === 0;
      case "WEEKLY": {
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks % interval !== 0) return false;
        const weekdays = recurrence.byWeekday?.length
          ? recurrence.byWeekday
          : [start.getDay()];
        return weekdays.includes(targetDate.getDay());
      }
      case "MONTHLY": {
        const monthDiff =
          (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
          (targetDate.getMonth() - startDate.getMonth());
        if (monthDiff % interval !== 0) return false;
        const days = recurrence.byMonthDay?.length
          ? recurrence.byMonthDay
          : [start.getDate()];
        return days.includes(targetDate.getDate());
      }
      case "YEARLY": {
        const yearDiff = targetDate.getFullYear() - startDate.getFullYear();
        if (yearDiff % interval !== 0) return false;
        return (
          targetDate.getMonth() === startDate.getMonth() &&
          targetDate.getDate() === startDate.getDate()
        );
      }
      default:
        return false;
    }
  };

  const expandRecurringEvents = (
    event: CalendarEvent,
    rangeStart: Date,
    rangeEnd: Date,
  ) => {
    if (!event.recurrence) return [event];
    const start = new Date(event.startAt);
    if (Number.isNaN(start.getTime())) return [event];
    const duration = event.endAt
      ? new Date(event.endAt).getTime() - start.getTime()
      : 0;
    const until = event.recurrence.until ? new Date(event.recurrence.until) : null;
    const limit = until && until < rangeEnd ? until : rangeEnd;
    const results: CalendarEvent[] = [];

    for (
      let cursor = new Date(rangeStart);
      cursor <= limit;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      if (!matchesRecurrence(cursor, start, event.recurrence)) continue;
      const occurrenceStart = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        start.getHours(),
        start.getMinutes(),
        start.getSeconds(),
        start.getMilliseconds(),
      );
      const occurrenceEnd = duration
        ? new Date(occurrenceStart.getTime() + duration)
        : null;
      results.push({
        ...event,
        startAt: occurrenceStart.toISOString(),
        endAt: occurrenceEnd ? occurrenceEnd.toISOString() : null,
      });
    }

    return results;
  };

  const filteredEvents = useMemo(() => {
    const filter = tagFilter.trim().toLowerCase();
    if (!filter) return events;
    return events.filter((event) =>
      (event.tags ?? []).some((tag) => tag.toLowerCase().includes(filter)),
    );
  }, [events, tagFilter]);

  const expandedEvents = useMemo(() => {
    if (!fromDate || !toDate) return filteredEvents;
    const rangeStart = new Date(`${fromDate}T00:00:00`);
    const rangeEnd = new Date(`${toDate}T23:59:59`);
    return filteredEvents.flatMap((event) =>
      expandRecurringEvents(event, rangeStart, rangeEnd),
    );
  }, [filteredEvents, fromDate, toDate]);

  const eventsByDay = useMemo(() => {
    return expandedEvents.reduce<Record<string, CalendarEvent[]>>(
      (acc, event) => {
        const key = toLocalDateKey(event.startAt);
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
      },
      {},
    );
  }, [expandedEvents]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const items = eventsByDay[selectedDay] ?? [];
    return [...items].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
  }, [selectedDay, eventsByDay]);

  const handleToday = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(toDateInput(start));
    setToDate(toDateInput(end));
  };

  const handlePrevMonth = () => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() - 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    setFromDate(toDateInput(start));
    setToDate(toDateInput(end));
  };

  const handleNextMonth = () => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    setFromDate(toDateInput(start));
    setToDate(toDateInput(end));
  };

  const handleCreateFromDay = (dateKey: string) => {
    setFormError(null);
    setEditingEventId(null);
    setEventForm((prev) => ({
      ...prev,
      startAt: `${dateKey}T09:00`,
      endAt: "",
    }));
    setIsCreateOpen(true);
  };

  const handleOpenDayView = (dateKey: string) => {
    setSelectedDay(dateKey);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setFormError(null);
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      description: event.description ?? "",
      startAt: toDateTimeInput(event.startAt),
      endAt: toDateTimeInput(event.endAt ?? null),
      allDay: event.allDay,
      tags: (event.tags ?? []).join(", "),
      participantIds: event.participantIds ?? [],
      documentIds: (event.documentIds ?? []).join(", "),
      minutesText: event.minutesText ?? "",
      minutesDocumentIds: (event.minutesDocumentIds ?? []).join(", "),
      recurrenceEnabled: Boolean(event.recurrence),
      recurrenceFrequency: event.recurrence?.frequency ?? "DAILY",
      recurrenceInterval: String(event.recurrence?.interval ?? 1),
      recurrenceWeekdays: event.recurrence?.byWeekday?.join(",") ?? "",
      recurrenceMonthDays: event.recurrence?.byMonthDay?.join(",") ?? "",
      recurrenceUntil: event.recurrence?.until
        ? toDateInput(new Date(event.recurrence.until))
        : "",
      documentOnly: false,
    });
    setSelectedEvent(null);
    setIsCreateOpen(true);
  };

  const handleToggleDocumentId = (documentId: string) => {
    setEventForm((prev) => ({
      ...prev,
      documentIds: toggleCsvValue(prev.documentIds, documentId),
    }));
  };

  const handleToggleMinutesDocumentId = (documentId: string) => {
    setEventForm((prev) => ({
      ...prev,
      minutesDocumentIds: toggleCsvValue(prev.minutesDocumentIds, documentId),
    }));
  };

  const handleToggleOwner = (userId: string) => {
    setSelectedOwners((prev) =>
      prev.includes(userId)
        ? prev.filter((item) => item !== userId)
        : [...prev, userId],
    );
  };

  const handleToggleParticipant = (userId: string) => {
    setEventForm((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter((item) => item !== userId)
        : [...prev.participantIds, userId],
    }));
  };

  const handleCreateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const resolvedTitle =
      eventForm.title.trim() ||
      (eventForm.documentOnly ? t.calendar.documentOnlyTitle : "");
    if (!resolvedTitle) {
      setFormError(t.calendar.titleRequired);
      return;
    }
    if (!eventForm.startAt) {
      setFormError(t.calendar.startRequired);
      return;
    }

    setIsCreating(true);

    const recurrence: CalendarRecurrence | null = eventForm.recurrenceEnabled
      ? {
          frequency: eventForm.recurrenceFrequency,
          interval: Number(eventForm.recurrenceInterval) || 1,
          byWeekday: eventForm.recurrenceWeekdays
            ? parseNumberCsv(eventForm.recurrenceWeekdays)
            : undefined,
          byMonthDay: eventForm.recurrenceMonthDays
            ? parseNumberCsv(eventForm.recurrenceMonthDays)
            : undefined,
          until: eventForm.recurrenceUntil || null,
        }
      : null;

    try {
      if (editingEventId) {
        await updateCalendarEvent({
          id: editingEventId,
          title: resolvedTitle,
          description: eventForm.documentOnly
            ? null
            : eventForm.description.trim() || null,
          startAt: toIsoDateTime(eventForm.startAt),
          endAt: eventForm.endAt ? toIsoDateTime(eventForm.endAt) : null,
          allDay: eventForm.allDay,
          tags: parseCsv(eventForm.tags),
          participantIds: eventForm.participantIds,
          documentIds: parseCsv(eventForm.documentIds),
          minutesText: eventForm.documentOnly
            ? null
            : eventForm.minutesText.trim() || null,
          minutesDocumentIds: eventForm.documentOnly
            ? []
            : parseCsv(eventForm.minutesDocumentIds),
          recurrence,
        });
      } else {
        await createCalendarEvent({
          title: resolvedTitle,
          description: eventForm.documentOnly
            ? null
            : eventForm.description.trim() || null,
          startAt: toIsoDateTime(eventForm.startAt),
          endAt: eventForm.endAt ? toIsoDateTime(eventForm.endAt) : null,
          allDay: eventForm.allDay,
          tags: parseCsv(eventForm.tags),
          participantIds: eventForm.participantIds,
          documentIds: parseCsv(eventForm.documentIds),
          minutesText: eventForm.documentOnly
            ? null
            : eventForm.minutesText.trim() || null,
          minutesDocumentIds: eventForm.documentOnly
            ? []
            : parseCsv(eventForm.minutesDocumentIds),
          recurrence,
        });
      }
      setEventForm({
        title: "",
        description: "",
        startAt: "",
        endAt: "",
        allDay: false,
        tags: "",
        participantIds: [],
        documentIds: "",
        minutesText: "",
        minutesDocumentIds: "",
        recurrenceEnabled: false,
        recurrenceFrequency: "DAILY",
        recurrenceInterval: "1",
        recurrenceWeekdays: "",
        recurrenceMonthDays: "",
        recurrenceUntil: "",
        documentOnly: false,
      });
      setEditingEventId(null);
      setIsCreateOpen(false);
      void loadEvents();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(t.calendar.createError);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteCalendarEvent({ id });
      void loadEvents();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.calendar.deleteError);
      }
    }
  };

  const handleSaveShare = async () => {
    setIsShareSaving(true);
    setShareError(null);
    try {
      const response = await updateMyCalendarShare({
        shareWithAll: shareForm.shareWithAll,
        allowedUserIds: shareForm.shareWithAll ? [] : shareForm.allowedUserIds,
      });
      setShare(response);
      setIsShareOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setShareError(err.message);
      } else {
        setShareError(t.calendar.shareSaveError);
      }
    } finally {
      setIsShareSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div style={textStyle}>
          <h2 className="text-lg font-semibold" style={textStyle}>
            {t.modules.calendar}
          </h2>
          <p className="text-sm" style={textStyle}>
            {t.calendar.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setIsFiltersOpen(true)}>
            {t.calendar.openFilters}
          </Button>
          <Button variant="secondary" onClick={() => setIsShareOpen(true)}>
            {t.calendar.openShare}
          </Button>
          <Button
            onClick={() => {
              setEditingEventId(null);
              setIsCreateOpen(true);
            }}
          >
            {t.calendar.openCreate}
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={textStyle}>
                {t.calendar.monthLabel}
              </h3>
              <p className="text-sm capitalize" style={textStyle}>
                {monthLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleToday}>
                {t.calendar.todayAction}
              </Button>
              <Button variant="secondary" onClick={handlePrevMonth}>
                {t.calendar.prevMonthAction}
              </Button>
              <Button variant="secondary" onClick={handleNextMonth}>
                {t.calendar.nextMonthAction}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[920px] gap-2">
              <div className="grid grid-cols-7 gap-2 text-xs font-semibold" style={textStyle}>
                {t.calendar.days.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} />;
                  }
                  const dateKey = toDateInput(
                    new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
                  );
                  const dayEvents = eventsByDay[dateKey] ?? [];
                  const isToday = dateKey === todayKey;
                  return (
                    <div
                      key={dateKey}
                      className={`flex min-h-[96px] flex-col gap-2 rounded-2xl border bg-[var(--surface)] p-2 transition sm:min-h-[110px] sm:p-3 ${
                        isToday
                          ? "border-2 border-emerald-400"
                          : "border-[var(--border)]"
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCreateFromDay(dateKey)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleCreateFromDay(dateKey);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between text-xs" style={textStyle}>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="font-semibold" style={textStyle}>
                            {day}
                          </span>
                          <button
                            type="button"
                            className="rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[9px] font-semibold hover:bg-[var(--surface-muted)] sm:px-2 sm:text-[10px]"
                            style={textStyle}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCreateFromDay(dateKey);
                            }}
                            aria-label={t.calendar.openCreate}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[9px] font-semibold hover:bg-[var(--surface-muted)] sm:px-2 sm:text-[10px]"
                            style={textStyle}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenDayView(dateKey);
                            }}
                          >
                            {t.calendar.viewDay}
                          </button>
                        </div>
                      </div>
                      {dayEvents.length ? (
                        <div className="flex flex-col gap-2">
                          {dayEvents.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={(clickEvent) => {
                                clickEvent.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-left text-[11px] font-semibold hover:bg-[var(--surface)] sm:text-xs"
                              style={textStyle}
                            >
                              {event.title}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px]" style={textStyle}>
                          {t.calendar.dayEmpty}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {isLoading ? (
            <p className="text-sm text-zinc-500">{t.calendar.loading}</p>
          ) : null}
        </div>
      </Card>

      {isFiltersOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFiltersOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.calendar.filtersTitle}
                </h3>
                <Button
                  variant="secondary"
                  onClick={() => setIsFiltersOpen(false)}
                >
                  {t.calendar.closeAction}
                </Button>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-2 text-sm text-zinc-600">
                  {t.calendar.filterDateFromLabel}
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-zinc-600">
                  {t.calendar.filterDateToLabel}
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-zinc-600">
                  {t.calendar.tagsLabel}
                  <Input
                    value={tagFilter}
                    onChange={(event) => setTagFilter(event.target.value)}
                    placeholder={t.calendar.tagsPlaceholder}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-zinc-600">
                  {t.calendar.filterOwnersLabel}
                </p>
                <p className="text-xs text-zinc-500">
                  {t.calendar.filterOwnersHint}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {members.length === 0 ? (
                    <span className="text-xs text-zinc-500">
                      {t.calendar.shareNoMembers}
                    </span>
                  ) : (
                    members.map((member) => (
                      <label
                        key={member.userId}
                        className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOwners.includes(member.userId)}
                          onChange={() => handleToggleOwner(member.userId)}
                        />
                        {member.label}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedOwners([]);
                    setTagFilter("");
                    handleToday();
                  }}
                >
                  {t.calendar.clearFilters}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setIsCreateOpen(false);
              setEditingEventId(null);
            }}
          />
          <Card className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <form className="grid gap-4" onSubmit={handleCreateEvent}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.calendar.formTitle}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    {t.calendar.formDescription}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingEventId(null);
                  }}
                >
                  {t.calendar.closeAction}
                </Button>
              </div>
              <details
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                open
              >
                <summary className="cursor-pointer text-sm font-semibold text-zinc-700">
                  {t.calendar.sectionDetails}
                </summary>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm text-zinc-600 md:col-span-2">
                    {t.calendar.titleLabel}
                    <Input
                      value={eventForm.title}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      placeholder={t.calendar.titlePlaceholder}
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-zinc-600 md:col-span-2">
                    {t.calendar.descriptionLabel}
                    <textarea
                      value={eventForm.description}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder={t.calendar.descriptionPlaceholder}
                      className="min-h-[90px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.calendar.startLabel}
                    <Input
                      type="datetime-local"
                      value={eventForm.startAt}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          startAt: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.calendar.endLabel}
                    <Input
                      type="datetime-local"
                      value={eventForm.endAt}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          endAt: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="flex flex-wrap gap-4 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-zinc-600">
                      <input
                        type="checkbox"
                        checked={eventForm.allDay}
                        onChange={(event) =>
                          setEventForm((prev) => ({
                            ...prev,
                            allDay: event.target.checked,
                          }))
                        }
                      />
                      {t.calendar.allDayLabel}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-600">
                      <input
                        type="checkbox"
                        checked={eventForm.documentOnly}
                        onChange={(event) =>
                          setEventForm((prev) => ({
                            ...prev,
                            documentOnly: event.target.checked,
                          }))
                        }
                      />
                      {t.calendar.documentOnlyLabel}
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.calendar.tagsLabel}
                    <Input
                      value={eventForm.tags}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          tags: event.target.value,
                        }))
                      }
                      placeholder={t.calendar.tagsPlaceholder}
                    />
                  </label>
                </div>
              </details>
              <details className="rounded-2xl border border-[var(--border)] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-700">
                  {t.calendar.sectionParticipants}
                </summary>
                <div className="mt-4">
                  <p className="text-sm text-zinc-600">
                    {t.calendar.participantsLabel}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t.calendar.selectUsersHint}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.length === 0 ? (
                      <span className="text-xs text-zinc-500">
                        {t.calendar.shareNoMembers}
                      </span>
                    ) : (
                      members.map((member) => (
                        <label
                          key={member.userId}
                          className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={eventForm.participantIds.includes(member.userId)}
                            onChange={() => handleToggleParticipant(member.userId)}
                          />
                          {member.label}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </details>
              <details className="rounded-2xl border border-[var(--border)] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-700">
                  {t.calendar.sectionDocuments}
                </summary>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-2">
                    <p className="text-sm text-zinc-600">
                      {t.calendar.documentsLabel}
                    </p>
                    {isDocumentsLoading ? (
                      <p className="text-xs text-zinc-500">
                        {t.calendar.documentsLoading}
                      </p>
                    ) : documentsError ? (
                      <p className="text-sm text-red-600">{documentsError}</p>
                    ) : rootDocuments.length ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {rootDocuments.map((document) => (
                          <label
                            key={document.id}
                            className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={parseCsv(eventForm.documentIds).includes(
                                  document.id,
                                )}
                                onChange={() => handleToggleDocumentId(document.id)}
                              />
                              <span className="font-semibold text-zinc-700">
                                {document.name}
                              </span>
                            </div>
                            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                              {document.type}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        {t.calendar.documentsEmpty}
                      </p>
                    )}
                  </div>
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.calendar.minutesLabel}
                    <textarea
                      value={eventForm.minutesText}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          minutesText: event.target.value,
                        }))
                      }
                      placeholder={t.calendar.minutesPlaceholder}
                      className="min-h-[90px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="grid gap-2">
                    <p className="text-sm text-zinc-600">
                      {t.calendar.minutesDocumentsLabel}
                    </p>
                    {isDocumentsLoading ? (
                      <p className="text-xs text-zinc-500">
                        {t.calendar.documentsLoading}
                      </p>
                    ) : documentsError ? (
                      <p className="text-sm text-red-600">{documentsError}</p>
                    ) : rootDocuments.length ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {rootDocuments.map((document) => (
                          <label
                            key={document.id}
                            className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={parseCsv(eventForm.minutesDocumentIds).includes(
                                  document.id,
                                )}
                                onChange={() =>
                                  handleToggleMinutesDocumentId(document.id)
                                }
                              />
                              <span className="font-semibold text-zinc-700">
                                {document.name}
                              </span>
                            </div>
                            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                              {document.type}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        {t.calendar.documentsEmpty}
                      </p>
                    )}
                  </div>
                </div>
              </details>
              <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-700">
                  {t.calendar.sectionRecurrence}
                </summary>
                <div className="mt-4 grid gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-600">
                    <input
                      type="checkbox"
                      checked={eventForm.recurrenceEnabled}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          recurrenceEnabled: event.target.checked,
                        }))
                      }
                    />
                    {t.calendar.recurrenceEnable}
                  </label>
                  {eventForm.recurrenceEnabled ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm text-zinc-600">
                        {t.calendar.recurrenceFrequencyLabel}
                        <select
                          value={eventForm.recurrenceFrequency}
                          onChange={(event) =>
                            setEventForm((prev) => ({
                              ...prev,
                              recurrenceFrequency:
                                event.target.value as CalendarRecurrence["frequency"],
                            }))
                          }
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-zinc-600">
                        {t.calendar.recurrenceIntervalLabel}
                        <Input
                          type="number"
                          min={1}
                          value={eventForm.recurrenceInterval}
                          onChange={(event) =>
                            setEventForm((prev) => ({
                              ...prev,
                              recurrenceInterval: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-zinc-600">
                        {t.calendar.recurrenceWeekdaysLabel}
                        <Input
                          value={eventForm.recurrenceWeekdays}
                          onChange={(event) =>
                            setEventForm((prev) => ({
                              ...prev,
                              recurrenceWeekdays: event.target.value,
                            }))
                          }
                          placeholder="0,1,2"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-zinc-600">
                        {t.calendar.recurrenceMonthDaysLabel}
                        <Input
                          value={eventForm.recurrenceMonthDays}
                          onChange={(event) =>
                            setEventForm((prev) => ({
                              ...prev,
                              recurrenceMonthDays: event.target.value,
                            }))
                          }
                          placeholder="1,15,30"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-zinc-600">
                        {t.calendar.recurrenceUntilLabel}
                        <Input
                          type="date"
                          value={eventForm.recurrenceUntil}
                          onChange={(event) =>
                            setEventForm((prev) => ({
                              ...prev,
                              recurrenceUntil: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              </details>
              {formError ? (
                <p className="text-sm text-red-600">{formError}</p>
              ) : null}
              <div className="flex justify-end">
                <Button type="submit" disabled={isCreating}>
                  {isCreating
                    ? t.calendar.creating
                    : editingEventId
                      ? t.calendar.editAction
                      : t.calendar.createAction}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {isShareOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsShareOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.calendar.shareTitle}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    {t.calendar.shareSubtitle}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setIsShareOpen(false)}
                >
                  {t.calendar.closeAction}
                </Button>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={shareForm.shareWithAll}
                  onChange={(event) =>
                    setShareForm((prev) => ({
                      ...prev,
                      shareWithAll: event.target.checked,
                    }))
                  }
                />
                {t.calendar.shareWithAllLabel}
              </label>
              <div>
                <p className="text-sm text-zinc-600">
                  {t.calendar.shareAllowedUsersLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {members.length === 0 ? (
                    <span className="text-xs text-zinc-500">
                      {t.calendar.shareNoMembers}
                    </span>
                  ) : (
                    members.map((member) => (
                      <label
                        key={member.userId}
                        className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          disabled={shareForm.shareWithAll}
                          checked={shareForm.allowedUserIds.includes(member.userId)}
                          onChange={() =>
                            setShareForm((prev) => ({
                              ...prev,
                              allowedUserIds: prev.allowedUserIds.includes(member.userId)
                                ? prev.allowedUserIds.filter((id) => id !== member.userId)
                                : [...prev.allowedUserIds, member.userId],
                            }))
                          }
                        />
                        {member.label}
                      </label>
                    ))
                  )}
                </div>
              </div>
              {shareError ? (
                <p className="text-sm text-red-600">{shareError}</p>
              ) : null}
              {share ? (
                <p className="text-xs text-zinc-500">
                  {t.calendar.shareLastUpdated} {formatDateTime(share.updatedAt)}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button onClick={handleSaveShare} disabled={isShareSaving}>
                  {isShareSaving ? t.calendar.shareSaving : t.calendar.shareSave}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {selectedDay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedDay(null)}
          />
          <Card className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.calendar.dayViewTitle}
                  </h3>
                  <p className="text-sm text-zinc-600 capitalize">
                    {formatDayLabel(selectedDay)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedDay(null)}
                >
                  {t.calendar.closeAction}
                </Button>
              </div>
              {selectedDayEvents.length ? (
                <div className="grid gap-3">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={`${event.id}-${event.startAt}`}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {event.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {event.allDay
                              ? t.calendar.allDayLabel
                              : `${formatTime(event.startAt)}${
                                  event.endAt ? ` → ${formatTime(event.endAt)}` : ""
                                }`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.recurrence?.frequency ? (
                            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[10px] font-semibold text-zinc-600">
                              {event.recurrence.frequency}
                            </span>
                          ) : null}
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedDay(null);
                              setSelectedEvent(event);
                            }}
                          >
                            {t.calendar.eventDetailsTitle}
                          </Button>
                        </div>
                      </div>
                      {event.description ? (
                        <p className="mt-2 text-sm text-zinc-600">
                          {event.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">{t.calendar.dayEmpty}</p>
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedEvent(null)}
          />
          <Card className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.calendar.eventDetailsTitle}
                </h3>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedEvent(null)}
                >
                  {t.calendar.closeAction}
                </Button>
              </div>
              <div>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {selectedEvent.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatDateTime(selectedEvent.startAt)}
                  {selectedEvent.endAt
                    ? ` → ${formatDateTime(selectedEvent.endAt)}`
                    : ""}
                </p>
              </div>
              {selectedEvent.description ? (
                <p className="text-sm text-zinc-600">
                  {selectedEvent.description}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {(selectedEvent.tags ?? []).length ? (
                  selectedEvent.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">
                    {t.calendar.tagsEmpty}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                {selectedEvent.documentIds?.length ? (
                  <span>
                    {t.calendar.documentsLabel}: {selectedEvent.documentIds.length}
                  </span>
                ) : null}
                {selectedEvent.minutesText ||
                selectedEvent.minutesDocumentIds?.length ? (
                  <span>{t.calendar.minutesTitle}</span>
                ) : null}
                {selectedEvent.recurrence?.frequency ? (
                  <span>{selectedEvent.recurrence.frequency}</span>
                ) : null}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedEvent(null)}
                >
                  {t.calendar.closeAction}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleEditEvent(selectedEvent)}
                >
                  {t.calendar.editAction}
                </Button>
                <Button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  {t.calendar.deleteAction}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

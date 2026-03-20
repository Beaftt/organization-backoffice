'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { DocumentSummary } from '@/lib/api/documents';
import type { EventFormValues, MemberOption } from '../types';
import { EventParticipantsSection } from './EventParticipantsSection';
import { EventDocumentsSection } from './EventDocumentsSection';
import { EventRecurrenceSection } from './EventRecurrenceSection';

interface EventFormProps {
  form: EventFormValues;
  onChange: (form: EventFormValues) => void;
  members: MemberOption[];
  documents: DocumentSummary[];
  isDocumentsLoading: boolean;
  documentsError: string | null;
  onToggleDocument: (id: string) => void;
  onToggleMinutesDocument: (id: string) => void;
  onToggleParticipant: (userId: string) => void;
  parseCsv: (v: string) => string[];
}

export function EventForm({
  form,
  onChange,
  members,
  documents,
  isDocumentsLoading,
  documentsError,
  onToggleDocument,
  onToggleMinutesDocument,
  onToggleParticipant,
  parseCsv,
}: EventFormProps) {
  const { t } = useLanguage();

  const set = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
          {t.calendar.titleLabel}
          <span className="ml-0.5 text-red-500">*</span>
        </p>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder={t.calendar.titlePlaceholder}
          required
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        />
      </div>

      {/* Description */}
      <div>
        <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.descriptionLabel}</p>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder={t.calendar.descriptionPlaceholder}
          rows={2}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        />
      </div>

      {/* Start / End */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.calendar.startLabel}
            <span className="ml-0.5 text-red-500">*</span>
          </p>
          <input
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => set('startAt', e.target.value)}
            required
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.endLabel}</p>
          <input
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => set('endAt', e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--foreground)]/60">
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => set('allDay', e.target.checked)}
            className="accent-[var(--sidebar)]"
          />
          {t.calendar.allDayLabel}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--foreground)]/60">
          <input
            type="checkbox"
            checked={form.documentOnly}
            onChange={(e) => set('documentOnly', e.target.checked)}
            className="accent-[var(--sidebar)]"
          />
          {t.calendar.documentOnlyLabel}
        </label>
      </div>

      {/* Tags */}
      <div>
        <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.tagsLabel}</p>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          placeholder={t.calendar.tagsPlaceholder}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        />
      </div>

      {/* Collapsible sections */}
      <EventParticipantsSection
        participantIds={form.participantIds}
        members={members}
        onToggle={onToggleParticipant}
      />
      <EventDocumentsSection
        documentIds={form.documentIds}
        minutesText={form.minutesText}
        minutesDocumentIds={form.minutesDocumentIds}
        documents={documents}
        isDocumentsLoading={isDocumentsLoading}
        documentsError={documentsError}
        parseCsv={parseCsv}
        onToggleDocument={onToggleDocument}
        onMinutesTextChange={(v) => set('minutesText', v)}
        onToggleMinutesDocument={onToggleMinutesDocument}
      />
      <EventRecurrenceSection
        recurrenceEnabled={form.recurrenceEnabled}
        recurrenceFrequency={form.recurrenceFrequency}
        recurrenceInterval={form.recurrenceInterval}
        recurrenceWeekdays={form.recurrenceWeekdays}
        recurrenceMonthDays={form.recurrenceMonthDays}
        recurrenceUntil={form.recurrenceUntil}
        onChange={(updates) => onChange({ ...form, ...updates })}
      />
    </div>
  );
}

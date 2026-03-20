'use client';

import { createPortal } from 'react-dom';
import { useLanguage } from '@/lib/i18n/language-context';
import type { CalendarEvent } from '../types';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onRequestDelete: (event: CalendarEvent) => void;
  formatDateTime: (v: string) => string;
  formatTime: (v: string) => string;
}

export function EventDetailModal({
  event,
  onClose,
  onEdit,
  onRequestDelete,
  formatDateTime,
  formatTime,
}: EventDetailModalProps) {
  const { t } = useLanguage();

  if (!event) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="truncate text-base font-bold text-[var(--foreground)]">{event.title}</h2>
            <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
              {event.allDay
                ? t.calendar.allDayLabel
                : `${formatDateTime(event.startAt)}${event.endAt ? ` → ${formatTime(event.endAt)}` : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 px-5 py-4">
          {event.description && (
            <p className="text-sm leading-relaxed text-[var(--foreground)]/70">{event.description}</p>
          )}

          {(event.participantIds?.length ?? 0) > 0 && (
            <p className="text-xs text-[var(--foreground)]/50">
              👥 {event.participantIds!.length} {t.calendar.sectionParticipants.toLowerCase()}
            </p>
          )}

          {(event.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags!.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--foreground)]/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {event.recurrence?.frequency && (
            <p className="text-xs text-[var(--foreground)]/40">↺ {event.recurrence.frequency}</p>
          )}

          {!event.description && !(event.participantIds?.length) && !(event.tags?.length) && !event.recurrence?.frequency && (
            <p className="py-1 text-center text-xs italic text-[var(--foreground)]/30">
              {t.calendar.noDetails}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={() => onRequestDelete(event)}
            className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            {t.calendar.deleteAction}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 transition hover:bg-[var(--surface-muted)]"
            >
              {t.calendar.editAction}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[var(--sidebar)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              {t.calendar.closeAction}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

import type { UpcomingEvent } from '../../types';

const DOT_COLOR: Record<UpcomingEvent['type'], string> = {
  calendar: 'bg-[var(--sidebar)]',
  reminder: 'bg-[var(--income)]',
  finance: 'bg-amber-400',
  study: 'bg-orange-400',
};

interface EventItemProps {
  event: UpcomingEvent;
}

export function EventItem({ event }: EventItemProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] py-2.5 last:border-0">
      <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-[var(--foreground)]/50">
        {event.time}
      </span>
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[event.type]}`}
        aria-hidden="true"
      />
      <span className="truncate text-sm text-[var(--foreground)]">{event.title}</span>
    </div>
  );
}

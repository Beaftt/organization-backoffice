'use client';

import { getEventColor } from '../types';
import type { CalendarDisplayEvent } from '../types';

interface EventChipProps {
  event: CalendarDisplayEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function EventChip({ event, onClick }: EventChipProps) {
  const palette =
    event.source === 'finance-subscription'
      ? {
          bg: 'bg-amber-500/15 ring-1 ring-inset ring-amber-500/20',
          text: 'text-amber-700 dark:text-amber-300',
        }
      : getEventColor(event.id);

  return (
    <button
      type="button"
      className={[
        'w-full text-left px-1.5 py-0.5 rounded text-[10.5px] font-medium',
        'truncate transition-opacity hover:opacity-80 cursor-pointer border-none',
        palette.bg,
        palette.text,
      ].join(' ')}
      onClick={onClick}
    >
      {event.title}
    </button>
  );
}

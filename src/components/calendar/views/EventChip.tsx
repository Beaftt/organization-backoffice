'use client';

import { getEventColor } from '../types';
import type { CalendarEvent } from '../types';

interface EventChipProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function EventChip({ event, onClick }: EventChipProps) {
  const { bg, text } = getEventColor(event.id);
  return (
    <button
      type="button"
      className={[
        'w-full text-left px-1.5 py-0.5 rounded text-[10.5px] font-medium',
        'truncate transition-opacity hover:opacity-80 cursor-pointer border-none',
        bg,
        text,
      ].join(' ')}
      onClick={onClick}
    >
      {event.title}
    </button>
  );
}

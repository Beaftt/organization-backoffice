'use client';

import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/language-context';
import { EventItem } from '../cards/EventItem';
import type { UpcomingEvent } from '../../types';

const MAX_EVENTS = 3;

interface DashboardEventsPanelProps {
  events: UpcomingEvent[];
}

export function DashboardEventsPanel({ events }: DashboardEventsPanelProps) {
  const { t } = useLanguage();
  const visible = events.slice(0, MAX_EVENTS);

  return (
    <Card className="flex flex-col gap-4 p-5">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/50">
        {t.dashboard.eventsTitle}
      </p>

      {visible.length === 0 ? (
        <p className="text-sm text-[var(--foreground)]/40">{t.dashboard.eventsEmpty}</p>
      ) : (
        <div className="flex flex-col">
          {visible.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </Card>
  );
}

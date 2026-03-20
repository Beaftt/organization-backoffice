'use client';

import { StudyProfileWidget } from './StudyProfileWidget';
import { MiniCalendarWidget } from './MiniCalendarWidget';
import { PremiumWidget } from './PremiumWidget';
import type { MiniCalendarState, StudyProfileView } from '../types';

type Props = {
  profile: StudyProfileView;
  calendar: MiniCalendarState;
  weekdays: string[];
  premiumHref: string;
  labels: {
    profileSection: string;
    calendarSection: string;
    openCalendar: string;
    profileName: string;
    profileLevel: string;
    profileNextLevel: string;
    profileEdit: string;
    premiumTitle: string;
    premiumSubtitle: string;
    premiumCta: string;
  };
};

export function StudiesSidebar({ profile, calendar, weekdays, premiumHref, labels }: Props) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
      <StudyProfileWidget
        profile={profile}
        labels={{
          section: labels.profileSection,
          profileName: labels.profileName,
          level: labels.profileLevel,
          nextLevel: labels.profileNextLevel,
          edit: labels.profileEdit,
        }}
      />
      <MiniCalendarWidget
        calendar={calendar}
        weekdays={weekdays}
        labels={{ section: labels.calendarSection, open: labels.openCalendar }}
      />
      <PremiumWidget
        title={labels.premiumTitle}
        subtitle={labels.premiumSubtitle}
        cta={labels.premiumCta}
        href={premiumHref}
      />
    </aside>
  );
}

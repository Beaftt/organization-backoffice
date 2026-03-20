"use client";

import { CalendarPage } from "@/components/calendar/CalendarPage";

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
  return (
    <div className="page-transition p-6">
      <CalendarPage
        initialOwners={initialOwners}
        initialFrom={initialFrom}
        initialTo={initialTo}
        initialTag={initialTag}
      />
    </div>
  );
}

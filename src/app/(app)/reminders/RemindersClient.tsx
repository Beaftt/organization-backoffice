"use client";

import RemindersPage from "@/components/reminders/RemindersPage";
import type { ReminderList, ReminderItem } from "@/lib/api/reminders";

type RemindersClientProps = {
  initialLists: ReminderList[];
  initialItemsByList: Record<string, ReminderItem[]>;
  initialSelectedId: string | null;
  initialError?: string | null;
};

export default function RemindersClient(props: RemindersClientProps) {
  return <RemindersPage {...props} />;
}

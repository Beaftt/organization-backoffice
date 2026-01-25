import type { DefaultModule } from "@/lib/storage/preferences";

export const resolveDefaultRoute = (value: DefaultModule | null) => {
  switch (value) {
    case "reminders":
      return "/reminders";
    case "finance":
      return "/finance";
    case "secrets":
      return "/secrets";
    case "documents":
      return "/documents";
    case "hr":
      return "/hr";
    case "purchasing":
      return "/purchasing";
    case "calendar":
      return "/calendar";
    case "dashboard":
    default:
      return "/dashboard";
  }
};

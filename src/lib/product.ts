export type ModuleTier = "core" | "business" | "finance" | "integrations";

export interface PlatformModule {
  name: string;
  description: string;
  tier: ModuleTier;
}

export interface WorkspaceRule {
  title: string;
  description: string;
}

export interface AccountType {
  name: string;
  description: string;
  highlights: string[];
}

export interface Plan {
  name: string;
  audience: string;
  priceLabel: string;
  limits: string[];
  modules: string[];
  integrations: string[];
  badge?: string;
}

export const platformModules: PlatformModule[] = [
  {
    name: "Reminders & automations",
    description:
      "Recurring reminders for taxes, renewals, vaccinations, compliance dates, and more.",
    tier: "core",
  },
  {
    name: "Documents & vault",
    description:
      "Secure storage for contracts, IDs, invoices, and shared assets.",
    tier: "core",
  },
  {
    name: "Secrets",
    description:
      "Shared secrets manager with granular access control and auditing.",
    tier: "core",
  },
  {
    name: "Finance",
    description:
      "Track expenses, income, budgets, and cash flow across workspaces.",
    tier: "finance",
  },
  {
    name: "HR",
    description:
      "Employee records, onboarding checklists, and time-off tracking.",
    tier: "business",
  },
  {
    name: "Studies & courses",
    description:
      "Track courses, assessments, readings, and academic projects.",
    tier: "business",
  },
  {
    name: "Banking sync",
    description:
      "Automatic import of expenses and bank reconciliation.",
    tier: "integrations",
  },
  {
    name: "Notion sync",
    description:
      "Connect workspace data to collaborative docs and databases.",
    tier: "integrations",
  },
];

export const workspaceRules: WorkspaceRule[] = [
  {
    title: "Workspaces",
    description:
      "Each user can create a personal workspace and optionally a company workspace.",
  },
  {
    title: "Roles & permissions",
    description:
      "Workspace admins control module access and edit/view permissions per member.",
  },
  {
    title: "Sharing",
    description:
      "Personal workspaces can be shared with at least one person to enable collaboration.",
  },
];

export const accountTypes: AccountType[] = [
  {
    name: "Personal account",
    description:
      "Ideal for individuals managing household or freelance operations.",
    highlights: [
      "One personal workspace",
      "Share with at least one collaborator",
      "Access to reminders, documents, and secrets",
    ],
  },
  {
    name: "Work account",
    description:
      "Built for teams and companies that need multiple business modules.",
    highlights: [
      "Multiple members with role-based access",
      "Business modules like HR and studies",
      "Workspace-level policies and approvals",
    ],
  },
];

export const plans: Plan[] = [
  {
    name: "Free personal",
    audience: "Individuals",
    priceLabel: "$0 / month",
    limits: ["1 workspace", "1 collaborator", "Basic automation limits"],
    modules: ["Reminders", "Documents", "Secrets"],
    integrations: ["Calendar (basic)", "Email notifications"],
    badge: "Starter",
  },
  {
    name: "Free work",
    audience: "Small teams",
    priceLabel: "$0 / month",
    limits: ["1 workspace", "Up to 5 people", "Limited automation"],
    modules: ["Reminders", "Documents", "Secrets", "HR"],
    integrations: ["Calendar", "Email notifications"],
    badge: "Team",
  },
  {
    name: "Initial",
    audience: "Growing teams",
    priceLabel: "Custom",
    limits: ["Up to 3 workspaces", "Up to 15 people"],
    modules: ["Finance", "HR", "Studies"],
    integrations: ["Notion", "Accounting export"],
  },
  {
    name: "Intermediate",
    audience: "Scaling operations",
    priceLabel: "Custom",
    limits: ["Up to 10 workspaces", "Up to 50 people"],
    modules: ["Finance", "HR", "Studies", "Approvals"],
    integrations: ["Notion", "Banking sync", "Payroll export"],
  },
  {
    name: "Advanced",
    audience: "Enterprise",
    priceLabel: "Custom",
    limits: ["Unlimited workspaces", "Unlimited people"],
    modules: ["All modules", "Advanced analytics", "Custom workflows"],
    integrations: ["Banking sync", "SSO", "Custom API"],
    badge: "Enterprise",
  },
];

export const integrationHighlights = [
  "Notion and knowledge base syncing",
  "Banking and expense ingestion",
  "Calendar-based reminders",
  "Custom APIs for HR and procurement",
];

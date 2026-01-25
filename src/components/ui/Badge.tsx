import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Badge({ children, variant = "primary" }: BadgeProps) {
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white"
      : "bg-zinc-100 text-zinc-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const styles =
    variant === "primary"
      ? "bg-[var(--sidebar)] text-white hover:brightness-110"
      : variant === "secondary"
        ? "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        : variant === "danger"
          ? "border border-[var(--danger-border)] bg-[var(--danger)] text-[var(--danger-text)] hover:bg-[var(--danger-hover)]"
          : "text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

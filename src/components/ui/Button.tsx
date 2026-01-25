import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-[var(--sidebar)] text-white hover:brightness-110"
      : variant === "secondary"
        ? "border border-[var(--border)] bg-white text-zinc-700 hover:bg-[var(--surface-muted)]"
        : "text-zinc-600 hover:text-zinc-900";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

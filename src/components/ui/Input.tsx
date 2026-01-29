import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
      {label ? (
        <span className="font-medium text-[var(--foreground)]/90">
          {label}
        </span>
      ) : null}
      <input
        className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400 ${className}`}
        {...props}
      />
    </label>
  );
}

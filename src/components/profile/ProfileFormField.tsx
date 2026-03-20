import type { ChangeEvent } from "react";

interface ProfileFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  hint?: string;
  placeholder?: string;
}

export function ProfileFormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
  hint,
  placeholder,
}: ProfileFormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/50"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={[
          "rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors",
          readOnly
            ? "cursor-not-allowed opacity-60"
            : "focus:[border-color:var(--sidebar)] focus:ring-2 focus:ring-[var(--sidebar)]/20",
        ].join(" ")}
      />
      {hint && (
        <p className="text-xs text-[var(--foreground)]/40">{hint}</p>
      )}
    </div>
  );
}

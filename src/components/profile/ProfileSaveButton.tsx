"use client";

import { useEffect } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface ProfileSaveButtonProps {
  saveState: SaveState;
  onSave: () => void;
  onStateChange: (state: SaveState) => void;
  labels: { save: string; saving: string; saved: string; error: string };
}

export function ProfileSaveButton({
  saveState,
  onSave,
  onStateChange,
  labels,
}: ProfileSaveButtonProps) {
  useEffect(() => {
    if (saveState === "saved") {
      const timer = setTimeout(() => onStateChange("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState, onStateChange]);

  const label =
    saveState === "saving"
      ? labels.saving
      : saveState === "saved"
        ? `${labels.saved} ✓`
        : saveState === "error"
          ? labels.error
          : labels.save;

  const colorClass =
    saveState === "saved"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : saveState === "error"
        ? "bg-red-600 hover:bg-red-700 text-white"
        : "bg-[var(--sidebar)] hover:brightness-110 text-white";

  return (
    <button
      type="button"
      onClick={onSave}
      disabled={saveState === "saving"}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        colorClass,
      ].join(" ")}
    >
      {saveState === "saving" && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {label}
    </button>
  );
}

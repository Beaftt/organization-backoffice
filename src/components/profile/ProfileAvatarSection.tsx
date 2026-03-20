"use client";

import type { ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProfileAvatarSectionProps {
  photoUrl: string | null;
  initials: string;
  displayName: string | null;
  email: string;
  isUploading: boolean;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  uploadError: string | null;
}

export function ProfileAvatarSection({
  photoUrl,
  initials,
  displayName,
  email,
  isUploading,
  onPhotoChange,
  onRemovePhoto,
  uploadError,
}: ProfileAvatarSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] p-6">
      {/* Avatar with upload overlay */}
      <div className="relative h-24 w-24">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={displayName ?? email}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--sidebar)]/15 text-2xl font-bold text-[var(--sidebar)]">
            {initials}
          </div>
        )}

        {/* Upload overlay */}
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-100 transition-opacity sm:opacity-0 sm:hover:opacity-100 sm:focus-within:opacity-100"
          aria-label={t.profile.changePhoto}
        >
          <span className="text-xs font-semibold text-white">
            {isUploading ? "…" : t.profile.changePhoto}
          </span>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPhotoChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Display name / email */}
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          {displayName ?? email}
        </p>
        {displayName && (
          <p className="text-xs text-[var(--foreground)]/50">{email}</p>
        )}
      </div>

      {/* Section label */}
      <p className="text-center text-xs text-[var(--foreground)]/40">
        {t.profile.photo}
      </p>

      {/* Remove photo */}
      {photoUrl && (
        <Button variant="secondary" onClick={onRemovePhoto} disabled={isUploading}>
          {t.profile.removePhoto}
        </Button>
      )}

      {/* Upload error */}
      {uploadError && (
        <p className="text-center text-xs text-red-500">{uploadError}</p>
      )}
    </div>
  );
}

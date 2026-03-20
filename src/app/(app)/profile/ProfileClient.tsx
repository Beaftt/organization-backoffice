"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getDefaultModule, setDefaultModule, type DefaultModule } from "@/lib/storage/preferences";
import { getMyProfile, updateMyProfile, uploadMyProfilePhoto } from "@/lib/api/user-profile";
import { getMyUser } from "@/lib/api/users";
import { ProfileAvatarSection } from "@/components/profile/ProfileAvatarSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { SaveState } from "@/components/profile/ProfileSaveButton";

export default function ProfileClient() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [defaultModule, setDefaultModuleState] = useState<DefaultModule>("dashboard");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResult, userResult] = await Promise.allSettled([
          getMyProfile(),
          getMyUser(),
        ]);
        if (profileResult.status === "fulfilled") {
          const fullName = [profileResult.value.firstName, profileResult.value.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          if (fullName) setName(fullName);
          setPhotoUrl(profileResult.value.photoUrl ?? null);
        }
        if (userResult.status === "fulfilled") {
          setEmail(userResult.value.email ?? "");
        }
      } catch {
        // silent — shows empty state
      }
    };

    void loadData();
    const storedDefault = getDefaultModule();
    if (storedDefault) setDefaultModuleState(storedDefault);
  }, []);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError(t.profile.errorSave);
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    uploadMyProfilePhoto(file)
      .then((profile) => {
        setPhotoUrl(profile.photoUrl ?? null);
        window.dispatchEvent(new Event("profile-updated"));
      })
      .catch(() => {
        setUploadError(t.profile.errorSave);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      await updateMyProfile({ photoUrl: null });
      setPhotoUrl(null);
      window.dispatchEvent(new Event("profile-updated"));
    } catch {
      setUploadError(t.profile.errorSave);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await updateMyProfile({ firstName: name.trim() || null, lastName: null });
      window.dispatchEvent(new Event("profile-updated"));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const displayName = name.trim() && name.trim() !== email ? name.trim() : null;
  const initials = displayName
    ? displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("")
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">{t.profile.title}</h2>
        <p className="mt-0.5 text-sm text-[var(--foreground)]/50">{t.profile.subtitle}</p>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <ProfileAvatarSection
          photoUrl={photoUrl}
          initials={initials}
          displayName={displayName}
          email={email}
          isUploading={isUploading}
          onPhotoChange={handlePhotoChange}
          onRemovePhoto={handleRemovePhoto}
          uploadError={uploadError}
        />
        <ProfileForm
          name={name}
          email={email}
          defaultModule={defaultModule}
          saveState={saveState}
          onNameChange={setName}
          onDefaultModuleChange={(module) => {
            setDefaultModuleState(module);
            setDefaultModule(module);
          }}
          onSave={handleSave}
          onSaveStateChange={setSaveState}
        />
      </div>
    </div>
  );
}


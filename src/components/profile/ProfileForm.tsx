"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { ProfileFormField } from "@/components/profile/ProfileFormField";
import { ProfileSaveButton, type SaveState } from "@/components/profile/ProfileSaveButton";
import type { DefaultModule } from "@/lib/storage/preferences";

interface ProfileFormProps {
  name: string;
  email: string;
  defaultModule: DefaultModule;
  saveState: SaveState;
  onNameChange: (value: string) => void;
  onDefaultModuleChange: (module: DefaultModule) => void;
  onSave: () => void;
  onSaveStateChange: (state: SaveState) => void;
}

export function ProfileForm({
  name,
  email,
  defaultModule,
  saveState,
  onNameChange,
  onDefaultModuleChange,
  onSave,
  onSaveStateChange,
}: ProfileFormProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      {/* Basic info */}
      <section className="flex flex-col gap-4 rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
          {t.profile.sectionBasic}
        </p>
        <ProfileFormField
          id="profile-name"
          label={t.profile.name}
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.profile.namePlaceholder}
        />
        <ProfileFormField
          id="profile-email"
          label={t.profile.email}
          type="email"
          value={email}
          readOnly
          hint={t.profile.emailReadOnly}
        />
      </section>

      {/* Preferences */}
      <section className="flex flex-col gap-4 rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
          {t.profile.sectionPreferences}
        </p>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="default-module"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/50"
          >
            {t.profile.defaultModule}
          </label>
          <select
            id="default-module"
            value={defaultModule}
            onChange={(e) => onDefaultModuleChange(e.target.value as DefaultModule)}
            className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors focus:[border-color:var(--sidebar)]"
          >
            <option value="dashboard">{t.layout.dashboard}</option>
            <option value="reminders">{t.modules.reminders}</option>
            <option value="finance">{t.modules.finance}</option>
            <option value="secrets">{t.modules.secrets}</option>
            <option value="documents">{t.modules.documents}</option>
            <option value="hr">{t.modules.hr}</option>
            <option value="studies">{t.modules.studies}</option>
            <option value="calendar">{t.modules.calendar}</option>
          </select>
          <p className="text-xs text-[var(--foreground)]/40">{t.profile.defaultModuleHint}</p>
        </div>
      </section>

      {/* Danger zone */}
      <section className="flex flex-col gap-4 rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500/70">
          {t.profile.sectionDanger}
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled
            className="inline-flex w-fit items-center justify-center rounded-full border border-red-500/30 px-5 py-2 text-sm font-semibold text-red-500 opacity-50 transition duration-200"
          >
            {t.profile.deleteAccount}
          </button>
          <p className="text-xs text-[var(--foreground)]/40">{t.profile.deleteAccountWarning}</p>
        </div>
      </section>

      {/* Save button */}
      <div>
        <ProfileSaveButton
          saveState={saveState}
          onSave={onSave}
          onStateChange={onSaveStateChange}
          labels={{
            save: t.profile.save,
            saving: t.profile.saving,
            saved: t.profile.saved,
            error: t.profile.errorSave,
          }}
        />
      </div>
    </div>
  );
}

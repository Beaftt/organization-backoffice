"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { getDefaultModule, setDefaultModule, type DefaultModule } from "@/lib/storage/preferences";
import { getMyProfile, updateMyProfile, uploadMyProfilePhoto } from "@/lib/api/user-profile";

export default function ProfileClient() {
  const [name, setName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [defaultModule, setDefaultModuleState] = useState<DefaultModule>("dashboard");
  const { t } = useLanguage();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();
        const fullName = [profile.firstName, profile.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (fullName) {
          setName(fullName);
        }
        setPhotoPreview(profile.photoUrl ?? null);
      } catch {
        setPhotoPreview(null);
      }
    };

    loadProfile();
    const storedDefault = getDefaultModule();
    if (storedDefault) {
      setDefaultModuleState(storedDefault);
    }
  }, []);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida.");
      return;
    }

    const upload = async () => {
      setIsUploading(true);
      try {
        const profile = await uploadMyProfilePhoto(file);
        setPhotoPreview(profile.photoUrl ?? null);
        setError(null);
        window.dispatchEvent(new Event("profile-updated"));
      } catch {
        setError("Não foi possível atualizar a foto.");
      } finally {
        setIsUploading(false);
      }
    };

    upload();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMyProfile({ firstName: name.trim() || null, lastName: null });
      window.dispatchEvent(new Event("profile-updated"));
    } catch {
      setError("Não foi possível salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <h2 className="text-lg font-semibold">Perfil</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Atualize sua foto, nome e informações básicas.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <Input
          label="Nome"
          placeholder="Seu nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label className="flex flex-col gap-2 text-sm text-zinc-600">
          Foto de perfil
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            disabled={isUploading}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-zinc-600">
          {t.auth.defaultModuleLabel}
          <select
            value={defaultModule}
            onChange={(event) => {
              const next = event.target.value as DefaultModule;
              setDefaultModuleState(next);
              setDefaultModule(next);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="dashboard">{t.layout.dashboard}</option>
            <option value="reminders">{t.modules.reminders}</option>
            <option value="finance">{t.modules.finance}</option>
            <option value="secrets">{t.modules.secrets}</option>
            <option value="documents">{t.modules.documents}</option>
            <option value="hr">{t.modules.hr}</option>
            <option value="purchasing">{t.modules.purchasing}</option>
            <option value="calendar">{t.modules.calendar}</option>
          </select>
        </label>
        {photoPreview ? (
          <div className="flex items-center gap-4">
            <Image
              src={photoPreview}
              alt="Pré-visualização"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
              unoptimized
            />
            <Button
              variant="secondary"
              onClick={async () => {
                setIsSaving(true);
                try {
                  await updateMyProfile({ photoUrl: null });
                  setPhotoPreview(null);
                  window.dispatchEvent(new Event("profile-updated"));
                } catch {
                  setError("Não foi possível remover a foto.");
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
            >
              Remover foto
            </Button>
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <Button className="mt-6" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>
    </Card>
  );
}

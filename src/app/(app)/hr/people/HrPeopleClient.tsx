"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { ApiError } from "@/lib/api/client";
import {
  createHrPerson,
  deleteHrPerson,
  listHrPeople,
  type HrPerson,
} from "@/lib/api/hr";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { formatPhone, isValidEmail, stripPhone } from "@/lib/validation";

type ModalProps = {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ open, title, closeLabel, onClose, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="modal-overlay fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="modal-content w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default function HrPeopleClient() {
  const { t } = useLanguage();
  const [people, setPeople] = useState<HrPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

  const [personForm, setPersonForm] = useState({
    fullName: "",
    email: "",
    roleTitle: "",
    department: "",
    phone: "",
    notes: "",
  });

  const loadPeople = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await listHrPeople({ workspaceId, pageSize: 100 });
      setPeople(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [t.hr.loadError]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const handleCreatePerson = async () => {
    const fullName = personForm.fullName.trim();
    if (!fullName) return;
    if (fullName.length < 2) {
      setError(t.hr.validationName);
      return;
    }
    const email = personForm.email.trim();
    if (email && !isValidEmail(email)) {
      setError(t.hr.validationEmail);
      return;
    }
    const phoneDigits = stripPhone(personForm.phone);
    setSaving(true);
    setError(null);
    try {
      await createHrPerson({
        fullName,
        email: email || null,
        roleTitle: personForm.roleTitle.trim() || null,
        department: personForm.department.trim() || null,
        phone: phoneDigits || null,
        notes: personForm.notes.trim() || null,
      });
      setPersonForm({
        fullName: "",
        email: "",
        roleTitle: "",
        department: "",
        phone: "",
        notes: "",
      });
      setIsPersonModalOpen(false);
      await loadPeople();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePerson = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteHrPerson({ id });
      await loadPeople();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.deleteError);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t.hr.peopleTitle}</h2>
        <p className="text-sm text-zinc-500">{t.hr.peopleSubtitle}</p>
        <p className="text-xs text-zinc-400">{t.hr.peopleLinkHint}</p>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              {t.hr.cards.totalLabel}
            </p>
            <p className="text-3xl font-semibold">
              {isLoading ? "—" : people.length}
            </p>
          </div>
          <Button onClick={() => setIsPersonModalOpen(true)}>
            {t.hr.createPerson}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-zinc-500">{t.hr.loading}</p>
        ) : people.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.hr.peopleEmpty}</p>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="list-item-animate flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{person.fullName}</p>
                <p className="text-xs text-zinc-500">
                  {[person.roleTitle, person.department, person.email]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleDeletePerson(person.id)}
                disabled={saving}
              >
                {t.hr.deleteAction}
              </Button>
            </div>
          ))
        )}
      </div>

      <Modal
        open={isPersonModalOpen}
        title={t.hr.createPerson}
        closeLabel={t.hr.closeAction}
        onClose={() => setIsPersonModalOpen(false)}
      >
        <div className="grid gap-3">
          <Input
            placeholder={t.hr.form.fullName}
            value={personForm.fullName}
            onChange={(event) =>
              setPersonForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
          />
          <Input
            placeholder={t.hr.form.email}
            value={personForm.email}
            onChange={(event) =>
              setPersonForm((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <Input
            placeholder={t.hr.form.roleTitle}
            value={personForm.roleTitle}
            onChange={(event) =>
              setPersonForm((prev) => ({ ...prev, roleTitle: event.target.value }))
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder={t.hr.form.department}
              value={personForm.department}
              onChange={(event) =>
                setPersonForm((prev) => ({
                  ...prev,
                  department: event.target.value,
                }))
              }
            />
            <Input
              placeholder={t.hr.form.phone}
              value={personForm.phone}
              onChange={(event) =>
                setPersonForm((prev) => ({
                  ...prev,
                  phone: formatPhone(event.target.value),
                }))
              }
            />
          </div>
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            placeholder={t.hr.form.notes}
            value={personForm.notes}
            onChange={(event) =>
              setPersonForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
          <Button onClick={handleCreatePerson} disabled={saving}>
            {t.hr.createPerson}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import Image, { type ImageLoader } from 'next/image';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import type { UserLookup } from '@/lib/api/users';
import type { DocumentSummary } from '../types';

const profileImageLoader: ImageLoader = ({ src }) => src;

type Props = {
  isOpen: boolean;
  document: DocumentSummary | null;
  title: string;
  searchEmail: string;
  selectedUserIds: string[];
  members: UserLookup[];
  membersLoading: boolean;
  membersError: string | null;
  error: string | null;
  searchError: string | null;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onSearchEmailChange: (value: string) => void;
  onToggleUser: (id: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSearchUser: () => Promise<void>;
  onClose: () => void;
};

export function MentionModal({
  isOpen,
  document,
  title,
  searchEmail,
  selectedUserIds,
  members,
  membersLoading,
  membersError,
  error,
  searchError,
  isSaving,
  onTitleChange,
  onSearchEmailChange,
  onToggleUser,
  onSubmit,
  onSearchUser,
  onClose,
}: Props) {
  const { t } = useLanguage();

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t.documents.mention.title}</h3>
            <p className="mt-0.5 text-xs text-[var(--foreground)]/55">
              {t.documents.mention.subtitle}
            </p>
          </div>
          <button
            className="text-zinc-500 hover:text-zinc-700"
            onClick={onClose}
            type="button"
            aria-label={t.documents.cancel}
          >
            ✕
          </button>
        </div>

        <p className="mt-2 truncate text-sm text-[var(--foreground)]/60">
          {document.name}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label={t.documents.mention.subject}
            placeholder={t.documents.mention.subjectPlaceholder}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />

          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label={t.documents.mention.searchMember}
                  placeholder={t.documents.references.mentionUsersPlaceholder}
                  value={searchEmail}
                  onChange={(e) => onSearchEmailChange(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void onSearchUser()}
              >
                {t.documents.references.mentionSearchAction}
              </Button>
            </div>

            {membersLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : membersError ? (
              <p className="text-sm text-red-500">{membersError}</p>
            ) : members.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-[var(--foreground)]/45">
                  {t.documents.mention.empty}
                </p>
                <p className="mt-1 text-xs text-[var(--foreground)]/45">
                  {t.documents.mention.emptyHint}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const isSelected = selectedUserIds.includes(member.id);
                  const initials = (member.name || member.email)
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => onToggleUser(member.id)}
                      className={`relative flex h-11 w-11 items-center justify-center rounded-full border ${
                        isSelected
                          ? 'border-[var(--sidebar)] ring-2 ring-[var(--sidebar)]'
                          : 'border-[var(--border)]'
                      }`}
                      title={member.name || member.email}
                      aria-label={member.name || member.email}
                    >
                      {member.pictureUrl ? (
                        <Image
                          src={member.pictureUrl}
                          alt={member.name || member.email}
                          width={44}
                          height={44}
                          loader={profileImageLoader}
                          unoptimized
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-zinc-600">
                          {initials}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {searchError ? (
              <p className="text-sm text-red-500">{searchError}</p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t.documents.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t.documents.saving : t.documents.mention.notify}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

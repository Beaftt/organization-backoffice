'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import {
  type DocumentFolder,
  type DocumentReference,
  listDocumentFolders,
  listDocuments,
  type DocumentSummary,
  type DocumentReferenceKind,
  type DocumentReferenceModule,
  type DocumentType,
} from '@/lib/api/documents';
import { type UserLookup } from '@/lib/api/users';
import { getWorkspaceMemberships } from '@/lib/api/workspace-memberships';
import { listUsers } from '@/lib/api/users';
import { getWorkspaceId } from '@/lib/storage/workspace';
import { useLanguage } from '@/lib/i18n/language-context';

const pageSize = 6;

type Params = {
  initialQuery?: string;
  initialFolder?: string;
  initialType?: string;
  initialSort?: string;
  initialPage?: number;
};

function normalizeType(value: string): 'all' | DocumentType {
  if (value === 'all') return 'all';
  const normalized = value.toUpperCase();
  if (['PDF', 'IMAGE', 'SPREADSHEET', 'OTHER'].includes(normalized)) {
    return normalized as DocumentType;
  }
  return 'all';
}

export function useDocumentsPage({
  initialQuery = '',
  initialFolder = 'all',
  initialType = 'all',
  initialSort = 'updatedAt',
  initialPage = 1,
}: Params) {
  const { t } = useLanguage();
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [folderFilter, setFolderFilter] = useState(initialFolder);
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType>(
    normalizeType(initialType),
  );
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name'>(
    initialSort === 'name' ? 'name' : 'updatedAt',
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(Math.max(1, initialPage));

  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [records, setRecords] = useState<DocumentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foldersError, setFoldersError] = useState<string | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<DocumentSummary | null>(null);
  const [references, setReferences] = useState<DocumentReference[]>([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referencesError, setReferencesError] = useState<string | null>(null);
  const [referenceForm, setReferenceForm] = useState({ title: '', mentionedUsers: '' });
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isSavingReference, setIsSavingReference] = useState(false);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderForm, setFolderForm] = useState({ name: '', description: '', parentId: '' });
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isSavingFolder, setIsSavingFolder] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: '',
    type: 'PDF' as DocumentType,
    folderId: '',
    tags: '',
    description: '',
  });

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveDocument, setMoveDocument] = useState<DocumentSummary | null>(null);
  const [moveDocumentFolderId, setMoveDocumentFolderId] = useState('');
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [moveFolderId, setMoveFolderId] = useState<string | null>(null);
  const [moveFolderParentId, setMoveFolderParentId] = useState('');
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const [moveFolderError, setMoveFolderError] = useState<string | null>(null);

  const [renameDocumentId, setRenameDocumentId] = useState<string | null>(null);
  const [renameDocumentName, setRenameDocumentName] = useState('');
  const [renameDocumentError, setRenameDocumentError] = useState<string | null>(null);

  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [deleteFolderName, setDeleteFolderName] = useState('');
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [deleteDocumentName, setDeleteDocumentName] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [linkDocument, setLinkDocument] = useState<DocumentSummary | null>(null);
  const [linkForm, setLinkForm] = useState({
    module: 'FINANCE' as DocumentReferenceModule,
    sourceType: '',
    sourceId: '',
    title: '',
  });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const [mentionDocument, setMentionDocument] = useState<DocumentSummary | null>(null);
  const [mentionError, setMentionError] = useState<string | null>(null);
  const [mentionTitle, setMentionTitle] = useState('');
  const [mentionSearchEmail, setMentionSearchEmail] = useState('');
  const [mentionSearchError, setMentionSearchError] = useState<string | null>(null);
  const [mentionSelectedUserIds, setMentionSelectedUserIds] = useState<string[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<UserLookup[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [membersDisabled, setMembersDisabled] = useState(false);

  const folderMap = useMemo(() => {
    const map: Record<string, DocumentFolder> = {};
    folders.forEach((folder) => {
      map[folder.id] = folder;
    });
    return map;
  }, [folders]);

  const folderPaths = useMemo(() => {
    const cache: Record<string, string> = {};
    const buildPath = (id: string): string => {
      if (cache[id]) return cache[id];
      const folder = folderMap[id];
      if (!folder) return '';
      if (!folder.parentId) {
        cache[id] = folder.name;
        return cache[id];
      }
      const parentPath = buildPath(folder.parentId);
      cache[id] = parentPath ? `${parentPath} / ${folder.name}` : folder.name;
      return cache[id];
    };
    folders.forEach((folder) => buildPath(folder.id));
    return cache;
  }, [folderMap, folders]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const moduleLabels: Record<DocumentReferenceModule, string> = useMemo(
    () => ({
      DOCUMENTS: t.modules.documents,
      FINANCE: t.modules.finance,
      CALENDAR: t.modules.calendar,
      REMINDERS: t.modules.reminders,
      HR: t.modules.hr,
      PURCHASING: t.modules.studies,
      SECRETS: t.modules.secrets,
      CUSTOM: t.documents.references.customModule,
    }),
    [t],
  );

  const referenceKindLabels: Record<DocumentReferenceKind, string> = useMemo(
    () => ({ MENTION: t.documents.references.kindMention, SCHEDULED: t.documents.references.kindScheduled }),
    [t],
  );

  const updateQueryParams = useCallback(
    (updates: Partial<{ q: string; folder: string; type: string; sort: string; page: number | string }>) => {
      const params = new URLSearchParams();
      const q = updates.q ?? query;
      const folder = updates.folder ?? folderFilter;
      const type = updates.type ?? typeFilter;
      const sort = updates.sort ?? sortBy;
      const nextPage = updates.page ?? page;
      if (q) params.set('q', String(q));
      if (folder !== 'all') params.set('folder', String(folder));
      if (type !== 'all') params.set('type', String(type));
      if (sort !== 'updatedAt') params.set('sort', String(sort));
      if (String(nextPage) !== '1') params.set('page', String(nextPage));
      const search = params.toString();
      router.replace(search ? `?${search}` : '?', { scroll: false });
    },
    [query, folderFilter, typeFilter, sortBy, page, router],
  );

  const loadFolders = useCallback(async () => {
    setIsFoldersLoading(true);
    setFoldersError(null);
    try {
      const response = await listDocumentFolders({ page: 1, pageSize: 100, orderBy: 'name', orderDirection: 'asc' });
      setFolders(response.items);
    } catch (err) {
      setFoldersError(err instanceof ApiError ? err.message : t.documents.loadError);
    } finally {
      setIsFoldersLoading(false);
    }
  }, [t.documents.loadError]);

  const loadDocuments = useCallback(async (nextPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listDocuments({
        page: nextPage,
        pageSize,
        orderBy: sortBy,
        orderDirection: sortBy === 'updatedAt' ? 'desc' : 'asc',
        type: typeFilter === 'all' ? undefined : typeFilter,
        folderId: folderFilter === 'all' ? undefined : folderFilter,
        query: query || undefined,
      });
      setRecords(response.items);
      setTotal(response.total);
      setPage(response.page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.documents.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [query, folderFilter, typeFilter, sortBy, t.documents.loadError]);

  useEffect(() => { void loadFolders(); }, [loadFolders]);
  useEffect(() => { void loadDocuments(page); }, [loadDocuments, page]);

  useEffect(() => {
    if (!mentionDocument) return;
    if (membersDisabled || workspaceMembers.length || membersLoading) return;

    const loadWorkspaceMembers = async () => {
      setMembersLoading(true);
      setMembersError(null);
      try {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
          setMembersError(t.documents.moveError);
          return;
        }
        const memberships = await getWorkspaceMemberships(workspaceId);
        const activeIds = new Set(
          memberships.items
            .filter((membership) => membership.status === 'ACTIVE')
            .map((membership) => membership.userId),
        );
        const usersResponse = await listUsers({ page: 1, pageSize: 100 });
        const members = usersResponse.items.filter((user) => activeIds.has(user.id));
        setWorkspaceMembers(members);
      } catch (err) {
        if (err instanceof ApiError && err.code === 'entitlements.module_disabled') {
          setMembersDisabled(true);
          setWorkspaceMembers([]);
          setMembersError(null);
          return;
        }
        setMembersError(err instanceof ApiError ? err.message : t.documents.loadError);
      } finally {
        setMembersLoading(false);
      }
    };

    void loadWorkspaceMembers();
  }, [mentionDocument, membersDisabled, workspaceMembers.length, membersLoading, t.documents.moveError, t.documents.loadError]);

  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
    setFolderError(null);
    setFolderForm({ name: '', description: '', parentId: '' });
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadError(null);
  };

  return {
    t,
    page,
    pageCount,
    total,
    query,
    folderFilter,
    typeFilter,
    sortBy,
    viewMode,
    folders,
    folderMap,
    folderPaths,
    records,
    isLoading,
    isFoldersLoading,
    error,
    foldersError,
    selectedDocument,
    references,
    referencesLoading,
    referencesError,
    referenceForm,
    referenceError,
    isSavingReference,
    isFolderModalOpen,
    folderForm,
    folderError,
    isSavingFolder,
    isUploadModalOpen,
    uploadForm,
    uploadError,
    isUploading,
    isMoveModalOpen,
    moveDocument,
    moveDocumentFolderId,
    moveError,
    isMoving,
    renameFolderId,
    renameFolderName,
    moveFolderId,
    moveFolderParentId,
    isMovingFolder,
    moveFolderError,
    renameDocumentId,
    renameDocumentName,
    renameDocumentError,
    deleteFolderId,
    deleteFolderName,
    deleteDocumentId,
    deleteDocumentName,
    deleteError,
    linkDocument,
    linkForm,
    linkError,
    isLinking,
    mentionDocument,
    mentionError,
    mentionTitle,
    mentionSearchEmail,
    mentionSearchError,
    mentionSelectedUserIds,
    workspaceMembers,
    membersLoading,
    membersError,
    moduleLabels,
    referenceKindLabels,
    setPage,
    setQuery,
    setFolderFilter,
    setTypeFilter,
    setSortBy,
    setViewMode,
    setSelectedDocument,
    setReferenceForm,
    setReferences,
    setReferencesLoading,
    setReferencesError,
    setReferenceError,
    setIsSavingReference,
    setIsFolderModalOpen,
    setFolderForm,
    setFolderError,
    setIsSavingFolder,
    setIsUploadModalOpen,
    setUploadForm,
    setUploadError,
    setIsUploading,
    setIsMoveModalOpen,
    setMoveDocument,
    setMoveDocumentFolderId,
    setMoveError,
    setIsMoving,
    setRenameFolderId,
    setRenameFolderName,
    setMoveFolderId,
    setMoveFolderParentId,
    setMoveFolderError,
    setIsMovingFolder,
    setRenameDocumentId,
    setRenameDocumentName,
    setRenameDocumentError,
    setDeleteFolderId,
    setDeleteFolderName,
    setDeleteDocumentId,
    setDeleteDocumentName,
    setDeleteError,
    setLinkDocument,
    setLinkForm,
    setLinkError,
    setIsLinking,
    setMentionDocument,
    setMentionTitle,
    setMentionSearchEmail,
    setMentionSelectedUserIds,
    setMentionError,
    setMentionSearchError,
    setWorkspaceMembers,
    setMembersLoading,
    setMembersError,
    setMembersDisabled,
    updateQueryParams,
    loadFolders,
    loadDocuments,
    closeFolderModal,
    closeUploadModal,
  };
}

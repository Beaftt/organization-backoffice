"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image, { type ImageLoader } from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api/client";
import {
  createDocumentFolder,
  createDocumentReference,
  deleteDocument,
  deleteDocumentFolder,
  listDocumentFolders,
  listDocuments,
  listDocumentReferences,
  updateDocument,
  updateDocumentFolder,
  uploadDocumentFile,
  type DocumentFolder,
  type DocumentReference,
  type DocumentReferenceKind,
  type DocumentReferenceModule,
  type DocumentSummary,
  type DocumentType,
} from "@/lib/api/documents";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { listUsers, lookupUserByEmail, type UserLookup } from "@/lib/api/users";
import { useLanguage } from "@/lib/i18n/language-context";

const pageSize = 6;

const profileImageLoader: ImageLoader = ({ src }) => src;

type DocumentsClientProps = {
  initialQuery?: string;
  initialFolder?: string;
  initialType?: string;
  initialSort?: string;
  initialPage?: number;
};

export default function DocumentsClient({
  initialQuery = "",
  initialFolder = "all",
  initialType = "all",
  initialSort = "updatedAt",
  initialPage = 1,
}: DocumentsClientProps) {
  const normalizeType = (value: string): "all" | DocumentType => {
    if (value === "all") return "all";
    const normalized = value.toUpperCase();
    if (
      normalized === "PDF" ||
      normalized === "IMAGE" ||
      normalized === "SPREADSHEET" ||
      normalized === "OTHER"
    ) {
      return normalized as DocumentType;
    }
    return "all";
  };

  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [folderFilter, setFolderFilter] = useState(initialFolder);
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>(
    normalizeType(initialType),
  );
  const [sortBy, setSortBy] = useState<"updatedAt" | "name">(
    initialSort === "name" ? "name" : "updatedAt",
  );
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [records, setRecords] = useState<DocumentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foldersError, setFoldersError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentSummary | null>(null);
  const [references, setReferences] = useState<DocumentReference[]>([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referencesError, setReferencesError] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderForm, setFolderForm] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: "",
    type: "PDF" as DocumentType,
    folderId: "",
    tags: "",
    description: "",
  });
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveDocument, setMoveDocument] = useState<DocumentSummary | null>(null);
  const [moveDocumentFolderId, setMoveDocumentFolderId] = useState<string>("");
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [referenceForm, setReferenceForm] = useState({
    title: "",
    mentionedUsers: "",
  });
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isSavingReference, setIsSavingReference] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [moveFolderId, setMoveFolderId] = useState<string | null>(null);
  const [moveFolderParentId, setMoveFolderParentId] = useState("");
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const [moveFolderError, setMoveFolderError] = useState<string | null>(null);
  const [renameDocumentId, setRenameDocumentId] = useState<string | null>(null);
  const [renameDocumentName, setRenameDocumentName] = useState("");
  const [renameDocumentError, setRenameDocumentError] = useState<string | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [deleteFolderName, setDeleteFolderName] = useState("");
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [deleteDocumentName, setDeleteDocumentName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [linkDocument, setLinkDocument] = useState<DocumentSummary | null>(null);
  const [linkForm, setLinkForm] = useState({
    module: "FINANCE" as DocumentReferenceModule,
    sourceType: "",
    sourceId: "",
    title: "",
  });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [mentionDocument, setMentionDocument] = useState<DocumentSummary | null>(null);
  const [mentionError, setMentionError] = useState<string | null>(null);
  const [mentionTitle, setMentionTitle] = useState("");
  const [mentionSearchEmail, setMentionSearchEmail] = useState("");
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
      if (!folder) return "";
      if (!folder.parentId) {
        cache[id] = folder.name;
        return cache[id];
      }
      const parentPath = buildPath(folder.parentId);
      const path = parentPath ? `${parentPath} / ${folder.name}` : folder.name;
      cache[id] = path;
      return path;
    };

    folders.forEach((folder) => {
      buildPath(folder.id);
    });

    return cache;
  }, [folders, folderMap]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total]);

  const typeLabels = useMemo(
    () => ({
      PDF: t.documents.typePdf,
      IMAGE: t.documents.typeImage,
      SPREADSHEET: t.documents.typeSpreadsheet,
      OTHER: t.documents.typeOther,
    }),
    [t],
  );

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
    () => ({
      MENTION: t.documents.references.kindMention,
      SCHEDULED: t.documents.references.kindScheduled,
    }),
    [t],
  );

  const updateQueryParams = useCallback(
    (
      updates: Partial<{
        q: string;
        folder: string;
        type: string;
        sort: string;
        page: number | string;
      }>,
    ) => {
      const nextQuery = updates.q ?? query;
      const nextFolder = updates.folder ?? folderFilter;
      const nextType = updates.type ?? typeFilter;
      const nextSort = updates.sort ?? sortBy;
      const nextPage = updates.page ?? page;

      const params = new URLSearchParams();
      if (nextQuery) params.set("q", String(nextQuery));
      if (nextFolder && nextFolder !== "all") params.set("folder", String(nextFolder));
      if (nextType && nextType !== "all") params.set("type", String(nextType));
      if (nextSort && nextSort !== "updatedAt") params.set("sort", String(nextSort));
      if (String(nextPage) !== "1") params.set("page", String(nextPage));

      const search = params.toString();
      router.replace(search ? `?${search}` : "?", { scroll: false });
    },
    [query, folderFilter, typeFilter, sortBy, page, router],
  );

  const loadFolders = useCallback(async () => {
    setIsFoldersLoading(true);
    setFoldersError(null);

    try {
      const response = await listDocumentFolders({
        page: 1,
        pageSize: 100,
        orderBy: "name",
        orderDirection: "asc",
      });
      setFolders(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setFoldersError(err.message);
      } else {
        setFoldersError(t.documents.loadError);
      }
    } finally {
      setIsFoldersLoading(false);
    }
  }, [t]);

  const loadDocuments = useCallback(
    async (nextPage: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listDocuments({
          page: nextPage,
          pageSize,
          orderBy: sortBy,
          orderDirection: sortBy === "updatedAt" ? "desc" : "asc",
          type: typeFilter === "all" ? undefined : typeFilter,
          folderId: folderFilter === "all" ? undefined : folderFilter,
          query: query || undefined,
        });
        setRecords(response.items);
        setTotal(response.total);
        setPage(response.page);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(t.documents.loadError);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [query, folderFilter, typeFilter, sortBy, t],
  );

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    loadDocuments(page);
  }, [loadDocuments, page]);

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
            .filter((membership) => membership.status === "ACTIVE")
            .map((membership) => membership.userId),
        );

        const usersResponse = await listUsers({ page: 1, pageSize: 100 });
        const members = usersResponse.items.filter((user) => activeIds.has(user.id));
        setWorkspaceMembers(members);
      } catch (err) {
        if (err instanceof ApiError && err.code === "entitlements.module_disabled") {
          setMembersDisabled(true);
          setWorkspaceMembers([]);
          setMembersError(null);
          return;
        }
        if (err instanceof ApiError) {
          setMembersError(err.message);
        } else {
          setMembersError(t.documents.loadError);
        }
      } finally {
        setMembersLoading(false);
      }
    };

    void loadWorkspaceMembers();
  }, [mentionDocument, membersDisabled, workspaceMembers.length, membersLoading, t.documents.loadError, t.documents.moveError]);

  const handleMoveDocument = async (
    documentId: string,
    nextFolderId: string | null,
  ) => {
    setMoveError(null);
    setIsMoving(true);

    try {
      await updateDocument({
        id: documentId,
        folderId: nextFolderId ?? null,
      });

      setIsMoveModalOpen(false);
      setMoveDocument(null);
      setMoveDocumentFolderId("");
      setPage(1);
      await Promise.all([loadDocuments(1), loadFolders()]);
    } catch (err) {
      if (err instanceof ApiError) {
        setMoveError(err.message);
      } else {
        setMoveError(t.documents.moveError);
      }
    } finally {
      setIsMoving(false);
    }
  };

  const handleRenameFolder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!renameFolderId) return;
    setFolderError(null);
    setIsSavingFolder(true);

    try {
      await updateDocumentFolder({
        id: renameFolderId,
        name: renameFolderName.trim(),
      });
      setRenameFolderId(null);
      setRenameFolderName("");
      await loadFolders();
    } catch (err) {
      if (err instanceof ApiError) {
        setFolderError(err.message);
      } else {
        setFolderError(t.documents.folderRenameError);
      }
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleRenameDocument = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!renameDocumentId) return;
    setRenameDocumentError(null);
    setIsMoving(true);

    try {
      await updateDocument({
        id: renameDocumentId,
        name: renameDocumentName.trim(),
      });
      setRenameDocumentId(null);
      setRenameDocumentName("");
      await loadDocuments(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setRenameDocumentError(err.message);
      } else {
        setRenameDocumentError(t.documents.renameError);
      }
    } finally {
      setIsMoving(false);
    }
  };

  const handleMoveFolder = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!moveFolderId) return;
    setMoveFolderError(null);
    setIsMovingFolder(true);

    try {
      await updateDocumentFolder({
        id: moveFolderId,
        parentId: moveFolderParentId || null,
      });
      setMoveFolderId(null);
      setMoveFolderParentId("");
      await loadFolders();
    } catch (err) {
      if (err instanceof ApiError) {
        setMoveFolderError(err.message);
      } else {
        setMoveFolderError(t.documents.moveError);
      }
    } finally {
      setIsMovingFolder(false);
    }
  };

  const parseMentionedUsers = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleMentionDocument = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!mentionDocument) return;
    setMentionError(null);
    if (!mentionTitle.trim()) {
      setMentionError(t.documents.references.titleRequired);
      return;
    }
    if (!mentionSelectedUserIds.length) {
      setMentionError(t.documents.references.mentionSelectionRequired);
      return;
    }
    setIsSavingReference(true);

    try {
      await createDocumentReference({
        documentId: mentionDocument.id,
        sourceModule: "DOCUMENTS",
        sourceType: "document",
        sourceId: mentionDocument.id,
        title: mentionTitle.trim(),
        referenceKind: "MENTION",
        mentionedUserIds: mentionSelectedUserIds,
      });

      setMentionDocument(null);
      setMentionTitle("");
      setMentionSearchEmail("");
      setMentionSelectedUserIds([]);
      await loadDocuments(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setMentionError(err.message);
      } else {
        setMentionError(t.documents.references.createError);
      }
    } finally {
      setIsSavingReference(false);
    }
  };

  const handleLinkDocument = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!linkDocument) return;
    setLinkError(null);
    setIsLinking(true);

    try {
      await createDocumentReference({
        documentId: linkDocument.id,
        sourceModule: linkForm.module,
        sourceType: linkForm.sourceType.trim(),
        sourceId: linkForm.sourceId.trim(),
        title: linkForm.title.trim(),
        referenceKind: "MENTION",
      });

      setLinkDocument(null);
      setLinkForm({ module: "FINANCE", sourceType: "", sourceId: "", title: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        setLinkError(err.message);
      } else {
        setLinkError(t.documents.linkError);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleDropOnFolder = async (
    event: React.DragEvent<HTMLElement>,
    nextFolderId: string | null,
  ) => {
    event.preventDefault();
    const documentId = event.dataTransfer.getData("text/plain");
    if (!documentId) return;
    await handleMoveDocument(documentId, nextFolderId);
  };

  const handleCreateReference = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setReferenceError(null);

    if (!selectedDocument) return;
    if (!referenceForm.title.trim()) {
      setReferenceError(t.documents.references.titleRequired);
      return;
    }

    setIsSavingReference(true);
    try {
      await createDocumentReference({
        documentId: selectedDocument.id,
        sourceModule: "DOCUMENTS",
        sourceType: "document",
        sourceId: selectedDocument.id,
        title: referenceForm.title.trim(),
        referenceKind: "MENTION",
        mentionedUserIds: parseMentionedUsers(referenceForm.mentionedUsers),
      });

      setReferenceForm({ title: "", mentionedUsers: "" });
      const response = await listDocumentReferences({
        documentId: selectedDocument.id,
        page: 1,
        pageSize: 50,
        orderBy: "createdAt",
        orderDirection: "desc",
      });
      setReferences(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setReferenceError(err.message);
      } else {
        setReferenceError(t.documents.references.createError);
      }
    } finally {
      setIsSavingReference(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return;
    setDeleteError(null);
    setIsMoving(true);

    try {
      await deleteDocumentFolder({ id: deleteFolderId });
      setDeleteFolderId(null);
      setDeleteFolderName("");
      await Promise.all([loadFolders(), loadDocuments(1)]);
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(err.message);
      } else {
        setDeleteError(t.documents.deleteError);
      }
    } finally {
      setIsMoving(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocumentId) return;
    setDeleteError(null);
    setIsMoving(true);

    try {
      await deleteDocument({ id: deleteDocumentId });
      setDeleteDocumentId(null);
      setDeleteDocumentName("");
      await loadDocuments(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(err.message);
      } else {
        setDeleteError(t.documents.deleteError);
      }
    } finally {
      setIsMoving(false);
    }
  };

  const renderFolderCard = (folder: DocumentFolder) => (
    <div
      key={folder.id}
      role="button"
      tabIndex={0}
      onClick={() => {
        setFolderFilter(folder.id);
        setPage(1);
        updateQueryParams({ folder: folder.id, page: 1 });
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setFolderFilter(folder.id);
          setPage(1);
          updateQueryParams({ folder: folder.id, page: 1 });
        }
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => handleDropOnFolder(event, folder.id)}
      className={`group flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
        folderFilter === folder.id ? "ring-2 ring-[var(--primary)]" : ""
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f22] text-lg text-white">
        📁
      </span>
      <div className="flex-1 text-left">
        <p className="font-semibold text-[var(--foreground)]">{folder.name}</p>
        <p className="text-xs text-zinc-500">
          {folderPaths[folder.id] ?? folder.name}
        </p>
      </div>
      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
        {folder.totalFiles}
      </span>
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        <details className="group">
          <summary className="list-none rounded-full px-2 py-1 text-zinc-500 hover:bg-[var(--surface-muted)]">
            ⋯
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-xs shadow-xl">
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
              onClick={() => {
                setRenameFolderId(folder.id);
                setRenameFolderName(folder.name);
              }}
            >
              {t.documents.renameAction}
            </button>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
              onClick={() => {
                setMoveFolderId(folder.id);
                setMoveFolderParentId(folder.parentId ?? "");
                setMoveFolderError(null);
              }}
            >
              {t.documents.moveAction}
            </button>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left text-red-600 hover:bg-[var(--surface-muted)]"
              onClick={() => {
                setDeleteFolderId(folder.id);
                setDeleteFolderName(folder.name);
                setDeleteError(null);
              }}
            >
              {t.documents.deleteAction}
            </button>
          </div>
        </details>
      </div>
    </div>
  );

  const handleViewReferences = async (document: DocumentSummary) => {
    setSelectedDocument(document);
    setReferences([]);
    setReferencesError(null);
    setReferenceForm({ title: "", mentionedUsers: "" });
    setReferenceError(null);
    setReferencesLoading(true);

    try {
      const response = await listDocumentReferences({
        documentId: document.id,
        page: 1,
        pageSize: 50,
        orderBy: "createdAt",
        orderDirection: "desc",
      });

      setReferences(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setReferencesError(err.message);
      } else {
        setReferencesError(t.documents.references.loadError);
      }
    } finally {
      setReferencesLoading(false);
    }
  };

  const referenceModules = useMemo(() => {
    const modules = new Set<DocumentReferenceModule>();
    references.forEach((reference) => modules.add(reference.sourceModule));
    return Array.from(modules);
  }, [references]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("pt-BR");
  };

  const resolveTypeFromFile = (file?: File | null): DocumentType => {
    if (!file) return "PDF";
    const name = file.name.toLowerCase();
    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
      return "IMAGE";
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
      return "SPREADSHEET";
    }
    if (name.endsWith(".pdf")) {
      return "PDF";
    }
    return "OTHER";
  };

  const handleCreateFolder = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFolderError(null);

    if (!folderForm.name.trim()) {
      setFolderError(t.documents.folderRequired);
      return;
    }

    setIsSavingFolder(true);

    try {
      const created = await createDocumentFolder({
        name: folderForm.name.trim(),
        description: folderForm.description.trim() || undefined,
        parentId: folderForm.parentId || undefined,
      });

      setIsFolderModalOpen(false);
      setFolderForm({ name: "", description: "", parentId: "" });
      await loadFolders();
      setFolderFilter(created.id);
      setPage(1);
      updateQueryParams({ folder: created.id, page: 1 });
    } catch (err) {
      if (err instanceof ApiError) {
        setFolderError(err.message);
      } else {
        setFolderError(t.documents.folderSaveError);
      }
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);

    if (!uploadForm.file) {
      setUploadError(t.documents.fileRequired);
      return;
    }

    if (!uploadForm.name.trim()) {
      setUploadError(t.documents.fileNameRequired);
      return;
    }

    setIsUploading(true);

    try {
      const tags = uploadForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await uploadDocumentFile({
        file: uploadForm.file,
        name: uploadForm.name.trim(),
        type: uploadForm.type,
        folderId: uploadForm.folderId || undefined,
        tags: tags.length ? tags : undefined,
        description: uploadForm.description.trim() || undefined,
      });

      setIsUploadModalOpen(false);
      setUploadForm({
        file: null,
        name: "",
        type: "PDF",
        folderId: "",
        tags: "",
        description: "",
      });
      setPage(1);
      await Promise.all([loadDocuments(1), loadFolders()]);
    } catch (err) {
      if (err instanceof ApiError) {
        setUploadError(err.message);
      } else {
        setUploadError(t.documents.uploadError);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.modules.documents}</h2>
          <p className="text-sm text-zinc-600">{t.documents.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setIsFolderModalOpen(true)}>
            {t.documents.newFolder}
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            {t.documents.uploadFile}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label={t.documents.searchLabel}
              placeholder={t.documents.searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                updateQueryParams({ q: event.target.value, page: 1 });
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.typeLabel}
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as "all" | DocumentType);
                setPage(1);
                updateQueryParams({ type: event.target.value, page: 1 });
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.documents.typeAll}</option>
              <option value="PDF">{t.documents.typePdf}</option>
              <option value="IMAGE">{t.documents.typeImage}</option>
              <option value="SPREADSHEET">{t.documents.typeSpreadsheet}</option>
              <option value="OTHER">{t.documents.typeOther}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.sortLabel}
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as "updatedAt" | "name");
                setPage(1);
                updateQueryParams({ sort: event.target.value, page: 1 });
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="updatedAt">{t.documents.sortUpdated}</option>
              <option value="name">{t.documents.sortName}</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                {t.documents.foldersTitle}
              </p>
              <p className="text-sm text-zinc-600">{t.documents.dragHint}</p>
            </div>
            <span className="text-xs text-zinc-500">
              {t.documents.currentFolderLabel}: {folderFilter === "all"
                ? t.documents.allFolders
                : folderPaths[folderFilter] ?? folderMap[folderFilter]?.name}
            </span>
          </div>

          {isFoldersLoading ? (
            <Skeleton className="h-[160px] w-full" />
          ) : foldersError ? (
            <p className="text-sm text-red-500">{foldersError}</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setFolderFilter("all");
                  setPage(1);
                  updateQueryParams({ folder: "all", page: 1 });
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropOnFolder(event, null)}
                className={`group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:bg-[var(--surface-muted)] ${
                  folderFilter === "all" ? "ring-2 ring-[var(--primary)]" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f22] text-lg text-white">
                  🗂️
                </span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[var(--foreground)]">
                    {t.documents.allFolders}
                  </p>
                  <p className="text-xs text-zinc-500">{t.documents.folderRoot}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
                  {total}
                </span>
              </button>

              {folders.map((folder) => renderFolderCard(folder))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                {t.documents.filesTitle}
              </p>
              <p className="text-sm text-zinc-600">{t.documents.dragHint}</p>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-zinc-500">{t.documents.empty}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {records.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", item.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f1f22] text-2xl text-white">
                      {item.type === "IMAGE"
                        ? "🖼️"
                        : item.type === "PDF"
                          ? "📄"
                          : item.type === "SPREADSHEET"
                            ? "📊"
                            : "📁"}
                    </span>
                    <div className="relative">
                      <details className="group">
                        <summary className="list-none rounded-full px-2 py-1 text-zinc-500 hover:bg-[var(--surface-muted)]">
                          ⋯
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-xs shadow-xl">
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => handleViewReferences(item)}
                          >
                            {t.documents.historyAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setRenameDocumentId(item.id);
                              setRenameDocumentName(item.name);
                            }}
                          >
                            {t.documents.renameAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setMoveDocument(item);
                              setMoveDocumentFolderId(item.folderId ?? "");
                              setMoveError(null);
                              setIsMoveModalOpen(true);
                            }}
                          >
                            {t.documents.moveAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setMentionDocument(item);
                              setReferenceForm({ title: "", mentionedUsers: "" });
                              setMentionError(null);
                            }}
                          >
                            {t.documents.mentionAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setLinkDocument(item);
                              setLinkForm({
                                module: "FINANCE",
                                sourceType: "",
                                sourceId: "",
                                title: "",
                              });
                              setLinkError(null);
                            }}
                          >
                            {t.documents.linkAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left text-red-600 hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setDeleteDocumentId(item.id);
                              setDeleteDocumentName(item.name);
                              setDeleteError(null);
                            }}
                          >
                            {t.documents.deleteAction}
                          </button>
                        </div>
                      </details>
                    </div>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-[var(--foreground)]">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.documents.folderLabel}: {item.folderId
                        ? folderPaths[item.folderId] || folderMap[item.folderId]?.name
                        : t.documents.folderRoot}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.documents.tableUpdated}: {formatDate(item.updatedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.tags?.length ? (
                      item.tags.map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs text-zinc-600"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {t.documents.noTags}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
            <span>
              {t.documents.page} {page} {t.documents.pageOf} {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  updateQueryParams({ page: next });
                }}
                disabled={page === 1}
              >
                {t.documents.prev}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.min(pageCount, page + 1);
                  setPage(next);
                  updateQueryParams({ page: next });
                }}
                disabled={page === pageCount}
              >
                {t.documents.next}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {selectedDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.historyTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setSelectedDocument(null);
                  setReferences([]);
                  setReferencesError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-500">{t.documents.fileLabel}</p>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {selectedDocument.name}
                  </p>
                </div>
                <div className="text-sm text-zinc-500">
                  {t.documents.typeLabel}: {typeLabels[selectedDocument.type]}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedDocument.tags?.length ? (
                  selectedDocument.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">
                    {t.documents.noTags}
                  </span>
                )}
              </div>

              {referenceModules.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {referenceModules.map((module) => (
                    <span
                      key={module}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600"
                    >
                      {moduleLabels[module]}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold uppercase text-zinc-500">
                {t.documents.references.title}
              </h4>

              <form
                className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] px-4 py-3"
                onSubmit={handleCreateReference}
              >
                <Input
                  label={t.documents.references.titleLabel}
                  placeholder={t.documents.references.titlePlaceholder}
                  value={referenceForm.title}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />

                <Input
                  label={t.documents.references.mentionUsersLabel}
                  placeholder={t.documents.references.mentionUsersPlaceholder}
                  value={referenceForm.mentionedUsers}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({
                      ...prev,
                      mentionedUsers: event.target.value,
                    }))
                  }
                />

                {referenceError ? (
                  <p className="text-sm text-red-500">{referenceError}</p>
                ) : null}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSavingReference}>
                    {isSavingReference
                      ? t.documents.saving
                      : t.documents.references.createAction}
                  </Button>
                </div>
              </form>

              {referencesLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : referencesError ? (
                <p className="mt-3 text-sm text-red-500">{referencesError}</p>
              ) : references.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">
                  {t.documents.references.empty}
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {references.map((reference) => (
                    <div
                      key={reference.id}
                      className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            {reference.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {moduleLabels[reference.sourceModule]} · {reference.sourceType}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                          {referenceKindLabels[reference.referenceKind]}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-1 text-xs text-zinc-500">
                        <span>
                          {t.documents.references.mentionedAt}: {formatDate(reference.mentionedAt)}
                        </span>
                        <span>
                          {t.documents.references.scheduledAt}: {formatDate(reference.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isMoveModalOpen && moveDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.moveTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setIsMoveModalOpen(false);
                  setMoveDocument(null);
                  setMoveDocumentFolderId("");
                  setMoveError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleMoveDocument(
                  moveDocument.id,
                  moveDocumentFolderId ? moveDocumentFolderId : null,
                );
              }}
            >
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.moveLabel}
                <select
                  value={moveDocumentFolderId}
                  onChange={(event) => setMoveDocumentFolderId(event.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folderPaths[folder.id] ?? folder.name}
                    </option>
                  ))}
                </select>
              </label>

              {moveError ? <p className="text-sm text-red-500">{moveError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsMoveModalOpen(false);
                    setMoveDocument(null);
                    setMoveDocumentFolderId("");
                    setMoveError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isMoving}>
                  {isMoving ? t.documents.saving : t.documents.moveConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {renameFolderId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.renameTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setRenameFolderId(null);
                  setRenameFolderName("");
                  setFolderError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleRenameFolder}>
              <Input
                label={t.documents.folderNameLabel}
                placeholder={t.documents.folderNamePlaceholder}
                value={renameFolderName}
                onChange={(event) => setRenameFolderName(event.target.value)}
              />

              {folderError ? <p className="text-sm text-red-500">{folderError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setRenameFolderId(null);
                    setRenameFolderName("");
                    setFolderError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isSavingFolder}>
                  {isSavingFolder ? t.documents.saving : t.documents.renameConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {moveFolderId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.moveAction}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setMoveFolderId(null);
                  setMoveFolderParentId("");
                  setMoveFolderError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleMoveFolder}>
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.folderParentLabel}
                <select
                  value={moveFolderParentId}
                  onChange={(event) => setMoveFolderParentId(event.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders
                    .filter((folder) => folder.id !== moveFolderId)
                    .map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folderPaths[folder.id] ?? folder.name}
                      </option>
                    ))}
                </select>
              </label>

              {moveFolderError ? (
                <p className="text-sm text-red-500">{moveFolderError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMoveFolderId(null);
                    setMoveFolderParentId("");
                    setMoveFolderError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isMovingFolder}>
                  {isMovingFolder ? t.documents.saving : t.documents.moveConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {renameDocumentId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.renameTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setRenameDocumentId(null);
                  setRenameDocumentName("");
                  setRenameDocumentError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleRenameDocument}>
              <Input
                label={t.documents.fileNameLabel}
                placeholder={t.documents.fileNamePlaceholder}
                value={renameDocumentName}
                onChange={(event) => setRenameDocumentName(event.target.value)}
              />

              {renameDocumentError ? (
                <p className="text-sm text-red-500">{renameDocumentError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setRenameDocumentId(null);
                    setRenameDocumentName("");
                    setRenameDocumentError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isMoving}>
                  {isMoving ? t.documents.saving : t.documents.renameConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteFolderId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.deleteTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setDeleteFolderId(null);
                  setDeleteFolderName("");
                  setDeleteError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-sm text-zinc-600">
              {t.documents.deleteConfirm} <strong>{deleteFolderName}</strong>
            </div>

            {deleteError ? <p className="mt-3 text-sm text-red-500">{deleteError}</p> : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDeleteFolderId(null);
                  setDeleteFolderName("");
                  setDeleteError(null);
                }}
              >
                {t.documents.cancel}
              </Button>
              <Button type="button" onClick={handleDeleteFolder} disabled={isMoving}>
                {isMoving ? t.documents.saving : t.documents.deleteAction}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteDocumentId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.deleteTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setDeleteDocumentId(null);
                  setDeleteDocumentName("");
                  setDeleteError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-sm text-zinc-600">
              {t.documents.deleteConfirm} <strong>{deleteDocumentName}</strong>
            </div>

            {deleteError ? <p className="mt-3 text-sm text-red-500">{deleteError}</p> : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDeleteDocumentId(null);
                  setDeleteDocumentName("");
                  setDeleteError(null);
                }}
              >
                {t.documents.cancel}
              </Button>
              <Button type="button" onClick={handleDeleteDocument} disabled={isMoving}>
                {isMoving ? t.documents.saving : t.documents.deleteAction}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {mentionDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.mentionAction}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setMentionDocument(null);
                  setMentionTitle("");
                  setMentionSearchEmail("");
                  setMentionSelectedUserIds([]);
                  setMentionError(null);
                  setMentionSearchError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleMentionDocument}>
              <Input
                label={t.documents.references.titleLabel}
                placeholder={t.documents.references.titlePlaceholder}
                value={mentionTitle}
                onChange={(event) => setMentionTitle(event.target.value)}
              />

              <div className="grid gap-3">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1">
                    <Input
                      label={t.documents.references.mentionUsersLabel}
                      placeholder={t.documents.references.mentionUsersPlaceholder}
                      value={mentionSearchEmail}
                      onChange={(event) => setMentionSearchEmail(event.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      if (!mentionSearchEmail.trim()) {
                        setMentionSearchError(t.documents.references.mentionSearchRequired);
                        return;
                      }
                      setMentionSearchError(null);
                      try {
                        const user = await lookupUserByEmail(
                          mentionSearchEmail.trim().toLowerCase(),
                        );
                        if (!mentionSelectedUserIds.includes(user.id)) {
                          setMentionSelectedUserIds((prev) => [...prev, user.id]);
                        }
                        if (!workspaceMembers.find((member) => member.id === user.id)) {
                          setWorkspaceMembers((prev) => [...prev, user]);
                        }
                        setMentionSearchEmail("");
                      } catch (err) {
                        if (err instanceof ApiError) {
                          setMentionSearchError(err.message);
                        } else {
                          setMentionSearchError(t.documents.references.loadError);
                        }
                      }
                    }}
                  >
                    {t.documents.references.mentionSearchAction}
                  </Button>
                </div>

                {membersLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : membersError ? (
                  <p className="text-sm text-red-500">{membersError}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {workspaceMembers.map((member) => {
                      const isSelected = mentionSelectedUserIds.includes(member.id);
                      const initials = (member.name || member.email)
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase();
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setMentionSelectedUserIds((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== member.id)
                                : [...prev, member.id],
                            );
                          }}
                          className={`relative flex h-11 w-11 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-[var(--primary)] ring-2 ring-[var(--primary)]"
                              : "border-[var(--border)]"
                          }`}
                          title={member.name || member.email}
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

                {mentionSearchError ? (
                  <p className="text-sm text-red-500">{mentionSearchError}</p>
                ) : null}
              </div>

              {mentionError ? <p className="text-sm text-red-500">{mentionError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMentionDocument(null);
                    setMentionTitle("");
                    setMentionSearchEmail("");
                    setMentionSelectedUserIds([]);
                    setMentionError(null);
                    setMentionSearchError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isSavingReference}>
                  {isSavingReference ? t.documents.saving : t.documents.references.createAction}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {linkDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.linkTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setLinkDocument(null);
                  setLinkForm({ module: "FINANCE", sourceType: "", sourceId: "", title: "" });
                  setLinkError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLinkDocument}>
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.linkModuleLabel}
                <select
                  value={linkForm.module}
                  onChange={(event) =>
                    setLinkForm((prev) => ({
                      ...prev,
                      module: event.target.value as DocumentReferenceModule,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  {Object.entries(moduleLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label={t.documents.linkTypeLabel}
                value={linkForm.sourceType}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    sourceType: event.target.value,
                  }))
                }
              />
              <Input
                label={t.documents.linkIdLabel}
                value={linkForm.sourceId}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    sourceId: event.target.value,
                  }))
                }
              />
              <Input
                label={t.documents.linkTitleLabel}
                value={linkForm.title}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />

              {linkError ? <p className="text-sm text-red-500">{linkError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setLinkDocument(null);
                    setLinkForm({ module: "FINANCE", sourceType: "", sourceId: "", title: "" });
                    setLinkError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isLinking}>
                  {isLinking ? t.documents.saving : t.documents.linkConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isFolderModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.folderTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setIsFolderModalOpen(false);
                  setFolderError(null);
                  setFolderForm({ name: "", description: "", parentId: "" });
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreateFolder}>
              <Input
                label={t.documents.folderNameLabel}
                placeholder={t.documents.folderNamePlaceholder}
                value={folderForm.name}
                onChange={(event) =>
                  setFolderForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.folderDescriptionLabel}
                <textarea
                  className="min-h-[96px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  value={folderForm.description}
                  onChange={(event) =>
                    setFolderForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.folderParentLabel}
                <select
                  value={folderForm.parentId}
                  onChange={(event) =>
                    setFolderForm((prev) => ({
                      ...prev,
                      parentId: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folderPaths[folder.id] ?? folder.name}
                    </option>
                  ))}
                </select>
              </label>

              {folderError ? <p className="text-sm text-red-500">{folderError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsFolderModalOpen(false);
                    setFolderError(null);
                    setFolderForm({ name: "", description: "", parentId: "" });
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isSavingFolder}>
                  {isSavingFolder ? t.documents.saving : t.documents.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.uploadTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleUpload}>
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.uploadAction}
                <input
                  type="file"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setUploadForm((prev) => ({
                      ...prev,
                      file,
                      name: file ? file.name : prev.name,
                      type: resolveTypeFromFile(file),
                    }));
                  }}
                />
              </label>

              <Input
                label={t.documents.fileNameLabel}
                placeholder={t.documents.fileNamePlaceholder}
                value={uploadForm.name}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.typeLabel}
                <select
                  value={uploadForm.type}
                  onChange={(event) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      type: event.target.value as DocumentType,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="PDF">{t.documents.typePdf}</option>
                  <option value="IMAGE">{t.documents.typeImage}</option>
                  <option value="SPREADSHEET">{t.documents.typeSpreadsheet}</option>
                  <option value="OTHER">{t.documents.typeOther}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.folderLabel}
                <select
                  value={uploadForm.folderId}
                  onChange={(event) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      folderId: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folderPaths[folder.id] ?? folder.name}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label={t.documents.tagsLabel}
                placeholder={t.documents.tagsPlaceholder}
                value={uploadForm.tags}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, tags: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.descriptionLabel}
                <textarea
                  className="min-h-[96px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  value={uploadForm.description}
                  onChange={(event) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </label>

              {uploadError ? <p className="text-sm text-red-500">{uploadError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? t.documents.saving : t.documents.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
/*
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api/client";
import {
  createDocumentFolder,
  createDocumentReference,
  listDocumentFolders,
  listDocuments,
  listDocumentReferences,
  updateDocument,
  updateDocumentFolder,
  uploadDocumentFile,
  type DocumentFolder,
  type DocumentReference,
  type DocumentReferenceKind,
  type DocumentReferenceModule,
  type DocumentSummary,
  type DocumentType,
} from "@/lib/api/documents";
import { useLanguage } from "@/lib/i18n/language-context";

const pageSize = 6;

type DocumentsClientProps = {
  initialQuery?: string;
  initialFolder?: string;
  initialType?: string;
  initialSort?: string;
  initialPage?: number;
};

export default function DocumentsClient({
  initialQuery = "",
  initialFolder = "all",
  initialType = "all",
  initialSort = "updatedAt",
  initialPage = 1,
}: DocumentsClientProps) {
  const normalizeType = (value: string): "all" | DocumentType => {
    if (value === "all") return "all";
    const normalized = value.toUpperCase();
    if (
      normalized === "PDF" ||
      normalized === "IMAGE" ||
      normalized === "SPREADSHEET" ||
      normalized === "OTHER"
    ) {
      return normalized as DocumentType;
    }
    return "all";
  };

  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [folderFilter, setFolderFilter] = useState(initialFolder);
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>(
    normalizeType(initialType),
  );
  const [sortBy, setSortBy] = useState<"updatedAt" | "name">(
    initialSort === "name" ? "name" : "updatedAt",
  );
  const [page, setPage] = useState(initialPage);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [records, setRecords] = useState<DocumentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentSummary | null>(null);
  const [references, setReferences] = useState<DocumentReference[]>([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referencesError, setReferencesError] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderForm, setFolderForm] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: "",
    type: "PDF" as DocumentType,
    folderId: "",
    tags: "",
    description: "",
  });
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveDocument, setMoveDocument] = useState<DocumentSummary | null>(null);
  const [moveFolderId, setMoveFolderId] = useState<string>("");
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [referenceForm, setReferenceForm] = useState({
    title: "",
    mentionedUsers: "",
  });
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isSavingReference, setIsSavingReference] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [moveFolderId, setMoveFolderId] = useState<string | null>(null);
  const [moveFolderParentId, setMoveFolderParentId] = useState("");
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const [moveFolderError, setMoveFolderError] = useState<string | null>(null);
  const [renameDocumentId, setRenameDocumentId] = useState<string | null>(null);
  const [renameDocumentName, setRenameDocumentName] = useState("");
  const [renameDocumentError, setRenameDocumentError] = useState<string | null>(null);
  const [linkDocument, setLinkDocument] = useState<DocumentSummary | null>(null);
  const [linkForm, setLinkForm] = useState({
    module: "FINANCE" as DocumentReferenceModule,
    sourceType: "",
    sourceId: "",
    title: "",
  });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [mentionDocument, setMentionDocument] = useState<DocumentSummary | null>(null);

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label={t.documents.searchLabel}
              placeholder={t.documents.searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                updateQueryParams({ q: event.target.value, page: 1 });
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.typeLabel}
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as "all" | DocumentType);
                setPage(1);
                updateQueryParams({ type: event.target.value, page: 1 });
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.documents.typeAll}</option>
              <option value="PDF">{t.documents.typePdf}</option>
              <option value="IMAGE">{t.documents.typeImage}</option>
              <option value="SPREADSHEET">{t.documents.typeSpreadsheet}</option>
              <option value="OTHER">{t.documents.typeOther}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.sortLabel}
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as "updatedAt" | "name");
                setPage(1);
                updateQueryParams({ sort: event.target.value, page: 1 });
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="updatedAt">{t.documents.sortUpdated}</option>
              <option value="name">{t.documents.sortName}</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                {t.documents.foldersTitle}
              </p>
              <p className="text-sm text-zinc-600">{t.documents.dragHint}</p>
            </div>
            <span className="text-xs text-zinc-500">
              {t.documents.currentFolderLabel}: {folderFilter === "all"
                ? t.documents.allFolders
                : folderPaths[folderFilter] ?? folderMap[folderFilter]?.name}
            </span>
          </div>

          {isFoldersLoading ? (
            <Skeleton className="h-[160px] w-full" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setFolderFilter("all");
                  setPage(1);
                  updateQueryParams({ folder: "all", page: 1 });
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropOnFolder(event, null)}
                className={`group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:bg-[var(--surface-muted)] ${
                  folderFilter === "all" ? "ring-2 ring-[var(--primary)]" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f22] text-lg text-white">
                  🗂️
                </span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[var(--foreground)]">
                    {t.documents.allFolders}
                  </p>
                  <p className="text-xs text-zinc-500">{t.documents.folderRoot}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
                  {total}
                </span>
              </button>

              {folders.map((folder) => renderFolderCard(folder))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                {t.documents.filesTitle}
              </p>
              <p className="text-sm text-zinc-600">{t.documents.dragHint}</p>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-zinc-500">{t.documents.empty}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {records.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", item.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f1f22] text-2xl text-white">
                      {item.type === "IMAGE"
                        ? "🖼️"
                        : item.type === "PDF"
                          ? "📄"
                          : item.type === "SPREADSHEET"
                            ? "📊"
                            : "📁"}
                    </span>
                    <div className="relative">
                      <details className="group">
                        <summary className="list-none rounded-full px-2 py-1 text-zinc-500 hover:bg-[var(--surface-muted)]">
                          ⋯
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-xs shadow-xl">
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => handleViewReferences(item)}
                          >
                            {t.documents.historyAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setRenameDocumentId(item.id);
                              setRenameDocumentName(item.name);
                            }}
                          >
                            {t.documents.renameAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setMoveDocument(item);
                              setMoveFolderId(item.folderId ?? "");
                              setMoveError(null);
                              setIsMoveModalOpen(true);
                            }}
                          >
                            {t.documents.moveAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setMentionDocument(item);
                              setReferenceForm({ title: "", mentionedUsers: "" });
                              setMentionError(null);
                            }}
                          >
                            {t.documents.mentionAction}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setLinkDocument(item);
                              setLinkForm({
                                module: "FINANCE",
                                sourceType: "",
                                sourceId: "",
                                title: "",
                              });
                              setLinkError(null);
                            }}
                          >
                            {t.documents.linkAction}
                          </button>
                        </div>
                      </details>
                    </div>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-[var(--foreground)]">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.documents.folderLabel}: {item.folderId
                        ? folderPaths[item.folderId] || folderMap[item.folderId]?.name
                        : t.documents.folderRoot}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.documents.tableUpdated}: {formatDate(item.updatedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.tags?.length ? (
                      item.tags.map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs text-zinc-600"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {t.documents.noTags}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
            <span>
              {t.documents.page} {page} {t.documents.pageOf} {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  updateQueryParams({ page: next });
                }}
                disabled={page === 1}
              >
                {t.documents.prev}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.min(pageCount, page + 1);
                  setPage(next);
                  updateQueryParams({ page: next });
                }}
                disabled={page === pageCount}
              >
                {t.documents.next}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      cache[id] = path;
      return path;
    };

    folders.forEach((folder) => {
      buildPath(folder.id);
    });

    return cache;
  }, [folders, folderMap]);


  const handleMoveDocument = async (
    documentId: string,
    nextFolderId: string | null,
  ) => {
    setMoveError(null);
    setIsMoving(true);

    try {
      await updateDocument({
        id: documentId,
        folderId: nextFolderId ?? null,
      });

      setIsMoveModalOpen(false);
      setMoveDocument(null);
      setMoveFolderId("");
      await Promise.all([loadDocuments(1), loadFolders()]);
      setPage(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setMoveError(err.message);
      } else {
        setMoveError(t.documents.moveError);
      }
    } finally {
      setIsMoving(false);
    }
  };

  const handleRenameFolder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!renameFolderId) return;
    setFolderError(null);
    setIsSavingFolder(true);

    try {
      await updateDocumentFolder({
        id: renameFolderId,
        name: renameFolderName.trim(),
      });
      setRenameFolderId(null);
      setRenameFolderName("");
      await loadFolders();
    } catch (err) {
      if (err instanceof ApiError) {
        setFolderError(err.message);
      } else {
        setFolderError(t.documents.folderRenameError);
      }
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleRenameDocument = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!renameDocumentId) return;
    setRenameDocumentError(null);
    setIsMoving(true);

    try {
      await updateDocument({
        id: renameDocumentId,
        name: renameDocumentName.trim(),
      });
      setRenameDocumentId(null);
      setRenameDocumentName("");
      await loadDocuments(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setRenameDocumentError(err.message);
      } else {
        setRenameDocumentError(t.documents.renameError);
      }
    } finally {
      setIsMoving(false);
    }
  };

  const handleMoveFolder = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!moveFolderId) return;
    setMoveFolderError(null);
    setIsMovingFolder(true);

    try {
      await updateDocumentFolder({
        id: moveFolderId,
        parentId: moveFolderParentId || null,
      });
      setMoveFolderId(null);
      setMoveFolderParentId("");
      await loadFolders();
    } catch (err) {
      if (err instanceof ApiError) {
        setMoveFolderError(err.message);
      } else {
        setMoveFolderError(t.documents.moveError);
      }
    } finally {
      setIsMovingFolder(false);
    }
  };

  const handleMentionDocument = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!mentionDocument) return;
    setMentionError(null);
    if (!referenceForm.title.trim()) {
      setMentionError(t.documents.references.titleRequired);
      return;
    }
    setIsSavingReference(true);

    try {
      await createDocumentReference({
        documentId: mentionDocument.id,
        sourceModule: "DOCUMENTS",
        sourceType: "document",
        sourceId: mentionDocument.id,
        title: referenceForm.title.trim(),
        referenceKind: "MENTION",
        mentionedUserIds: parseMentionedUsers(referenceForm.mentionedUsers),
      });

      setMentionDocument(null);
      setReferenceForm({ title: "", mentionedUsers: "" });
      await loadDocuments(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setMentionError(err.message);
      } else {
        setMentionError(t.documents.references.createError);
      }
    } finally {
      setIsSavingReference(false);
    }
  };

  const handleLinkDocument = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!linkDocument) return;
    setLinkError(null);
    setIsLinking(true);

    try {
      await createDocumentReference({
        documentId: linkDocument.id,
        sourceModule: linkForm.module,
        sourceType: linkForm.sourceType.trim(),
        sourceId: linkForm.sourceId.trim(),
        title: linkForm.title.trim(),
        referenceKind: "MENTION",
      });

      setLinkDocument(null);
      setLinkForm({ module: "FINANCE", sourceType: "", sourceId: "", title: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        setLinkError(err.message);
      } else {
        setLinkError(t.documents.linkError);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleDropOnFolder = async (
    event: React.DragEvent<HTMLElement>,
    nextFolderId: string | null,
  ) => {
    event.preventDefault();
    const documentId = event.dataTransfer.getData("text/plain");
    if (!documentId) return;
    await handleMoveDocument(documentId, nextFolderId);
  };

  const parseMentionedUsers = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleCreateReference = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setReferenceError(null);

    if (!selectedDocument) return;
    if (!referenceForm.title.trim()) {
      setReferenceError(t.documents.references.titleRequired);
      return;
    }

    setIsSavingReference(true);
    try {
      await createDocumentReference({
        documentId: selectedDocument.id,
        sourceModule: "DOCUMENTS",
        sourceType: "document",
        sourceId: selectedDocument.id,
        title: referenceForm.title.trim(),
        referenceKind: "MENTION",
        mentionedUserIds: parseMentionedUsers(referenceForm.mentionedUsers),
      });

      setReferenceForm({ title: "", mentionedUsers: "" });
      const response = await listDocumentReferences({
        documentId: selectedDocument.id,
        page: 1,
        pageSize: 50,
        orderBy: "createdAt",
        orderDirection: "desc",
      });
      setReferences(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setReferenceError(err.message);
      } else {
        setReferenceError(t.documents.references.createError);
      }
    } finally {
      setIsSavingReference(false);
    }
  };

  const renderFolderCard = (folder: DocumentFolder) => (
    <button
      key={folder.id}
      type="button"
      onClick={() => {
        setFolderFilter(folder.id);
        setPage(1);
        updateQueryParams({ folder: folder.id, page: 1 });
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => handleDropOnFolder(event, folder.id)}
      className={`group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:bg-[var(--surface-muted)] ${
        folderFilter === folder.id ? "ring-2 ring-[var(--primary)]" : ""
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f22] text-lg text-white">
        📁
      </span>
      <div className="flex-1 text-left">
        <p className="font-semibold text-[var(--foreground)]">{folder.name}</p>
        <p className="text-xs text-zinc-500">
          {folderPaths[folder.id] ?? folder.name}
        </p>
      </div>
      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
        {folder.totalFiles}
      </span>
      <div
        className="relative"
        onClick={(event) => event.stopPropagation()}
      >
        <details className="group">
          <summary className="list-none rounded-full px-2 py-1 text-zinc-500 hover:bg-[var(--surface-muted)]">
            ⋯
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-xs shadow-xl">
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
              onClick={() => {
                setRenameFolderId(folder.id);
                setRenameFolderName(folder.name);
              }}
            >
              {t.documents.renameAction}
            </button>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
              onClick={() => {
                setMoveFolderId(folder.id);
                setMoveFolderParentId(folder.parentId ?? "");
                setMoveFolderError(null);
              }}
            >
              {t.documents.moveAction}
            </button>
          </div>
        </details>
      </div>
    </button>
  );

  const handleViewReferences = async (document: DocumentSummary) => {
    setSelectedDocument(document);
    setReferences([]);
    setReferencesError(null);
    setReferenceForm({ title: "", mentionedUsers: "" });
    setReferenceError(null);
    setReferencesLoading(true);

    try {
      const response = await listDocumentReferences({
        documentId: document.id,
        page: 1,
        pageSize: 50,
        orderBy: "createdAt",
        orderDirection: "desc",
      });

      setReferences(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setReferencesError(err.message);
      } else {
        setReferencesError(t.documents.references.loadError);
      }
    } finally {
      setReferencesLoading(false);
    }
  };

  const referenceModules = useMemo(() => {
    const modules = new Set<DocumentReferenceModule>();
    references.forEach((reference) => modules.add(reference.sourceModule));
    return Array.from(modules);
  }, [references]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("pt-BR");
  };

  const resolveTypeFromFile = (file?: File | null): DocumentType => {
    if (!file) return "PDF";
    const name = file.name.toLowerCase();
    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
      return "IMAGE";
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
      return "SPREADSHEET";
    }
    if (name.endsWith(".pdf")) {
      return "PDF";
    }
    return "OTHER";
  };

  const handleCreateFolder = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFolderError(null);

    if (!folderForm.name.trim()) {
      setFolderError(t.documents.folderRequired);
      return;
    }

    setIsSavingFolder(true);

    try {
      const created = await createDocumentFolder({
        name: folderForm.name.trim(),
        description: folderForm.description.trim() || undefined,
        parentId: folderForm.parentId || undefined,
      });

      setIsFolderModalOpen(false);
      setFolderForm({ name: "", description: "", parentId: "" });
      await loadFolders();
      setFolderFilter(created.id);
      setPage(1);
      updateQueryParams({ folder: created.id, page: 1 });
    } catch (err) {
      if (err instanceof ApiError) {
        setFolderError(err.message);
      } else {
        setFolderError(t.documents.folderSaveError);
      }
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);

    if (!uploadForm.file) {
      setUploadError(t.documents.fileRequired);
      return;
    }

    if (!uploadForm.name.trim()) {
      setUploadError(t.documents.fileNameRequired);
      return;
    }

    setIsUploading(true);

    try {
      const tags = uploadForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await uploadDocumentFile({
        file: uploadForm.file,
        name: uploadForm.name.trim(),
        type: uploadForm.type,
        folderId: uploadForm.folderId || undefined,
        tags: tags.length ? tags : undefined,
        description: uploadForm.description.trim() || undefined,
      });

      setIsUploadModalOpen(false);
      setUploadForm({
        file: null,
        name: "",
        type: "PDF",
        folderId: "",
        tags: "",
        description: "",
      });
      setPage(1);
      await Promise.all([loadDocuments(1), loadFolders()]);
    } catch (err) {
      if (err instanceof ApiError) {
        setUploadError(err.message);
      } else {
        setUploadError(t.documents.uploadError);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.modules.documents}</h2>
          <p className="text-sm text-zinc-600">{t.documents.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setIsFolderModalOpen(true)}>
            {t.documents.newFolder}
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            {t.documents.uploadFile}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label={t.documents.searchLabel}
              placeholder={t.documents.searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                updateQueryParams({ q: event.target.value, page: 1 });
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.typeLabel}
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as "all" | DocumentType);
                setPage(1);
                updateQueryParams({ type: event.target.value, page: 1 });
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.documents.typeAll}</option>
              <option value="PDF">{t.documents.typePdf}</option>
              <option value="IMAGE">{t.documents.typeImage}</option>
              <option value="SPREADSHEET">{t.documents.typeSpreadsheet}</option>
              <option value="OTHER">{t.documents.typeOther}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.sortLabel}
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as "updatedAt" | "name");
                setPage(1);
                updateQueryParams({ sort: event.target.value, page: 1 });
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="updatedAt">{t.documents.sortUpdated}</option>
              <option value="name">{t.documents.sortName}</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                {t.documents.foldersTitle}
              </p>
              <p className="text-sm text-zinc-600">{t.documents.dragHint}</p>
            </div>
            <span className="text-xs text-zinc-500">
              {t.documents.currentFolderLabel}: {folderFilter === "all"
                ? t.documents.allFolders
                : folderPaths[folderFilter] ?? folderMap[folderFilter]?.name}
            </span>
          </div>

          {isFoldersLoading ? (
            <Skeleton className="h-[160px] w-full" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setFolderFilter("all");
                  setPage(1);
                  updateQueryParams({ folder: "all", page: 1 });
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropOnFolder(event, null)}
                className={`group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:bg-[var(--surface-muted)] ${
                  folderFilter === "all" ? "ring-2 ring-[var(--primary)]" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f22] text-lg text-white">
                  🗂️
                </span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[var(--foreground)]">
                    {t.documents.allFolders}
                  </p>
                  <p className="text-xs text-zinc-500">{t.documents.folderRoot}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
                  {total}
                </span>
              </button>

              {folders.map((folder) => renderFolderCard(folder))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                {t.documents.filesTitle}
              </p>
              <p className="text-sm text-zinc-600">{t.documents.dragHint}</p>
            </div>
          </div>

          {isLoading ? (

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                {t.documents.foldersTitle}
              </p>
              <p className="text-sm text-zinc-600">{t.documents.dragHint}</p>
            </div>
            <span className="text-xs text-zinc-500">
              {t.documents.currentFolderLabel}: {folderFilter === "all"
                ? t.documents.allFolders
                : folderPaths[folderFilter] ?? folderMap[folderFilter]?.name}
            </span>
          </div>

          {isFoldersLoading ? (
            <Skeleton className="h-[160px] w-full" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setFolderFilter("all");
                  setPage(1);
                  updateQueryParams({ folder: "all", page: 1 });
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropOnFolder(event, null)}
                className={`group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:bg-[var(--surface-muted)] ${
                  folderFilter === "all" ? "ring-2 ring-[var(--primary)]" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f22] text-lg text-white">
                  🗂️
                </span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[var(--foreground)]">
                    {t.documents.allFolders}
                  </p>
                  <p className="text-xs text-zinc-500">{t.documents.folderRoot}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
                  {total}
                </span>
              </button>

              {folders.map((folder) => renderFolderCard(folder))}
            </div>
          )}
        </div>
      </Card>
                      {t.documents.historyAction}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setMoveDocument(item);
                        setMoveFolderId(item.folderId ?? "");
                        setMoveError(null);
                        setIsMoveModalOpen(true);
                      }}
                    >
                      {t.documents.moveAction}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
            <span>
              {t.documents.page} {page} {t.documents.pageOf} {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  updateQueryParams({ page: next });
                }}
                disabled={page === 1}
              >
                {t.documents.prev}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = Math.min(pageCount, page + 1);
                  setPage(next);
                  updateQueryParams({ page: next });
                }}
                disabled={page === pageCount}
              >
                {t.documents.next}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {selectedDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.historyTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setSelectedDocument(null);
                  setReferences([]);
                  setReferencesError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-500">{t.documents.fileLabel}</p>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {selectedDocument.name}
                  </p>
                </div>
                <div className="text-sm text-zinc-500">
                  {t.documents.typeLabel}: {typeLabels[selectedDocument.type]}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedDocument.tags?.length ? (
                  selectedDocument.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">
                    {t.documents.noTags}
                  </span>
                )}
              </div>

              {referenceModules.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {referenceModules.map((module) => (
                    <span
                      key={module}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600"
                    >
                      {moduleLabels[module]}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold uppercase text-zinc-500">
                {t.documents.references.title}
              </h4>

              <form
                className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] px-4 py-3"
                onSubmit={handleCreateReference}
              >
                <Input
                  label={t.documents.references.titleLabel}
                  placeholder={t.documents.references.titlePlaceholder}
                  value={referenceForm.title}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />

                <Input
                  label={t.documents.references.mentionUsersLabel}
                  placeholder={t.documents.references.mentionUsersPlaceholder}
                  value={referenceForm.mentionedUsers}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({
                      ...prev,
                      mentionedUsers: event.target.value,
                    }))
                  }
                />

                {referenceError ? (
                  <p className="text-sm text-red-500">{referenceError}</p>
                ) : null}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSavingReference}>
                    {isSavingReference
                      ? t.documents.saving
                      : t.documents.references.createAction}
                  </Button>
                </div>
              </form>

              {referencesLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : referencesError ? (
                <p className="mt-3 text-sm text-red-500">{referencesError}</p>
              ) : references.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">
                  {t.documents.references.empty}
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {references.map((reference) => (
                    <div
                      key={reference.id}
                      className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            {reference.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {moduleLabels[reference.sourceModule]} · {reference.sourceType}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                          {referenceKindLabels[reference.referenceKind]}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-1 text-xs text-zinc-500">
                        <span>
                          {t.documents.references.mentionedAt}: {formatDate(reference.mentionedAt)}
                        </span>
                        <span>
                          {t.documents.references.scheduledAt}: {formatDate(reference.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedDocument(null);
                  setReferences([]);
                  setReferencesError(null);
                  setReferenceForm({ title: "", mentionedUsers: "" });
                  setReferenceError(null);
                }}
              >
                {t.documents.close}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {renameFolderId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.renameTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setRenameFolderId(null);
                  setRenameFolderName("");
                  setFolderError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleRenameFolder}
            >
              <Input
                label={t.documents.folderNameLabel}
                placeholder={t.documents.folderNamePlaceholder}
                value={renameFolderName}
                onChange={(event) => setRenameFolderName(event.target.value)}
              />

              {folderError ? (
                <p className="text-sm text-red-500">{folderError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setRenameFolderId(null);
                    setRenameFolderName("");
                    setFolderError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isSavingFolder}>
                  {isSavingFolder ? t.documents.saving : t.documents.renameConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {moveFolderId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.moveTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setMoveFolderId(null);
                  setMoveFolderParentId("");
                  setMoveFolderError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleMoveFolder}>
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.moveLabel}
                <select
                  value={moveFolderParentId}
                  onChange={(event) => setMoveFolderParentId(event.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders
                    .filter((folder) => folder.id !== moveFolderId)
                    .map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folderPaths[folder.id] ?? folder.name}
                      </option>
                    ))}
                </select>
              </label>

              {moveFolderError ? (
                <p className="text-sm text-red-500">{moveFolderError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMoveFolderId(null);
                    setMoveFolderParentId("");
                    setMoveFolderError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isMovingFolder}>
                  {isMovingFolder ? t.documents.saving : t.documents.moveConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {renameDocumentId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.renameTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setRenameDocumentId(null);
                  setRenameDocumentName("");
                  setRenameDocumentError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleRenameDocument}>
              <Input
                label={t.documents.fileNameLabel}
                placeholder={t.documents.fileNamePlaceholder}
                value={renameDocumentName}
                onChange={(event) => setRenameDocumentName(event.target.value)}
              />

              {renameDocumentError ? (
                <p className="text-sm text-red-500">{renameDocumentError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setRenameDocumentId(null);
                    setRenameDocumentName("");
                    setRenameDocumentError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isMoving}>
                  {isMoving ? t.documents.saving : t.documents.renameConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {mentionDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.mentionAction}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setMentionDocument(null);
                  setReferenceForm({ title: "", mentionedUsers: "" });
                  setMentionError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleMentionDocument}>
              <Input
                label={t.documents.references.titleLabel}
                placeholder={t.documents.references.titlePlaceholder}
                value={referenceForm.title}
                onChange={(event) =>
                  setReferenceForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />

              <Input
                label={t.documents.references.mentionUsersLabel}
                placeholder={t.documents.references.mentionUsersPlaceholder}
                value={referenceForm.mentionedUsers}
                onChange={(event) =>
                  setReferenceForm((prev) => ({
                    ...prev,
                    mentionedUsers: event.target.value,
                  }))
                }
              />

              {mentionError ? (
                <p className="text-sm text-red-500">{mentionError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMentionDocument(null);
                    setReferenceForm({ title: "", mentionedUsers: "" });
                    setMentionError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isSavingReference}>
                  {isSavingReference ? t.documents.saving : t.documents.references.createAction}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {linkDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.linkTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setLinkDocument(null);
                  setLinkForm({ module: "FINANCE", sourceType: "", sourceId: "", title: "" });
                  setLinkError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLinkDocument}>
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.linkModuleLabel}
                <select
                  value={linkForm.module}
                  onChange={(event) =>
                    setLinkForm((prev) => ({
                      ...prev,
                      module: event.target.value as DocumentReferenceModule,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  {Object.entries(moduleLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label={t.documents.linkTypeLabel}
                value={linkForm.sourceType}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    sourceType: event.target.value,
                  }))
                }
              />
              <Input
                label={t.documents.linkIdLabel}
                value={linkForm.sourceId}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    sourceId: event.target.value,
                  }))
                }
              />
              <Input
                label={t.documents.linkTitleLabel}
                value={linkForm.title}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />

              {linkError ? (
                <p className="text-sm text-red-500">{linkError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setLinkDocument(null);
                    setLinkForm({ module: "FINANCE", sourceType: "", sourceId: "", title: "" });
                    setLinkError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isLinking}>
                  {isLinking ? t.documents.saving : t.documents.linkConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isFolderModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.folderTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setIsFolderModalOpen(false);
                  setFolderError(null);
                  setFolderForm({ name: "", description: "", parentId: "" });
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreateFolder}>
              <Input
                label={t.documents.folderNameLabel}
                placeholder={t.documents.folderNamePlaceholder}
                value={folderForm.name}
                onChange={(event) =>
                  setFolderForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.folderDescriptionLabel}
                <textarea
                  className="min-h-[96px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  value={folderForm.description}
                  onChange={(event) =>
                    setFolderForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.folderParentLabel}
                <select
                  value={folderForm.parentId}
                  onChange={(event) =>
                    setFolderForm((prev) => ({
                      ...prev,
                      parentId: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folderPaths[folder.id] ?? folder.name}
                    </option>
                  ))}
                </select>
              </label>

              {folderError ? (
                <p className="text-sm text-red-500">{folderError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsFolderModalOpen(false);
                    setFolderError(null);
                    setFolderForm({ name: "", description: "", parentId: "" });
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isSavingFolder}>
                  {isSavingFolder ? t.documents.saving : t.documents.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.uploadTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleUpload}>
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.fileLabel}
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setUploadForm((prev) => ({
                      ...prev,
                      file,
                      name: file?.name ?? prev.name,
                      type: resolveTypeFromFile(file),
                    }));
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
              </label>

              <Input
                label={t.documents.fileNameLabel}
                placeholder={t.documents.fileNamePlaceholder}
                value={uploadForm.name}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.typeLabel}
                <select
                  value={uploadForm.type}
                  onChange={(event) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      type: event.target.value as DocumentType,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="PDF">{t.documents.typePdf}</option>
                  <option value="IMAGE">{t.documents.typeImage}</option>
                  <option value="SPREADSHEET">{t.documents.typeSpreadsheet}</option>
                  <option value="OTHER">{t.documents.typeOther}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.folderLabel}
                <select
                  value={uploadForm.folderId}
                  onChange={(event) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      folderId: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folderPaths[folder.id] ?? folder.name}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label={t.documents.tagsLabel}
                placeholder={t.documents.tagsPlaceholder}
                value={uploadForm.tags}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, tags: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.descriptionLabel}
                <textarea
                  className="min-h-[96px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  value={uploadForm.description}
                  onChange={(event) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </label>

              {uploadError ? (
                <p className="text-sm text-red-500">{uploadError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? t.documents.saving : t.documents.uploadAction}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isMoveModalOpen && moveDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.documents.moveTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setIsMoveModalOpen(false);
                  setMoveDocument(null);
                  setMoveFolderId("");
                  setMoveError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!moveDocument) return;
                void handleMoveDocument(
                  moveDocument.id,
                  moveFolderId || null,
                );
              }}
            >
              <p className="text-sm text-zinc-600">
                {t.documents.fileLabel}: <strong>{moveDocument.name}</strong>
              </p>

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.documents.moveLabel}
                <select
                  value={moveFolderId}
                  onChange={(event) => setMoveFolderId(event.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">{t.documents.folderRoot}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folderPaths[folder.id] ?? folder.name}
                    </option>
                  ))}
                </select>
              </label>

              {moveError ? (
                <p className="text-sm text-red-500">{moveError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsMoveModalOpen(false);
                    setMoveDocument(null);
                    setMoveFolderId("");
                    setMoveError(null);
                  }}
                >
                  {t.documents.cancel}
                </Button>
                <Button type="submit" disabled={isMoving}>
                  {isMoving ? t.documents.saving : t.documents.moveConfirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
*/

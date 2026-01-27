import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type DocumentType = "PDF" | "IMAGE" | "SPREADSHEET" | "OTHER";

export type DocumentReferenceModule =
  | "DOCUMENTS"
  | "FINANCE"
  | "CALENDAR"
  | "REMINDERS"
  | "HR"
  | "PURCHASING"
  | "SECRETS"
  | "CUSTOM";

export type DocumentReferenceKind = "MENTION" | "SCHEDULED";

export type DocumentFolder = {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  totalFiles: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentSummary = {
  id: string;
  workspaceId: string;
  folderId?: string | null;
  name: string;
  type: DocumentType;
  fileUrl?: string | null;
  mimeType?: string | null;
  sizeBytes?: string | null;
  tags?: string[] | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentReference = {
  id: string;
  workspaceId: string;
  documentId: string;
  sourceModule: DocumentReferenceModule;
  sourceType: string;
  sourceId: string;
  title: string;
  referenceKind: DocumentReferenceKind;
  mentionedAt?: string | null;
  scheduledAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type FolderListParams = {
  workspaceId?: string;
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "updatedAt" | "name";
  orderDirection?: "asc" | "desc";
  query?: string;
};

export type DocumentsListParams = {
  workspaceId?: string;
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "updatedAt" | "name";
  orderDirection?: "asc" | "desc";
  type?: DocumentType;
  folderId?: string;
  query?: string;
};

export type ReferencesListParams = {
  workspaceId?: string;
  documentId: string;
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "mentionedAt" | "scheduledAt";
  orderDirection?: "asc" | "desc";
  kind?: DocumentReferenceKind;
};

const buildListQuery = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
};

const resolveWorkspaceId = (workspaceId?: string) => {
  const resolved = workspaceId ?? getWorkspaceId();
  if (!resolved) {
    throw new Error("Workspace não selecionado");
  }
  return resolved;
};

export const listDocumentFolders = async (params: FolderListParams = {}) => {
  const workspaceId = resolveWorkspaceId(params.workspaceId);
  const query = buildListQuery({
    page: params.page ? String(params.page) : undefined,
    pageSize: params.pageSize ? String(params.pageSize) : undefined,
    orderBy: params.orderBy,
    orderDirection: params.orderDirection,
    q: params.query,
  });

  return apiFetch<PaginatedResponse<DocumentFolder>>(
    `/workspaces/${workspaceId}/documents/folders${query}`,
    { workspaceId },
  );
};

export const listDocuments = async (params: DocumentsListParams = {}) => {
  const workspaceId = resolveWorkspaceId(params.workspaceId);
  const query = buildListQuery({
    page: params.page ? String(params.page) : undefined,
    pageSize: params.pageSize ? String(params.pageSize) : undefined,
    orderBy: params.orderBy,
    orderDirection: params.orderDirection,
    type: params.type,
    folderId: params.folderId,
    q: params.query,
  });

  return apiFetch<PaginatedResponse<DocumentSummary>>(
    `/workspaces/${workspaceId}/documents${query}`,
    { workspaceId },
  );
};

export const listDocumentReferences = async (params: ReferencesListParams) => {
  const workspaceId = resolveWorkspaceId(params.workspaceId);
  const query = buildListQuery({
    page: params.page ? String(params.page) : undefined,
    pageSize: params.pageSize ? String(params.pageSize) : undefined,
    orderBy: params.orderBy,
    orderDirection: params.orderDirection,
    kind: params.kind,
  });

  return apiFetch<PaginatedResponse<DocumentReference>>(
    `/workspaces/${workspaceId}/documents/${params.documentId}/references${query}`,
    { workspaceId },
  );
};

export const createDocumentFolder = async (input: {
  workspaceId?: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);

  return apiFetch<DocumentFolder>(
    `/workspaces/${workspaceId}/documents/folders`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        description: input.description ?? undefined,
        parentId: input.parentId ?? undefined,
      }),
      workspaceId,
    },
  );
};

export const updateDocumentFolder = async (input: {
  workspaceId?: string;
  id: string;
  name?: string;
  description?: string | null;
  parentId?: string | null;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);

  return apiFetch<DocumentFolder>(
    `/workspaces/${workspaceId}/documents/folders/${input.id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        name: input.name,
        description: input.description ?? undefined,
        parentId: input.parentId ?? undefined,
      }),
      workspaceId,
    },
  );
};

export const createDocumentReference = async (input: {
  workspaceId?: string;
  documentId: string;
  sourceModule: DocumentReferenceModule;
  sourceType: string;
  sourceId: string;
  title: string;
  referenceKind: DocumentReferenceKind;
  mentionedUserIds?: string[] | null;
  mentionedAt?: string | null;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);

  return apiFetch<DocumentReference>(
    `/workspaces/${workspaceId}/documents/${input.documentId}/references`,
    {
      method: "POST",
      body: JSON.stringify({
        sourceModule: input.sourceModule,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        title: input.title,
        referenceKind: input.referenceKind,
        mentionedAt: input.mentionedAt ?? undefined,
        mentionedUserIds: input.mentionedUserIds ?? undefined,
      }),
      workspaceId,
    },
  );
};

export const deleteDocumentFolder = async (input: {
  workspaceId?: string;
  id: string;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);

  await apiFetch<void>(
    `/workspaces/${workspaceId}/documents/folders/${input.id}`,
    {
      method: "DELETE",
      workspaceId,
    },
  );
};

export const createDocument = async (input: {
  workspaceId?: string;
  name: string;
  type: DocumentType;
  folderId?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  tags?: string[] | null;
  description?: string | null;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);

  return apiFetch<DocumentSummary>(`/workspaces/${workspaceId}/documents`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      type: input.type,
      folderId: input.folderId ?? undefined,
      fileUrl: input.fileUrl ?? undefined,
      mimeType: input.mimeType ?? undefined,
      sizeBytes: input.sizeBytes ?? undefined,
      tags: input.tags ?? undefined,
      description: input.description ?? undefined,
    }),
    workspaceId,
  });
};

export const uploadDocumentFile = async (input: {
  workspaceId?: string;
  file: File;
  name: string;
  type: DocumentType;
  folderId?: string | null;
  tags?: string[] | null;
  description?: string | null;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);
  const formData = new FormData();

  formData.append("file", input.file);
  formData.append("name", input.name);
  formData.append("type", input.type);
  if (input.folderId) formData.append("folderId", input.folderId);
  if (input.tags?.length) formData.append("tags", JSON.stringify(input.tags));
  if (input.description) formData.append("description", input.description);

  return apiFetch<DocumentSummary>(
    `/workspaces/${workspaceId}/documents/upload`,
    {
      method: "POST",
      body: formData,
      workspaceId,
    },
  );
};

export const updateDocument = async (input: {
  workspaceId?: string;
  id: string;
  name?: string;
  type?: DocumentType;
  folderId?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  tags?: string[] | null;
  description?: string | null;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);

  return apiFetch<DocumentSummary>(
    `/workspaces/${workspaceId}/documents/${input.id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        folderId: input.folderId,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        tags: input.tags,
        description: input.description,
      }),
      workspaceId,
    },
  );
};

export const deleteDocument = async (input: {
  workspaceId?: string;
  id: string;
}) => {
  const workspaceId = resolveWorkspaceId(input.workspaceId);

  await apiFetch<void>(`/workspaces/${workspaceId}/documents/${input.id}`, {
    method: "DELETE",
    workspaceId,
  });
};

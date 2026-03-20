import type {
  DocumentType,
  DocumentFolder,
  DocumentSummary,
  DocumentReference,
  DocumentReferenceModule,
  DocumentReferenceKind,
} from '@/lib/api/documents';

export type {
  DocumentType,
  DocumentFolder,
  DocumentSummary,
  DocumentReference,
  DocumentReferenceModule,
  DocumentReferenceKind,
};

export type ViewMode = 'grid' | 'list';

export const FILE_TYPE_STYLE: Record<
  DocumentType,
  { bg: string; text: string; border: string }
> = {
  PDF: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-200' },
  IMAGE: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200' },
  SPREADSHEET: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-200' },
  OTHER: { bg: 'bg-zinc-500/10', text: 'text-zinc-600', border: 'border-zinc-200' },
};

export function detectDocumentType(fileName: string): DocumentType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].some((ext) => lower.endsWith(ext)))
    return 'IMAGE';
  if (['.xlsx', '.xls', '.csv'].some((ext) => lower.endsWith(ext)))
    return 'SPREADSHEET';
  return 'OTHER';
}

export function buildFolderBreadcrumb(
  folderId: string,
  folderMap: Record<string, DocumentFolder>,
): { id: string; name: string }[] {
  const crumbs: { id: string; name: string }[] = [];
  let current: DocumentFolder | undefined = folderMap[folderId];
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    current = current.parentId ? folderMap[current.parentId] : undefined;
  }
  return crumbs;
}

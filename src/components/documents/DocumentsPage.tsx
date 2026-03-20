'use client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api/client';
import {
  createDocumentFolder,
  createDocumentReference,
  deleteDocument,
  deleteDocumentFolder,
  listDocumentReferences,
  updateDocument,
  updateDocumentFolder,
  uploadDocumentFile,
  type DocumentSummary,
} from '@/lib/api/documents';
import { lookupUserByEmail } from '@/lib/api/users';
import { useDocumentsPage } from './use-documents-page';
import { FoldersSidebar } from './sidebar/FoldersSidebar';
import { BreadcrumbNav } from './toolbar/BreadcrumbNav';
import { DocumentsToolbar } from './toolbar/DocumentsToolbar';
import { DocumentsGridView } from './views/DocumentsGridView';
import { DocumentsListView } from './views/DocumentsListView';
import { FileDetailDrawer } from './modals/FileDetailDrawer';
import { MoveFolderModal } from './modals/MoveFolderModal';
import { RenameModal } from './modals/RenameModal';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';
import { MentionModal } from './modals/MentionModal';
import { LinkModal } from './modals/LinkModal';
import { CreateFolderModal } from './modals/CreateFolderModal';
import { UploadFileModal } from './modals/UploadFileModal';
import { detectDocumentType } from './types';

type Props = {
  initialQuery?: string;
  initialFolder?: string;
  initialType?: string;
  initialSort?: string;
  initialPage?: number;
};

export function DocumentsPage(props: Props) {
  const vm = useDocumentsPage(props);
  const visibleFrom = vm.total === 0 ? 0 : (vm.page - 1) * 6 + 1;
  const visibleTo = vm.total === 0 ? 0 : visibleFrom + vm.records.length - 1;
  const showingLabel = vm.t.documents.showing
    .replace('{{from}}', String(visibleFrom))
    .replace('{{to}}', String(visibleTo))
    .replace('{{total}}', String(vm.total));

  const goFolder = (id: string) => {
    vm.setFolderFilter(id);
    vm.setPage(1);
    vm.updateQueryParams({ folder: id, page: 1 });
  };

  const handleUploadFile = (file: File) => {
    vm.setUploadError(null);
    vm.setUploadForm({
      file,
      name: file.name,
      type: detectDocumentType(file.name),
      folderId: vm.folderFilter === 'all' ? '' : vm.folderFilter,
      tags: '',
      description: '',
    });
    vm.setIsUploadModalOpen(true);
  };

  const handleDropOnFolder = async (
    event: React.DragEvent<HTMLElement>,
    nextFolderId: string | null,
  ) => {
    event.preventDefault();
    const documentId = event.dataTransfer.getData('text/plain');
    if (!documentId) return;
    vm.setMoveError(null);
    vm.setIsMoving(true);
    try {
      await updateDocument({ id: documentId, folderId: nextFolderId ?? null });
      vm.setPage(1);
      await Promise.all([vm.loadDocuments(1), vm.loadFolders()]);
    } catch (err) {
      vm.setMoveError(err instanceof ApiError ? err.message : vm.t.documents.moveError);
    } finally {
      vm.setIsMoving(false);
    }
  };

  const handleMoveDocument = async () => {
    if (!vm.moveDocument) return;
    vm.setMoveError(null);
    vm.setIsMoving(true);
    try {
      await updateDocument({
        id: vm.moveDocument.id,
        folderId: vm.moveDocumentFolderId || null,
      });
      vm.setIsMoveModalOpen(false);
      vm.setMoveDocument(null);
      vm.setMoveDocumentFolderId('');
      vm.setPage(1);
      await Promise.all([vm.loadDocuments(1), vm.loadFolders()]);
    } catch (err) {
      vm.setMoveError(err instanceof ApiError ? err.message : vm.t.documents.moveError);
    } finally {
      vm.setIsMoving(false);
    }
  };

  const handleViewReferences = async (document: DocumentSummary) => {
    vm.setSelectedDocument(document);
    vm.setReferences([]);
    vm.setReferencesError(null);
    vm.setReferenceForm({ title: '', mentionedUsers: '' });
    vm.setReferenceError(null);
    vm.setReferencesLoading(true);
    try {
      const response = await listDocumentReferences({
        documentId: document.id,
        page: 1,
        pageSize: 50,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      });
      vm.setReferences(response.items);
    } catch (err) {
      vm.setReferencesError(
        err instanceof ApiError ? err.message : vm.t.documents.references.loadError,
      );
    } finally {
      vm.setReferencesLoading(false);
    }
  };

  const handleCreateReference = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vm.setReferenceError(null);
    if (!vm.selectedDocument) return;
    if (!vm.referenceForm.title.trim()) {
      vm.setReferenceError(vm.t.documents.references.titleRequired);
      return;
    }
    vm.setIsSavingReference(true);
    try {
      await createDocumentReference({
        documentId: vm.selectedDocument.id,
        sourceModule: 'DOCUMENTS',
        sourceType: 'document',
        sourceId: vm.selectedDocument.id,
        title: vm.referenceForm.title.trim(),
        referenceKind: 'MENTION',
        mentionedUserIds: vm.referenceForm.mentionedUsers
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      vm.setReferenceForm({ title: '', mentionedUsers: '' });
      await handleViewReferences(vm.selectedDocument);
    } catch (err) {
      vm.setReferenceError(
        err instanceof ApiError ? err.message : vm.t.documents.references.createError,
      );
    } finally {
      vm.setIsSavingReference(false);
    }
  };

  const handleSearchUser = async () => {
    if (!vm.mentionSearchEmail.trim()) {
      vm.setMentionSearchError(vm.t.documents.references.mentionSearchRequired);
      return;
    }
    vm.setMentionSearchError(null);
    try {
      const user = await lookupUserByEmail(vm.mentionSearchEmail.trim().toLowerCase());
      if (!vm.mentionSelectedUserIds.includes(user.id)) {
        vm.setMentionSelectedUserIds([...vm.mentionSelectedUserIds, user.id]);
      }
      if (!vm.workspaceMembers.find((member) => member.id === user.id)) {
        vm.setWorkspaceMembers([...vm.workspaceMembers, user]);
      }
      vm.setMentionSearchEmail('');
    } catch (err) {
      vm.setMentionSearchError(err instanceof ApiError ? err.message : vm.t.documents.references.loadError);
    }
  };

  const handleMentionDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vm.mentionDocument) return;
    vm.setMentionError(null);
    if (!vm.mentionSelectedUserIds.length) {
      vm.setMentionError(vm.t.documents.references.mentionSelectionRequired);
      return;
    }
    vm.setIsSavingReference(true);
    try {
      await createDocumentReference({
        documentId: vm.mentionDocument.id,
        sourceModule: 'DOCUMENTS',
        sourceType: 'document',
        sourceId: vm.mentionDocument.id,
        title: vm.mentionTitle.trim() || vm.mentionDocument.name,
        referenceKind: 'MENTION',
        mentionedUserIds: vm.mentionSelectedUserIds,
      });
      vm.setMentionDocument(null);
      vm.setMentionTitle('');
      vm.setMentionSearchEmail('');
      vm.setMentionSelectedUserIds([]);
      await vm.loadDocuments(1);
    } catch (err) {
      vm.setMentionError(err instanceof ApiError ? err.message : vm.t.documents.references.createError);
    } finally {
      vm.setIsSavingReference(false);
    }
  };

  const handleLinkDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vm.linkDocument) return;
    vm.setLinkError(null);
    vm.setIsLinking(true);
    try {
      await createDocumentReference({
        documentId: vm.linkDocument.id,
        sourceModule: vm.linkForm.module,
        sourceType: vm.linkForm.sourceType.trim(),
        sourceId: vm.linkForm.sourceId.trim(),
        title: vm.linkForm.title.trim(),
        referenceKind: 'MENTION',
      });
      vm.setLinkDocument(null);
      vm.setLinkForm({ module: 'FINANCE', sourceType: '', sourceId: '', title: '' });
    } catch (err) {
      vm.setLinkError(err instanceof ApiError ? err.message : vm.t.documents.linkError);
    } finally {
      vm.setIsLinking(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vm.setFolderError(null);
    if (!vm.folderForm.name.trim()) return;
    vm.setIsSavingFolder(true);
    try {
      const created = await createDocumentFolder({
        name: vm.folderForm.name.trim(),
        description: vm.folderForm.description.trim() || undefined,
        parentId: vm.folderForm.parentId || undefined,
      });
      vm.closeFolderModal();
      await vm.loadFolders();
      goFolder(created.id);
    } catch (err) {
      vm.setFolderError(err instanceof ApiError ? err.message : vm.t.documents.folderSaveError);
    } finally {
      vm.setIsSavingFolder(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vm.setUploadError(null);
    if (!vm.uploadForm.file || !vm.uploadForm.name.trim()) return;
    vm.setIsUploading(true);
    try {
      const tags = vm.uploadForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      await uploadDocumentFile({
        file: vm.uploadForm.file,
        name: vm.uploadForm.name.trim(),
        type: vm.uploadForm.type,
        folderId: vm.uploadForm.folderId || undefined,
        tags: tags.length ? tags : undefined,
        description: vm.uploadForm.description.trim() || undefined,
      });
      vm.closeUploadModal();
      vm.setUploadForm({
        file: null,
        name: '',
        type: 'PDF',
        folderId: '',
        tags: '',
        description: '',
      });
      vm.setPage(1);
      await Promise.all([vm.loadDocuments(1), vm.loadFolders()]);
    } catch (err) {
      vm.setUploadError(err instanceof ApiError ? err.message : vm.t.documents.uploadError);
    } finally {
      vm.setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] gap-4">
      <FoldersSidebar
        folders={vm.folders}
        selectedFolderId={vm.folderFilter}
        onSelect={goFolder}
        onDrop={handleDropOnFolder}
        isLoading={vm.isFoldersLoading}
      />

      <div className="flex-1">
        <Card className="h-full overflow-hidden p-0">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-6 py-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[var(--foreground)]">
                {vm.t.modules.documents}
              </h2>
              <BreadcrumbNav
                folderFilter={vm.folderFilter}
                folderMap={vm.folderMap}
                onNavigate={goFolder}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => vm.setIsFolderModalOpen(true)}>
                {vm.t.documents.newFolder}
              </Button>
              <Button onClick={() => vm.setIsUploadModalOpen(true)}>
                {vm.t.documents.uploadFile}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6">
            <DocumentsToolbar
              query={vm.query}
              onQueryChange={(value) => {
                vm.setQuery(value);
                vm.setPage(1);
                vm.updateQueryParams({ q: value, page: 1 });
              }}
              typeFilter={vm.typeFilter}
              onTypeChange={(value) => {
                vm.setTypeFilter(value);
                vm.setPage(1);
                vm.updateQueryParams({ type: value, page: 1 });
              }}
              sortBy={vm.sortBy}
              onSortChange={(value) => {
                vm.setSortBy(value);
                vm.setPage(1);
                vm.updateQueryParams({ sort: value, page: 1 });
              }}
              viewMode={vm.viewMode}
              onViewChange={vm.setViewMode}
            />
            {vm.viewMode === 'grid' ? (
              <DocumentsGridView
                folders={vm.folders}
                records={vm.records}
                isLoading={vm.isLoading}
                folderFilter={vm.folderFilter}
                onFolderOpen={(folder) => goFolder(folder.id)}
                onFolderRename={(folder) => {
                  vm.setRenameFolderId(folder.id);
                  vm.setRenameFolderName(folder.name);
                }}
                onFolderMove={(folder) => {
                  vm.setMoveFolderId(folder.id);
                  vm.setMoveFolderParentId(folder.parentId ?? '');
                }}
                onFolderDelete={(folder) => {
                  vm.setDeleteFolderId(folder.id);
                  vm.setDeleteFolderName(folder.name);
                }}
                onFolderDrop={handleDropOnFolder}
                onViewHistory={handleViewReferences}
                onDocumentRename={(doc) => {
                  vm.setRenameDocumentId(doc.id);
                  vm.setRenameDocumentName(doc.name);
                }}
                onDocumentMove={(doc) => {
                  vm.setMoveDocument(doc);
                  vm.setMoveDocumentFolderId(doc.folderId ?? '');
                  vm.setIsMoveModalOpen(true);
                }}
                onDocumentMention={(doc) => vm.setMentionDocument(doc)}
                onDocumentLink={(doc) => vm.setLinkDocument(doc)}
                onDocumentDelete={(doc) => {
                  vm.setDeleteDocumentId(doc.id);
                  vm.setDeleteDocumentName(doc.name);
                }}
                onUpload={() => vm.setIsUploadModalOpen(true)}
                onUploadFile={handleUploadFile}
              />
            ) : (
              <DocumentsListView
                records={vm.records}
                folderMap={vm.folderMap}
                isLoading={vm.isLoading}
                onViewHistory={handleViewReferences}
                onRename={(doc) => {
                  vm.setRenameDocumentId(doc.id);
                  vm.setRenameDocumentName(doc.name);
                }}
                onMove={(doc) => {
                  vm.setMoveDocument(doc);
                  vm.setMoveDocumentFolderId(doc.folderId ?? '');
                  vm.setIsMoveModalOpen(true);
                }}
                onMention={(doc) => vm.setMentionDocument(doc)}
                onLink={(doc) => vm.setLinkDocument(doc)}
                onDelete={(doc) => {
                  vm.setDeleteDocumentId(doc.id);
                  vm.setDeleteDocumentName(doc.name);
                }}
                onUpload={() => vm.setIsUploadModalOpen(true)}
              />
            )}

            {vm.pageCount > 1 ? (
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-xs text-[var(--foreground)]/50">
                  {showingLabel}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={vm.page <= 1}
                    onClick={() => {
                      const next = vm.page - 1;
                      vm.setPage(next);
                      vm.updateQueryParams({ page: next });
                    }}
                  >
                    ← {vm.t.documents.prev}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={vm.page >= vm.pageCount}
                    onClick={() => {
                      const next = vm.page + 1;
                      vm.setPage(next);
                      vm.updateQueryParams({ page: next });
                    }}
                  >
                    {vm.t.documents.next} →
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <FileDetailDrawer
        isOpen={!!vm.selectedDocument}
        document={vm.selectedDocument}
        references={vm.references}
        isLoading={vm.referencesLoading}
        loadError={vm.referencesError}
        form={vm.referenceForm}
        formError={vm.referenceError}
        isSaving={vm.isSavingReference}
        kindLabels={vm.referenceKindLabels}
        moduleLabels={vm.moduleLabels}
        onChangeForm={vm.setReferenceForm}
        onSubmit={handleCreateReference}
        onClose={() => vm.setSelectedDocument(null)}
      />

      <MoveFolderModal
        isOpen={vm.isMoveModalOpen}
        document={vm.moveDocument}
        folders={vm.folders}
        folderPaths={vm.folderPaths}
        targetFolderId={vm.moveDocumentFolderId}
        error={vm.moveError}
        isMoving={vm.isMoving}
        onTargetChange={vm.setMoveDocumentFolderId}
        onConfirm={handleMoveDocument}
        onClose={() => vm.setIsMoveModalOpen(false)}
      />

      <RenameModal
        isOpen={!!vm.renameDocumentId}
        title={vm.t.documents.renameTitle}
        value={vm.renameDocumentName}
        error={vm.renameDocumentError}
        isSaving={vm.isMoving}
        onChange={vm.setRenameDocumentName}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!vm.renameDocumentId) return;
          await updateDocument({ id: vm.renameDocumentId, name: vm.renameDocumentName.trim() });
          vm.setRenameDocumentId(null);
          vm.setRenameDocumentName('');
          await vm.loadDocuments(1);
        }}
        onClose={() => vm.setRenameDocumentId(null)}
      />

      <RenameModal
        isOpen={!!vm.renameFolderId}
        title={vm.t.documents.renameTitle}
        value={vm.renameFolderName}
        error={vm.folderError}
        isSaving={vm.isSavingFolder}
        onChange={vm.setRenameFolderName}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!vm.renameFolderId) return;
          await updateDocumentFolder({ id: vm.renameFolderId, name: vm.renameFolderName.trim() });
          vm.setRenameFolderId(null);
          vm.setRenameFolderName('');
          await vm.loadFolders();
        }}
        onClose={() => vm.setRenameFolderId(null)}
      />

      <DeleteConfirmModal
        isOpen={!!vm.deleteFolderId}
        itemName={vm.deleteFolderName}
        isDeleting={vm.isMoving}
        error={vm.deleteError}
        onConfirm={async () => {
          if (!vm.deleteFolderId) return;
          await deleteDocumentFolder({ id: vm.deleteFolderId });
          vm.setDeleteFolderId(null);
          vm.setDeleteFolderName('');
          await Promise.all([vm.loadFolders(), vm.loadDocuments(1)]);
        }}
        onClose={() => vm.setDeleteFolderId(null)}
      />

      <DeleteConfirmModal
        isOpen={!!vm.deleteDocumentId}
        itemName={vm.deleteDocumentName}
        isDeleting={vm.isMoving}
        error={vm.deleteError}
        onConfirm={async () => {
          if (!vm.deleteDocumentId) return;
          await deleteDocument({ id: vm.deleteDocumentId });
          vm.setDeleteDocumentId(null);
          vm.setDeleteDocumentName('');
          await vm.loadDocuments(1);
        }}
        onClose={() => vm.setDeleteDocumentId(null)}
      />

      <MentionModal
        isOpen={!!vm.mentionDocument}
        document={vm.mentionDocument}
        title={vm.mentionTitle}
        searchEmail={vm.mentionSearchEmail}
        selectedUserIds={vm.mentionSelectedUserIds}
        members={vm.workspaceMembers}
        membersLoading={vm.membersLoading}
        membersError={vm.membersError}
        error={vm.mentionError}
        searchError={vm.mentionSearchError}
        isSaving={vm.isSavingReference}
        onTitleChange={vm.setMentionTitle}
        onSearchEmailChange={vm.setMentionSearchEmail}
        onToggleUser={(id) => {
          vm.setMentionSelectedUserIds(
            vm.mentionSelectedUserIds.includes(id)
              ? vm.mentionSelectedUserIds.filter((item) => item !== id)
              : [...vm.mentionSelectedUserIds, id],
          );
        }}
        onSubmit={handleMentionDocument}
        onSearchUser={handleSearchUser}
        onClose={() => {
          vm.setMentionDocument(null);
          vm.setMentionTitle('');
          vm.setMentionSearchEmail('');
          vm.setMentionSelectedUserIds([]);
          vm.setMentionError(null);
          vm.setMentionSearchError(null);
        }}
      />

      <LinkModal
        isOpen={!!vm.linkDocument}
        document={vm.linkDocument}
        form={vm.linkForm}
        moduleLabels={vm.moduleLabels}
        error={vm.linkError}
        isSaving={vm.isLinking}
        onChange={vm.setLinkForm}
        onSubmit={handleLinkDocument}
        onClose={() => vm.setLinkDocument(null)}
      />

      <CreateFolderModal
        isOpen={vm.isFolderModalOpen}
        form={vm.folderForm}
        folders={vm.folders}
        folderPaths={vm.folderPaths}
        error={vm.folderError}
        isSaving={vm.isSavingFolder}
        onChange={vm.setFolderForm}
        onSubmit={handleCreateFolder}
        onClose={vm.closeFolderModal}
      />

      <UploadFileModal
        isOpen={vm.isUploadModalOpen}
        form={vm.uploadForm}
        folders={vm.folders}
        folderPaths={vm.folderPaths}
        error={vm.uploadError}
        isUploading={vm.isUploading}
        onChange={vm.setUploadForm}
        onSubmit={handleUpload}
        onClose={vm.closeUploadModal}
      />
    </div>
  );
}

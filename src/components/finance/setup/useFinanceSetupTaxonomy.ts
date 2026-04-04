import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { ApiError } from '@/lib/api/client';
import {
  createFinanceCategory,
  createFinanceTag,
  deleteFinanceCategory,
  deleteFinanceTag,
  updateFinanceCategory,
  updateFinanceTag,
  type FinanceCategory,
  type FinanceTag,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';

import { emptyTaxonomyOverlay, type TaxonomyOverlayState } from './setup-state-model';

type UseFinanceSetupTaxonomyParams = {
  setCategories: Dispatch<SetStateAction<FinanceCategory[]>>;
  setTags: Dispatch<SetStateAction<FinanceTag[]>>;
};

export function useFinanceSetupTaxonomy({
  setCategories,
  setTags,
}: UseFinanceSetupTaxonomyParams) {
  const { t } = useLanguage();
  const [taxonomyOverlay, setTaxonomyOverlay] =
    useState<TaxonomyOverlayState>(emptyTaxonomyOverlay);
  const [isSaving, setIsSaving] = useState(false);

  const openCategoryOverlay = useCallback(
    (group: 'INCOME' | 'EXPENSE', category?: FinanceCategory) => {
      setTaxonomyOverlay({
        kind: 'category',
        editingCategory: category ?? null,
        editingTag: null,
        name: category?.name ?? '',
        group,
        error: null,
      });
    },
    [],
  );

  const openTagOverlay = useCallback((tag?: FinanceTag) => {
    setTaxonomyOverlay({
      kind: 'tag',
      editingCategory: null,
      editingTag: tag ?? null,
      name: tag?.name ?? '',
      group: 'EXPENSE',
      error: null,
    });
  }, []);

  const closeTaxonomyOverlay = useCallback(() => {
    setTaxonomyOverlay(emptyTaxonomyOverlay);
  }, []);

  const saveTaxonomyOverlay = useCallback(async () => {
    if (!taxonomyOverlay.name.trim()) {
      setTaxonomyOverlay((current) => ({
        ...current,
        error:
          current.kind === 'tag'
            ? t.finance.tagError ?? 'Unable to save tag.'
            : t.finance.typeRequired ?? t.finance.typeLabel,
      }));
      return;
    }

    setIsSaving(true);
    try {
      if (taxonomyOverlay.kind === 'category') {
        if (taxonomyOverlay.editingCategory) {
          const updated = await updateFinanceCategory({
            id: taxonomyOverlay.editingCategory.id,
            name: taxonomyOverlay.name.trim(),
            group: taxonomyOverlay.group,
          });
          setCategories((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        } else {
          const created = await createFinanceCategory({
            name: taxonomyOverlay.name.trim(),
            group: taxonomyOverlay.group,
          });
          setCategories((current) => [...current, created]);
        }
      }

      if (taxonomyOverlay.kind === 'tag') {
        if (taxonomyOverlay.editingTag) {
          const updated = await updateFinanceTag({
            id: taxonomyOverlay.editingTag.id,
            name: taxonomyOverlay.name.trim(),
          });
          setTags((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        } else {
          const created = await createFinanceTag({ name: taxonomyOverlay.name.trim() });
          setTags((current) => [...current, created]);
        }
      }

      closeTaxonomyOverlay();
    } catch (err) {
      setTaxonomyOverlay((current) => ({
        ...current,
        error: err instanceof ApiError ? err.message : t.finance.saveError ?? 'Unable to save.',
      }));
    } finally {
      setIsSaving(false);
    }
  }, [closeTaxonomyOverlay, setCategories, setTags, t, taxonomyOverlay]);

  const removeCategory = useCallback(async (category: FinanceCategory) => {
    const confirmed = window.confirm(
      t.finance.deleteConfirmation ?? 'Delete this category?',
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteFinanceCategory({ id: category.id });
      setCategories((current) => current.filter((item) => item.id !== category.id));
    } finally {
      setIsSaving(false);
    }
  }, [setCategories, t]);

  const removeTag = useCallback(async (tag: FinanceTag) => {
    const confirmed = window.confirm(
      t.finance.deleteConfirmation ?? 'Delete this tag?',
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteFinanceTag({ id: tag.id });
      setTags((current) => current.filter((item) => item.id !== tag.id));
    } finally {
      setIsSaving(false);
    }
  }, [setTags, t]);

  return {
    closeTaxonomyOverlay,
    isSaving,
    openCategoryOverlay,
    openTagOverlay,
    removeCategory,
    removeTag,
    saveTaxonomyOverlay,
    setTaxonomyOverlay,
    taxonomyOverlay,
  };
}
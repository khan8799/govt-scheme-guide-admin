'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { showError, showLoading } from '@/components/SweetAlert';
import { Scheme, SchemeFormData } from '@/app/types/scheme';
import SchemeList from '@/components/schemes/SchemeList';
import SchemeForm from '@/components/schemes/SchemeForm';
import SchemeDetailsModal from '@/components/schemes/SchemeDetailsModal';
import DeleteConfirmationModal from '@/components/schemes/DeleteConfirmationModal';
import EditConfirmationModal from '@/components/schemes/EditConfirmationModal';
import SchemeFilters from '@/components/schemes/SchemeFilters';
import SchemePagination from '@/components/schemes/SchemePagination';
import SchemeStats from '@/components/schemes/SchemeStats';
import { useSchemeData } from '@/hooks/useSchemeData';
import { useSchemeForm } from '@/hooks/useSchemeForm';
import { useSchemeFilters } from '@/hooks/useSchemeFilters';

interface FormField {
  label: string;
  key: keyof SchemeFormData;
  type: 'text' | 'textarea' | 'date' | 'json' | 'select' | 'multi-select' | 'file' | 'toggle' | 'rich-text';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

const SchemePage = React.memo(() => {
  const getErrorMessage = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;

  // Custom hooks for state management
  const {
    schemes: filteredSchemes,
    states,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalSchemes,
    hasMore,
    loadSchemes,
    loadAllSchemes,
    deleteScheme,
    fetchSchemeDetails
  } = useSchemeData();

  const {
    formData,
    isEditMode,
    existingImages,
    hasFormChanges,
    handleFormChange,
    handleFileChange,
    resetForm,
    prepareSchemeForEdit,
    submitForm,
    validateForm
  } = useSchemeForm();

  const {
    selectedState,
    selectedCategory,
    resetFilters,
    handleStateChange,
    handleCategoryChange
  } = useSchemeFilters();

  // Local state for UI
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [schemeToDelete, setSchemeToDelete] = useState<Scheme | null>(null);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

  // Memoized form fields to prevent unnecessary re-renders
  const formFields: FormField[] = useMemo(() => [
    { label: 'Scheme Title', key: 'schemeTitle', type: 'text', required: true },
    { label: 'Slug', key: 'slug', type: 'text', required: true },
    { label: 'Published On', key: 'publishedOn', type: 'date', required: true },
    { label: 'About', key: 'about', type: 'textarea', required: true },
    { label: 'Objectives', key: 'objectives', type: 'textarea', required: true },
    { 
      label: 'Category', 
      key: 'category', 
      type: 'select', 
      required: true,
      options: categories.map(cat => ({ value: cat._id, label: cat.name }))
    },
    { 
      label: 'States', 
      key: 'state', 
      type: 'multi-select', 
      required: true,
      options: states.map(state => ({ value: state._id, label: state.name }))
    },
    { label: 'Excerpt', key: 'excerpt', type: 'textarea' },
    { label: 'SEO Title', key: 'seoTitle', type: 'text' },
    { label: 'SEO Meta Description', key: 'seoMetaDescription', type: 'textarea' },
    { label: 'Salient Features', key: 'salientFeatures', type: 'json' },
    { label: 'Helpline Number', key: 'helplineNumber', type: 'json' },
    { label: 'FAQ', key: 'frequentlyAskedQuestions', type: 'json' },
    { label: 'Sources', key: 'sourcesAndReferences', type: 'json' },
    { label: 'Disclaimer', key: 'disclaimer', type: 'json' },
    { label: 'Featured', key: 'isFeatured', type: 'toggle' },
    { label: 'Banner Image', key: 'bannerImage', type: 'file' },
    { label: 'Card Image', key: 'cardImage', type: 'file' },
    { label: 'Rich Text Content', key: 'textWithHTMLParsing', type: 'rich-text' },
  ], [categories, states]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleSchemeSelect = useCallback(async (slug: string) => {
    const scheme = await fetchSchemeDetails(slug);
    if (scheme) {
      setSelectedScheme(scheme);
    }
  }, [fetchSchemeDetails]);

  const handleSchemeEdit = useCallback(async (id: string) => {
    const loadingAlert = showLoading('Loading scheme for editing...');
    try {
      let scheme = filteredSchemes.find(s => s._id === id);
      
      if (!scheme && filteredSchemes.length === 0) {
        await loadSchemes(1, false, selectedState, selectedCategory);
        scheme = filteredSchemes.find(s => s._id === id);
      }
      
      if (!scheme) {
        throw new Error('Scheme not found');
      }
      
      prepareSchemeForEdit(scheme);
      setIsAddMode(true);
      loadingAlert.close();
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(getErrorMessage(e, 'Failed to load scheme for editing'));
    }
  }, [filteredSchemes, loadSchemes, selectedState, selectedCategory, prepareSchemeForEdit]);

  const handleSchemeDelete = useCallback((id: string) => {
    const scheme = filteredSchemes.find(s => s._id === id);
    if (scheme) {
      setSchemeToDelete(scheme);
    }
  }, [filteredSchemes]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!schemeToDelete) return;
    
    const success = await deleteScheme(schemeToDelete._id);
    if (success) {
      setSchemeToDelete(null);
      await loadSchemes(1, false, selectedState, selectedCategory);
    }
  }, [schemeToDelete, deleteScheme, loadSchemes, selectedState, selectedCategory]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      await showError(validationError);
      return;
    }

    if (isEditMode) {
      setShowEditConfirmation(true);
      return;
    }

    await submitForm(() => {
      setIsAddMode(false);
      loadSchemes(1, false, selectedState, selectedCategory);
    });
  }, [validateForm, isEditMode, submitForm, selectedState, selectedCategory, loadSchemes]);

  const handleEditConfirm = useCallback(() => {
    setShowEditConfirmation(false);
    submitForm(() => {
      setIsAddMode(false);
      loadSchemes(1, false, selectedState, selectedCategory);
    });
  }, [submitForm, selectedState, selectedCategory, loadSchemes]);

  const handleCancelForm = useCallback(() => {
    if (isEditMode && hasFormChanges()) {
      setShowEditConfirmation(true);
      return;
    }
    setIsAddMode(false);
    resetForm();
  }, [isEditMode, hasFormChanges, resetForm]);

  const handleCancelConfirm = useCallback(() => {
    setShowEditConfirmation(false);
    setIsAddMode(false);
    resetForm();
  }, [resetForm]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    loadSchemes(1, false);
  }, [resetFilters, loadSchemes]);

  const handleRefresh = useCallback(() => {
    loadSchemes(1, false, selectedState, selectedCategory);
  }, [loadSchemes, selectedState, selectedCategory]);

  const handleStateFilterChange = useCallback((state: string) => {
    handleStateChange(state);
    loadSchemes(1, false, state, selectedCategory);
  }, [handleStateChange, loadSchemes, selectedCategory]);

  const handleCategoryFilterChange = useCallback((category: string) => {
    handleCategoryChange(category);
    loadSchemes(1, false, selectedState, category);
  }, [handleCategoryChange, loadSchemes, selectedState]);

  const handleLoadMore = useCallback(() => {
    loadSchemes(currentPage + 1, true, selectedState, selectedCategory);
  }, [loadSchemes, currentPage, selectedState, selectedCategory]);

  const handleLoadAll = useCallback(() => {
    loadAllSchemes(selectedState, selectedCategory);
  }, [loadAllSchemes, selectedState, selectedCategory]);

  const handlePreviousPage = useCallback(() => {
    loadSchemes(currentPage - 1, false, selectedState, selectedCategory);
  }, [loadSchemes, currentPage, selectedState, selectedCategory]);

  const handleNextPage = useCallback(() => {
    loadSchemes(currentPage + 1, false, selectedState, selectedCategory);
  }, [loadSchemes, currentPage, selectedState, selectedCategory]);

  const handleClearFiltersAndLoadAll = useCallback(() => {
    resetFilters();
    loadSchemes(1, false);
  }, [resetFilters, loadSchemes]);

  // Load schemes when filters change
  useEffect(() => {
    loadSchemes(1, false, selectedState, selectedCategory);
  }, [selectedState, selectedCategory, loadSchemes]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schemes</h1>
          {isEditMode && (
            <p className="text-sm text-blue-600 mt-1">Editing scheme: {formData.schemeTitle}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" 
            onClick={handleCancelForm}
          >
            {isAddMode ? 'Back' : 'View All'}
          </button>
          {!isAddMode && (
            <button 
              type="button" 
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600" 
              onClick={() => setIsAddMode(true)}
            >
              <PlusIcon className="h-4 w-4" /> Add Scheme
            </button>
          )}
        </div>
      </div>

      {!isAddMode ? (
        <>
          <SchemeFilters
            states={states}
            categories={categories}
            selectedState={selectedState}
            selectedCategory={selectedCategory}
            onStateChange={handleStateFilterChange}
            onCategoryChange={handleCategoryFilterChange}
            onReset={handleResetFilters}
            onRefresh={handleRefresh}
          />

          <div className="rounded-2xl border border-gray-200 bg-white">
            <SchemeStats
              filteredSchemesCount={filteredSchemes.length}
              totalSchemes={totalSchemes}
              hasMore={hasMore}
            />

            {loading ? (
              <div className="p-6 text-sm text-gray-600">Loading schemes...</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : filteredSchemes.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">
                {selectedState || selectedCategory ? (
                  <div className="text-center">
                    <p>No schemes found for the selected filters.</p>
                    <button 
                      onClick={handleClearFiltersAndLoadAll}
                      className="mt-2 px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                    >
                      Clear Filters & Show All Schemes
                    </button>
                  </div>
                ) : (
                  'No schemes found.'
                )}
              </div>
            ) : (
              <SchemeList 
                schemes={filteredSchemes} 
                onSelect={handleSchemeSelect} 
                onDelete={handleSchemeDelete} 
                onEdit={handleSchemeEdit} 
              />
            )}

            <SchemePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalSchemes={totalSchemes}
              filteredSchemesCount={filteredSchemes.length}
              hasMore={hasMore}
              loading={loading}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              onLoadMore={handleLoadMore}
              onLoadAll={handleLoadAll}
            />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 gap-6">
            <SchemeForm
              formFields={formFields}
              formData={formData}
              onChange={handleFormChange}
              onFileChange={handleFileChange}
              onSubmit={handleFormSubmit}
              isEditMode={isEditMode}
              existingImages={existingImages}
              loading={loading}
              hasUnsavedChanges={hasFormChanges()}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={handleCancelForm}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <SchemeDetailsModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
        onEdit={handleSchemeEdit}
      />

      <DeleteConfirmationModal
        scheme={schemeToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSchemeToDelete(null)}
      />

      {showEditConfirmation && (
        <EditConfirmationModal
          isEditMode={isEditMode}
          schemeTitle={formData.schemeTitle}
          onConfirm={handleEditConfirm}
          onCancel={handleCancelConfirm}
        />
      )}
    </div>
  );
});

SchemePage.displayName = 'SchemePage';

export default SchemePage;

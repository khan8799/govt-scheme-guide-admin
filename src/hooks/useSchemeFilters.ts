import { useState, useCallback, useMemo } from 'react';

export const useSchemeFilters = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const resetFilters = useCallback(() => {
    setSelectedState('');
    setSelectedCategory('');
  }, []);

  const handleStateChange = useCallback((state: string) => {
    setSelectedState(state);
    setSelectedCategory(''); // Clear category when state is selected
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedState(''); // Clear state when category is selected
  }, []);

  return useMemo(() => ({
    selectedState,
    selectedCategory,
    resetFilters,
    handleStateChange,
    handleCategoryChange
  }), [
    selectedState,
    selectedCategory,
    resetFilters,
    handleStateChange,
    handleCategoryChange
  ]);
};

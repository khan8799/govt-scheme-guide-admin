import React from 'react';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { State, Category } from '@/app/types/scheme';

interface SchemeFiltersProps {
  states: State[];
  categories: Category[];
  selectedState: string;
  selectedCategory: string;
  onStateChange: (state: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
  onRefresh: () => void;
}

const SchemeFilters: React.FC<SchemeFiltersProps> = React.memo(({
  states,
  categories,
  selectedState,
  selectedCategory,
  onStateChange,
  onCategoryChange,
  onReset,
  onRefresh
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Filter by State</Label>
        <Select
          options={states.map(state => ({ value: state._id, label: state.name }))}
          value={selectedState}
          onChange={(v) => onStateChange(String(v))}
          placeholder="Select state"
        />
      </div>
      <div>
        <Label>Filter by Category</Label>
        <Select
          options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
          value={selectedCategory}
          onChange={(v) => onCategoryChange(String(v))}
          placeholder="Select category"
        />
      </div>
      <div className="flex items-end gap-2">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Reset Filters
        </button>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-200 rounded-md hover:bg-blue-300"
        >
          Refresh
        </button>
      </div>
    </div>
  );
});

SchemeFilters.displayName = 'SchemeFilters';

export default SchemeFilters;

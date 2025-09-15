import React from 'react';

interface SchemePaginationProps {
  currentPage: number;
  totalPages: number;
  totalSchemes: number;
  filteredSchemesCount: number;
  hasMore: boolean;
  loading: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLoadMore: () => void;
  onLoadAll: () => void;
}

const SchemePagination: React.FC<SchemePaginationProps> = React.memo(({
  currentPage,
  totalPages,
  totalSchemes,
  filteredSchemesCount,
  hasMore,
  loading,
  onPreviousPage,
  onNextPage,
  onLoadMore,
  onLoadAll
}) => {
  if (filteredSchemesCount === 0) return null;

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredSchemesCount} of {totalSchemes || filteredSchemesCount} schemes
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button 
              onClick={onPreviousPage} 
              disabled={currentPage <= 1} 
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={onNextPage} 
              disabled={!hasMore} 
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="mt-3 text-center space-y-2">
        {hasMore && (
          <button 
            onClick={onLoadMore} 
            disabled={loading} 
            className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More Schemes'}
          </button>
        )}
        <div>
          <button
            onClick={onLoadAll}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load All Schemes
          </button>
        </div>
      </div>
    </div>
  );
});

SchemePagination.displayName = 'SchemePagination';

export default SchemePagination;

import React from 'react';

interface SchemeStatsProps {
  filteredSchemesCount: number;
  totalSchemes: number;
  hasMore: boolean;
}

const SchemeStats: React.FC<SchemeStatsProps> = React.memo(({ 
  filteredSchemesCount, 
  totalSchemes, 
  hasMore 
}) => {
  if (filteredSchemesCount === 0) return null;

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredSchemesCount}</span> schemes loaded
          {totalSchemes > filteredSchemesCount && (
            <span> of <span className="font-medium">{totalSchemes}</span> total</span>
          )}
        </div>
        {hasMore && <div className="text-sm text-blue-600">More schemes available</div>}
      </div>
    </div>
  );
});

SchemeStats.displayName = 'SchemeStats';

export default SchemeStats;

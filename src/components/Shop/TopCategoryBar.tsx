import React from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export const TopCategoryBar: React.FC = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 overflow-x-auto whitespace-nowrap custom-scrollbar bg-white">
      {/* Filter Button */}
      <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0 shadow-sm">
        <TuneIcon fontSize="small" />
      </button>

      {/* Sort By Dropdown */}
      <button className="flex items-center justify-between gap-2 px-4 h-10 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors shrink-0 shadow-sm font-medium text-sm">
        <span>Sort By</span>
        <KeyboardArrowDownIcon fontSize="small" className="text-gray-400" />
      </button>

      {/* Price Drop Highlight */}
      <button className="flex items-center justify-between gap-2 px-4 h-10 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition-colors shrink-0 shadow-sm font-bold text-sm">
        <TrendingDownIcon fontSize="small" />
        <span>Price Drop</span>
      </button>

      {/* Other Mock Filters */}
      <button className="flex items-center justify-between gap-2 px-4 h-10 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors shrink-0 shadow-sm font-medium text-sm">
        Brand
      </button>

      <button className="flex items-center justify-between gap-2 px-4 h-10 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors shrink-0 shadow-sm font-medium text-sm">
        Pack Size
      </button>
    </div>
  );
};

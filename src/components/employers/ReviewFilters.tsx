'use client';

import React from 'react';
import { Filter, SortDesc } from 'lucide-react';
import { ReviewFilters as Filters } from '@/types/company';

interface ReviewFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  reviewCount: number;
}

const ReviewFiltersComponent: React.FC<ReviewFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  reviewCount 
}) => {
  const handleSortChange = (sortBy: Filters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleRatingChange = (filterRating: Filters['filterRating']) => {
    onFiltersChange({ ...filters, filterRating });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Filter className="h-4 w-4 text-primary" />
        </div>
        <span>Filter Reviews</span>
      </h3>
      
      <div className="space-y-6">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <SortDesc className="h-4 w-4 text-gray-500" />
            <span>Sort by</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as Filters['sortBy'])}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Rating Filter
          </label>
          <div className="space-y-2">
            {['all', '5', '4', '3', '2', '1'].map((rating) => (
              <label key={rating} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.filterRating === rating}
                  onChange={(e) => handleRatingChange(e.target.value as Filters['filterRating'])}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                  {rating === 'all' ? 'All Ratings' : `${rating} Star${rating !== '1' ? 's' : ''}`}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Review Count */}
        <div className="pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{reviewCount}</span> reviews found
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewFiltersComponent;
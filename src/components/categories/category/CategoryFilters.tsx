'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useState, useTransition, FormEvent } from 'react';

export default function CategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const sortBy = searchParams.get('sort') || 'rating';
  const filterSize = searchParams.get('size') || 'all';

  /**
   * Update URL parameters and trigger navigation
   */
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  /**
   * Handle search form submission
   */
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateFilters('search', searchQuery);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = searchQuery || sortBy !== 'rating' || filterSize !== 'all';

  return (
    <section className="bg-white border-b border-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </form>

          {/* Filters */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => updateFilters('sort', e.target.value)}
              disabled={isPending}
              className="flex-1 md:flex-none px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 font-medium"
            >
              <option value="rating">Top Performance</option>
              <option value="reviews">Deepest Insights</option>
              <option value="name">Alpha Listing</option>
              <option value="display_order">Curated</option>
            </select>

            {/* Company Size */}
            <select
              value={filterSize}
              onChange={(e) => updateFilters('size', e.target.value)}
              disabled={isPending}
              className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700"
            >
              <option value="all">All Sizes</option>
              <option value="startup">Startup (1-50)</option>
              <option value="small">Small (51-200)</option>
              <option value="medium">Medium (201-1000)</option>
              <option value="large">Large (1000+)</option>
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                disabled={isPending}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-primary-hover rounded-full text-sm">
                Search: "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    updateFilters('search', '');
                  }}
                  className="hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            )}

            {sortBy !== 'rating' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-primary-hover rounded-full text-sm">
                Sort: {sortBy}
                <button
                  onClick={() => updateFilters('sort', 'rating')}
                  className="hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            )}

            {filterSize !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-primary-hover rounded-full text-sm">
                Size: {filterSize}
                <button
                  onClick={() => updateFilters('size', 'all')}
                  className="hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {isPending && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            Updating results...
          </div>
        )}
      </div>
    </section>
  );
}
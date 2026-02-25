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
    <section className="bg-background/80 backdrop-blur-md border-b border-border/50 py-6 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder-muted-foreground"
            />
          </form>

          {/* Filters */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => updateFilters('sort', e.target.value)}
              disabled={isPending}
              className="flex-1 md:flex-none px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-medium transition-all"
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
              className="flex-1 md:flex-none px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all"
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
                className="px-4 py-2 text-sm text-foreground hover:text-primary border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Search: "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    updateFilters('search', '');
                  }}
                  className="hover:text-primary-hover"
                >
                  ×
                </button>
              </span>
            )}

            {sortBy !== 'rating' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Sort: {sortBy}
                <button
                  onClick={() => updateFilters('sort', 'rating')}
                  className="hover:text-primary-hover"
                >
                  ×
                </button>
              </span>
            )}

            {filterSize !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Size: {filterSize}
                <button
                  onClick={() => updateFilters('size', 'all')}
                  className="hover:text-primary-hover"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {isPending && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            Updating results...
          </div>
        )}
      </div>
    </section>
  );
}
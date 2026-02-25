// app/categories/[slug]/CompanyList.tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, MapPin, Briefcase, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Company {
  id: string;
  name: string;
  slug: string;
  headquarters?: string;
  employee_count?: string;
  logo_url?: string;
  description?: string;
  review_count?: number;
  avg_rating?: number;
}

interface CompanyListProps {
  companies: Company[];
  total: number;
  page: number;
  hasMore: boolean;
  industrySlug: string;
}

export default function CompanyList({
  companies,
  total,
  page,
  hasMore,
  industrySlug
}: CompanyListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load next page of companies
   */
  const loadMore = () => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page + 1));
    router.push(`/categories/${industrySlug}?${params.toString()}`);
  };

  /**
   * Get rating color based on value
   */
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 text-green-700 border-green-200';
    if (rating >= 4.0) return 'bg-indigo-50 text-primary-hover border-indigo-200';
    if (rating >= 3.5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-orange-50 text-orange-700 border-orange-200';
  };

  /**
   * Get star fill color based on rating
   */
  const getStarColor = (rating: number) => {
    if (rating >= 4.5) return 'fill-green-500 text-green-500';
    if (rating >= 4.0) return 'fill-indigo-500 text-indigo-500';
    if (rating >= 3.5) return 'fill-yellow-500 text-yellow-500';
    return 'fill-orange-500 text-orange-500';
  };

  /**
   * Format employee count for display
   */
  const formatEmployeeCount = (count?: string) => {
    if (!count) return null;

    // If it's already formatted (like "1000+"), return as is
    if (count.includes('+') || count.includes('-')) return count;

    // Convert number to formatted string
    const num = parseInt(count);
    if (isNaN(num)) return count;

    if (num >= 10000) return '10,000+';
    if (num >= 5000) return '5,000+';
    if (num >= 1000) return '1,000+';
    if (num >= 500) return '500+';
    if (num >= 200) return '200-500';
    if (num >= 50) return '50-200';
    return '1-50';
  };

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Workplace <span className="text-primary">Index</span>
          </h2>
          <p className="text-slate-500 font-medium">Analyzing {total.toLocaleString()} organizations in this industry</p>
        </div>

        {page > 1 && (
          <span className="bg-slate-100 text-slate-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Page {page}
          </span>
        )}
      </div>

      {companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Companies Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search query to find more companies.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/employers/${company.slug}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
                          {company.name}
                        </h3>

                        {/* Location and Size */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          {company.headquarters && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{company.headquarters}</span>
                            </span>
                          )}
                          {company.employee_count && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              {formatEmployeeCount(company.employee_count)} employees
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating Badge */}
                      {company.avg_rating && company.avg_rating > 0 ? (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRatingColor(company.avg_rating)}`}>
                          <Star className={`h-5 w-5 ${getStarColor(company.avg_rating)}`} />
                          <span className="text-lg font-bold">
                            {company.avg_rating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-50 text-gray-500 border-gray-200">
                          <Star className="h-5 w-5 text-gray-400" />
                          <span className="text-lg font-bold">N/A</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {company.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Review Count */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-primary hover:text-primary-hover">
                        {company.review_count || 0} {company.review_count === 1 ? 'review' : 'reviews'}
                      </span>

                      {company.avg_rating && company.avg_rating > 0 && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <TrendingUp className="h-4 w-4" />
                          <span>
                            {company.avg_rating >= 4.5 ? 'Highly Rated' :
                              company.avg_rating >= 4.0 ? 'Well Rated' :
                                company.avg_rating >= 3.5 ? 'Good Rating' : 'Mixed Reviews'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Info & Load More */}
          <div className="mt-8 space-y-4">
            {/* Showing X of Y */}
            <div className="text-center text-sm text-gray-600">
              Showing {Math.min(page * 12, total)} of {total.toLocaleString()} companies
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Companies'
                  )}
                </button>
              </div>
            )}

            {/* End of List Message */}
            {!hasMore && companies.length > 0 && (
              <div className="text-center text-sm text-gray-500 py-4">
                You've reached the end of the list
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
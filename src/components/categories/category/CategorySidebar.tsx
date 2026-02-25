'use client'
import { supabase } from '@/lib/supabase';

import Link from 'next/link';
import { Star, Award, TrendingUp, MessageSquare, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Review {
  id: string;
  overall_rating: number;
  likes?: string;
  dislikes?: string;
  designation?: string;
  created_at: string;
  companies?: {
    name: string;
    slug: string;
  };
}

interface CategorySidebarProps {
  industryId: string;
}

export default function CategorySidebar({ industryId }: CategorySidebarProps) {
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentReviews() {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get company IDs for this industry
        const { data: companyIndustries, error: ciError } = await supabase
          .from('company_industries')
          .select('company_id')
          .eq('industry_id', industryId)
          .limit(50); // Limit to prevent too many companies

        if (ciError) throw ciError;

        if (!companyIndustries || companyIndustries.length === 0) {
          setRecentReviews([]);
          setLoading(false);
          return;
        }

        const companyIds = companyIndustries.map(ci => ci.company_id);

        // Step 2: Fetch recent reviews from these companies
        const { data: reviews, error: reviewsError } = await supabase
          .from('company_reviews')
          .select(`
            id,
            overall_rating,
            likes,
            dislikes,
            designation,
            created_at,
            companies (
              name,
              slug
            )
          `)
          .in('company_id', companyIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (reviewsError) throw reviewsError;

        // setRecentReviews(reviews || []);
        setRecentReviews(
          (reviews || []).map((r) => ({
            ...r,
            companies: r.companies?.[0] || null,
          }))
        );
      } catch (err) {
        console.error('Error fetching recent reviews:', err);
        setError('Failed to load recent reviews');
      } finally {
        setLoading(false);
      }
    }

    fetchRecentReviews();
  }, [industryId]);

  /**
   * Format relative date (e.g., "2 days ago")
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  /**
   * Truncate text to specified length
   */
  const truncateText = (text: string, maxLength: number = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  /**
   * Get first available text (likes or dislikes)
   */
  const getReviewExcerpt = (review: Review) => {
    if (review.likes) return truncateText(review.likes);
    if (review.dislikes) return truncateText(review.dislikes);
    return 'No review text available';
  };

  return (
    <div className="space-y-6">
      {/* Recent Reviews Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            Community Feed
          </h3>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : recentReviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No recent reviews available</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors"
                >
                  {/* Rating and Date */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.overall_rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {/* Review Excerpt */}
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {getReviewExcerpt(review)}
                  </p>

                  {/* Reviewer Info */}
                  <div className="text-xs text-gray-500">
                    {review.designation && <span className="font-medium">{review.designation}</span>}
                    {review.designation && review.companies && <span> at </span>}
                    {review.companies && (
                      <Link
                        href={`/employers/${review.companies.slug}`}
                        className="text-primary hover:text-primary-hover hover:underline font-medium"
                      >
                        {review.companies.name}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="#reviews"
                className="text-sm text-primary hover:text-primary-hover font-medium flex items-center justify-center gap-1 hover:gap-2 transition-all"
              >
                View all reviews
                <span>→</span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Top Rated Badge */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6 shadow-sm">
        <Award className="h-8 w-8 text-yellow-600 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Top Rated Companies
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Companies with 4.5+ ratings and 100+ reviews in this industry
        </p>
        <Link
          href="#top-rated"
          className="inline-flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-800 font-medium group"
        >
          See all winners
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Industry Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 rounded-xl border border-indigo-200 p-6 shadow-sm">
        <TrendingUp className="h-8 w-8 text-primary mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Industry Insights
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Discover trends, salary data, and career growth opportunities
        </p>
        <Link
          href="#insights"
          className="inline-flex items-center gap-2 text-sm text-primary-hover hover:text-indigo-800 font-medium group"
        >
          View insights
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full"></div>
        <h3 className="text-xl font-black mb-3 tracking-tight">
          Share Your Insight
        </h3>
        <p className="text-sm text-slate-400 mb-6 font-medium">
          Contribute to the most transparent workplace database in the industry.
        </p>
        <Link
          href="/review"
          className="block w-full bg-indigo-600 text-white text-center px-4 py-4 rounded-2xl font-black shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition-all uppercase tracking-widest text-xs"
        >
          Begin Review
        </Link>
        <p className="text-[10px] text-slate-500 mt-4 text-center font-bold uppercase tracking-widest">
          100% Anonymous • 2 Minute Survey
        </p>
      </div>

      {/* Helpful Stats Box */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Why Reviews Matter
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Authentic Insights</p>
              <p className="text-xs text-gray-600">Real experiences from current and former employees</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Make Informed Decisions</p>
              <p className="text-xs text-gray-600">Compare companies and find the right fit</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Help Others</p>
              <p className="text-xs text-gray-600">Your review helps job seekers worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
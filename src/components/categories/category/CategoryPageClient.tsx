'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Star, Building, Users, TrendingUp, Search, 
  MapPin, Briefcase, Award, ChevronRight 
} from 'lucide-react';
import type { IndustryWithStats } from '@/lib/supabase';

interface Company {
  id: string;
  name: string;
  slug: string;
  headquarters?: string;
  employee_count?: string;
  logo_url?: string;
  description?: string;
  avg_rating?: number;
  review_count?: number;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  company_count?: number;
}

interface Review {
  id: string;
  overall_rating: number;
  review_title: string;
  pros?: string;
  designation?: string;
  created_at: string;
  company: {
    name: string;
    slug: string;
  };
}

interface CategoryPageClientProps {
  industry: IndustryWithStats;
  companies: Company[];
  companiesTotal: number;
  hasMore: boolean;
  currentPage: number;
  subCategories: SubCategory[];
  recentReviews: Review[];
}

export default function CategoryPageClient({
  industry,
  companies,
  companiesTotal,
  hasMore,
  currentPage,
  subCategories,
  recentReviews,
}: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [filterSize, setFilterSize] = useState(searchParams.get('size') || 'all');

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (value: string) => {
    setFilterSize(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('size', value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Filter companies by search and size
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterSize === 'all') return true;
    
    const employeeCount = company.employee_count?.toLowerCase() || '';
    
    switch (filterSize) {
      case 'startup':
        return employeeCount.includes('1-50') || employeeCount.includes('50');
      case 'small':
        return employeeCount.includes('51-200') || employeeCount.includes('200');
      case 'medium':
        return employeeCount.includes('201-1000') || employeeCount.includes('1000');
      case 'large':
        return employeeCount.includes('1000+') || employeeCount.includes('10,000');
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Industry Overview */}
      <section className="bg-gradient-to-r from-primary to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <Link href="/reviews" className="text-indigo-200 hover:text-white">
              ← All Industries
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {industry.name} Reviews
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl">
            {industry.description || `Explore honest employee reviews of ${industry.name} companies. Find the best workplaces based on real experiences.`}
          </p>

          {/* Industry Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Building className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{(industry.company_count || companiesTotal).toLocaleString()}</div>
              <div className="text-indigo-100">Companies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Users className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{(industry.review_count || 0).toLocaleString()}</div>
              <div className="text-indigo-100">Employee Reviews</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Star className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{industry.avg_rating?.toFixed(1) || 'N/A'}</div>
              <div className="text-indigo-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-categories */}
      {subCategories.length > 0 && (
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Specialization</h2>
            <div className="flex flex-wrap gap-3">
              {subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-indigo-100 rounded-full text-sm font-medium text-gray-700 hover:text-primary-hover transition-colors"
                >
                  {sub.name} ({sub.company_count || 0})
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Company Name</option>
              </select>

              <select
                value={filterSize}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Sizes</option>
                <option value="startup">Startup (1-50)</option>
                <option value="small">Small (51-200)</option>
                <option value="medium">Medium (201-1000)</option>
                <option value="large">Large (1000+)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company List - Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Top {industry.name} Companies ({filteredCompanies.length})
            </h2>

            {filteredCompanies.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-600">No companies found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/employers/${company.slug}`}
                    className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
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
                          <Building className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Company Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {company.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {company.headquarters && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {company.headquarters}
                                </span>
                              )}
                              {company.employee_count && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {company.employee_count} employees
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rating Badge */}
                          {company.avg_rating && (
                            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                              <Star className="h-5 w-5 fill-green-500 text-green-500" />
                              <span className="text-lg font-bold text-gray-900">
                                {company.avg_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {company.review_count !== undefined && company.review_count > 0 && (
                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium text-primary">
                              {company.review_count.toLocaleString()} reviews
                            </span>
                          </div>
                        )}

                        {/* Quick Stats - You can add these if you have the data */}
                        {/* <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Work-Life:</span>
                            <span className="ml-1 font-medium">4.3</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Culture:</span>
                            <span className="ml-1 font-medium">4.5</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Salary:</span>
                            <span className="ml-1 font-medium">4.2</span>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load More / Pagination */}
            {(hasMore || currentPage > 1) && (
              <div className="text-center mt-8">
                {hasMore ? (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                  >
                    Load More Companies
                  </button>
                ) : currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Previous Page
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Reviews */}
            {recentReviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.overall_rating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{review.review_title}</h4>
                      {review.pros && (
                        <p className="text-sm text-gray-600 mb-2">{review.pros}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        {review.designation} at {review.company.name}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="#" className="text-sm text-primary hover:text-primary-hover font-medium mt-4 block">
                  View all reviews →
                </Link>
              </div>
            )}

            {/* Top Rated Badge */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <Award className="h-8 w-8 text-yellow-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Top Rated in {industry.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Companies with 4.5+ ratings and 100+ reviews
              </p>
              <Link href="#" className="text-sm text-primary hover:text-primary-hover font-medium">
                See all winners →
              </Link>
            </div>

            {/* CTA Box */}
            <div className="bg-primary text-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Work in {industry.name}?</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Share your experience to help others make informed career decisions
              </p>
              <Link
                href="/review"
                className="block w-full bg-white text-primary text-center px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Write a Review
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About {industry.name} Company Reviews
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              Discover authentic employee reviews of {industry.name} companies. Our platform features honest feedback from professionals about their workplace experiences.
            </p>
            <p className="text-gray-600 mb-4">
              Whether you're looking for information about work-life balance, salary expectations, or career growth opportunities, you'll find comprehensive reviews to guide your decision.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">What You'll Find</h3>
            <ul className="text-gray-600 space-y-2 mb-4">
              <li>• Detailed ratings on work-life balance, compensation, and company culture</li>
              <li>• Real experiences from current and former employees</li>
              <li>• Insights on interview processes and hiring practices</li>
              <li>• Information about benefits, perks, and remote work policies</li>
              <li>• Career growth and promotion opportunities</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
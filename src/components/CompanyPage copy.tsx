'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Star,
  Filter,
  ChevronDown,
  Building,
  MapPin,
  Users,
  Info,
  FileText,
} from 'lucide-react';
import StarRating from '../components/StarRating';
import { companyApi, reviewsApi } from '../services/api';
import type { CompanyReview } from '../lib/supabase';

const CompanyPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const companySlug = (params.companySlug as string).replace(/-reviews$/, '');;
    // const slug = params['company-slug-review'].replace(/-review$/, '');

  console.log("Company page ",companySlug)
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [company, setCompany] = useState<any>(null);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companySlug) {
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        const companyData = await companyApi.getCompanyBySlug(companySlug);        
        setCompany(companyData);
      } catch (error) {
        console.error('Error fetching company:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companySlug, router]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!companySlug) return;

      try {
        setReviewsLoading(true);
        const filterRatingNum =
          filterRating === 'all' ? undefined : parseInt(filterRating);
        const reviewsData = await reviewsApi.getCompanyReviewsBySlug(
          companySlug,
          sortBy,
          filterRatingNum
        );
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [companySlug, sortBy, filterRating]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading company information...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Company not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Building className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name} Employees Reviews, Feedback, Testimonials</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                {company.industry && (
                  <span className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{company.industry}</span>
                  </span>
                )}
                {company.headquarters && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.headquarters}</span>
                  </span>
                )}
                {company.employee_count && (
                  <span className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{company.employee_count} employees</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <StarRating rating={company.ratings.overall} size="lg" />
                  <span className="text-2xl font-bold text-gray-900">{company.ratings.overall}</span>
                </div>
                <span className="text-gray-600">{company.reviewCount} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Description */}
      {company.description && (
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About {company.name}</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {company.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Company Overall Review */}
      {company.overall_review && (
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Overall Employee Experience</h2>
                <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-em:text-gray-600 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6 first:mt-0">{children}</h3>,
                      h2: ({ children }) => <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-5 first:mt-0">{children}</h4>,
                      h3: ({ children }) => <h5 className="text-base font-semibold text-gray-900 mb-2 mt-4 first:mt-0">{children}</h5>,
                      p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-indigo-200 pl-4 py-2 bg-indigo-50 rounded-r-lg mb-4">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {company.overall_review}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ratings Breakdown */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Ratings</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{company.ratings.workLife}</div>
              <StarRating rating={company.ratings.workLife} size="sm" />
              <div className="text-sm text-gray-600 mt-1">Work Life Balance</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{company.ratings.salary}</div>
              <StarRating rating={company.ratings.salary} size="sm" />
              <div className="text-sm text-gray-600 mt-1">Salary</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{company.ratings.culture}</div>
              <StarRating rating={company.ratings.culture} size="sm" />
              <div className="text-sm text-gray-600 mt-1">Culture</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{company.ratings.skillDevelopment}</div>
              <StarRating rating={company.ratings.skillDevelopment} size="sm" />
              <div className="text-sm text-gray-600 mt-1">Career Growth</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{company.ratings.jobSecurity}</div>
              <StarRating rating={company.ratings.jobSecurity} size="sm" />
              <div className="text-sm text-gray-600 mt-1">Job Security</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Employee Reviews ({reviews.length})
              </h2>
              <p className="text-gray-600">
                Read what employees have to say about working at {company.name}
              </p>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading reviews...</div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-gray-500 mb-4">No reviews found for this company yet.</div>
                <a
                  href="/review"
                  className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Write the first review
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <StarRating rating={review.overall_rating} size="sm" />
                          <span className="font-semibold text-gray-900">{review.overall_rating}.0</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {review.designation || 'Employee'} Review
                        </h3>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{new Date(review.created_at).toLocaleDateString()}</div>
                        <div>{review.department || 'General'} • {review.employment_type}</div>
                        <div>{review.work_policy}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {review.likes && (
                        <div>
                          <h4 className="font-medium text-green-700 mb-2 flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Pros</span>
                          </h4>
                          <p className="text-gray-700 leading-relaxed pl-3">{review.likes}</p>
                        </div>
                      )}
                      {review.dislikes && (
                        <div>
                          <h4 className="font-medium text-red-700 mb-2 flex items-center space-x-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span>Cons</span>
                          </h4>
                          <p className="text-gray-700 leading-relaxed pl-3">{review.dislikes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <button className="text-sm text-gray-600 hover:text-primary transition-colors">
                        Helpful
                      </button>
                      <button className="text-sm text-gray-600 hover:text-primary transition-colors">
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
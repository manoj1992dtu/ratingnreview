'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Company, CompanyReview, CompanyWithMeta, ReviewFilters } from '@/types/company';
import { reviewsApi } from '@/services/api';
import ReviewFiltersComponent from './ReviewFilters';
import ReviewsList from './ReviewsList';

interface InteractiveReviewsSectionProps {
  company: CompanyWithMeta;
  initialReviews: CompanyReview[];
  initialFilters: ReviewFilters;
}

const InteractiveReviewsSection: React.FC<InteractiveReviewsSectionProps> = ({
  company,
  initialReviews,
  initialFilters
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters);
  const [reviews, setReviews] = useState<CompanyReview[]>(initialReviews);
  const [loading, setLoading] = useState(false);

  // Update URL when filters change
  const updateFilters = (newFilters: ReviewFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', newFilters.sortBy);
    params.set('filterRating', newFilters.filterRating);
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Fetch new reviews when filters change
  useEffect(() => {
    const fetchFilteredReviews = async () => {
      // Skip if these are the initial filters (already have data)
      if (filters.sortBy === initialFilters.sortBy && 
          filters.filterRating === initialFilters.filterRating) {
        return;
      }

      try {
        setLoading(true);
        const filterRatingNum = filters.filterRating === 'all' ? undefined : parseInt(filters.filterRating);
        const reviewsData = await reviewsApi.getCompanyReviewsBySlug(
          company.slug,
          filters.sortBy,
          filterRatingNum
        );
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching filtered reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredReviews();
  }, [filters, company.slug, initialFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ReviewFiltersComponent 
            filters={filters} 
            onFiltersChange={updateFilters}
            reviewCount={reviews.length}
          />
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Employee Reviews ({company.reviewCount})
            </h2>
            <p className="text-lg text-gray-600">
              Read authentic experiences from current and former employees at {company.name}
            </p>
          </div>

          <ReviewsList 
            reviews={reviews} 
            companyName={company.name}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractiveReviewsSection;
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
import type { CompanyReview,Company } from '../lib/supabase';
import type { ReviewFilters} from '@/types/company';
import InteractiveReviewsSection from './employers/InteractiveReviewsSection';
import CompanyDescription from './employers/CompanyDescription';
import CompanyOverallReview from './employers/CompanyOverallReview';
import RatingsBreakdown from './employers/RatingsBreakdown';
import CompanyHeader from './employers/CompanyHeader';
import { CompanyWithMeta } from '@/types/company';
// import CompanyJsonLd from './employers/CompanyJsonLd';


interface CompanyPageProps {
  company: CompanyWithMeta;
  initialReviews: CompanyReview[];
  initialFilters: ReviewFilters;
}
const CompanyPage: React.FC<CompanyPageProps> = ({
  company, 
  initialReviews, 
  initialFilters 
}) => {

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Company not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

       {/* JSON-LD Structured Data */}
      {/* <CompanyJsonLd company={company} reviews={initialReviews} /> */}

      {/* Company Header */}
     <CompanyHeader company={company} />

      {/* Company Description */}
      {company.description && (
        <CompanyDescription name={company.name} description={company.description} />
      )}

      {/* Company Overall Review */}
       {company.overall_review && (
        <CompanyOverallReview name={company.name} overallReview={company.overall_review} />
      )}


      {/* Ratings Breakdown */}
      <RatingsBreakdown ratings={company.ratings} />

        {/* Interactive reviews section with client-side filtering */}
      <InteractiveReviewsSection 
        company={company}
        initialReviews={initialReviews}
        initialFilters={initialFilters}
      />     
    </div>
  );
};

export default CompanyPage;
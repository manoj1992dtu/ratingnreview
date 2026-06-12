'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Star,
  Filter,
  ChevronDown,
  ChevronRight,
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
  industry?: any;
  relatedCompanies?: any[];
}
const CompanyPage: React.FC<CompanyPageProps> = ({
  company, 
  initialReviews, 
  initialFilters,
  industry,
  relatedCompanies
}) => {
  const [showAllCompanies, setShowAllCompanies] = useState(false);

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

      {/* Related Companies Section - Tag Cloud Cross-linking Strategy */}
      {relatedCompanies && relatedCompanies.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
            Other Companies in {industry?.name || 'this industry'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {relatedCompanies.map((rel, index) => {
              const isHidden = index >= 12 && !showAllCompanies;
              return (
                <a 
                  key={rel.id} 
                  href={`/company/${rel.slug}-reviews`}
                  className={`bg-white p-2.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all duration-300 items-center justify-between group ${
                    isHidden ? 'hidden' : 'flex'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {rel.logo_url ? (
                      <img src={rel.logo_url} alt={rel.name} className="w-7 h-7 rounded-md object-contain bg-gray-50 p-0.5 border border-gray-100 shrink-0" />
                    ) : (
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                        {rel.name[0]}
                      </div>
                    )}
                    <span className="font-semibold text-xs text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                      {rel.name}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </a>
              );
            })}
          </div>
          {relatedCompanies.length > 12 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAllCompanies(!showAllCompanies)}
                className="cursor-pointer inline-flex items-center space-x-1.5 px-4 py-2 border border-gray-300 rounded-full text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm"
              >
                <span>{showAllCompanies ? 'Show Less' : `View More Companies (+${relatedCompanies.length - 12})`}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showAllCompanies ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
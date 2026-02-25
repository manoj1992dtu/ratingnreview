'use client';

import React from 'react';
import { Building, MapPin, Users, Globe } from 'lucide-react';
import { Company, CompanyWithMeta } from '@/types/company';
import StarRating from '@/components/StarRating';

interface CompanyHeaderProps {
  company: CompanyWithMeta;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-indigo-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Company Logo/Icon */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-primary rounded-2xl flex items-center justify-center shadow-lg">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="w-16 h-16 object-contain rounded-xl"
                />
              ) : (
                <Building className="h-12 w-12 text-white" />
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {company.name}
              <span className="block text-2xl lg:text-3xl font-semibold text-primary mt-2">
                Employee Reviews & Testimonials
              </span>
            </h1>
            
            {/* Company Details */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              {company.industry && (
                <span className="flex items-center space-x-2 bg-white/70 px-3 py-1 rounded-full">
                  <Building className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">{company.industry}</span>
                </span>
              )}
              {company.headquarters && (
                <span className="flex items-center space-x-2 bg-white/70 px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{company.headquarters}</span>
                </span>
              )}
              {company.employee_count && (
                <span className="flex items-center space-x-2 bg-white/70 px-3 py-1 rounded-full">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{company.employee_count} employees</span>
                </span>
              )}
              {company.website && (
                <a 
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-white/70 px-3 py-1 rounded-full hover:bg-white transition-colors"
                >
                  <Globe className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-primary hover:text-primary-hover">Website</span>
                </a>
              )}
            </div>

            {/* Rating Display */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center space-x-3">
                <StarRating rating={company.ratings.overall} size="lg" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">{company.ratings.overall}</span>
                  <span className="text-sm text-gray-600">out of 5</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{company.reviewCount}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyHeader;
'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { Building, MapPin, Users, Globe } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { CompanyWithMeta } from '@/types/company';

interface CompanyHeaderProps {
  company: CompanyWithMeta;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  const [logoSrc, setLogoSrc] = useState(
    company.logo_url || `/logo/${company.slug}.png`
  );
  const [logoError, setLogoError] = useState(false);


  return (
    <section className="bg-slate-50/50 pt-12 pb-10 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
          <div className="w-24 h-24 bg-white shadow-xl shadow-indigo-500/5 ring-1 ring-slate-200 rounded-3xl flex items-center justify-center overflow-hidden">
            {logoError ? (
              <Building className="h-10 w-10 text-slate-300" />
            ) : (
              <Image
                src={logoSrc}
                alt={`${company.name} Logo`}
                width={96}
                height={96}
                className="object-contain p-2"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <div className="flex-1">
            <h1 className="company-name text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
              Inside {company.name}: <span className="text-primary">Employee Perspective</span>
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-slate-500 mb-6 font-medium">
              {company.industry && (
                <span className="flex items-center gap-1.5">
                  <Building className="h-4 w-4" />
                  {company.industry}
                </span>
              )}
              {company.headquarters && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {company.headquarters}
                </span>
              )}
              {company.employee_count && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {company.employee_count}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm ring-1 ring-slate-100">
                <StarRating rating={company.ratings.overall} size="md" />
                <span className="text-2xl font-black text-slate-900">{company.ratings.overall}</span>
              </div>
              <div className="h-1.5 w-1.5 bg-slate-300 rounded-full hidden sm:block"></div>
              <span className="text-slate-600 font-bold bg-slate-100/50 px-4 py-1.5 rounded-full">{company.reviewCount} Community Ratings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyHeader;
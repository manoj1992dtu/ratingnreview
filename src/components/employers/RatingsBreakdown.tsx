'use client';

import React from 'react';
import { Company, CompanyWithMeta } from '@/types/company';
import StarRating from '@/components/StarRating';
import { TrendingUp, DollarSign, Users, BookOpen, Shield } from 'lucide-react';

interface RatingsBreakdownProps {
  ratings: CompanyWithMeta['ratings'];
}

const RatingsBreakdown: React.FC<RatingsBreakdownProps> = ({ ratings }) => {
  const ratingCategories = [
    {
      key: 'workLife',
      label: 'Work Life Balance',
      value: ratings.workLife,
      icon: TrendingUp,
      color: 'from-indigo-500 to-primary'
    },
    {
      key: 'salary',
      label: 'Pay & Benefits',
      value: ratings.salary,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      key: 'culture',
      label: 'Team Ecosystem',
      value: ratings.culture,
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      key: 'skillDevelopment',
      label: 'Growth Prospects',
      value: ratings.skillDevelopment,
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600'
    },
    {
      key: 'jobSecurity',
      label: 'Job Stability',
      value: ratings.jobSecurity,
      icon: Shield,
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <section className="bg-white py-12 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-widest text-center md:text-left">Metrics & Satisfaction</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {ratingCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.key}
                className="relative group bg-slate-50/50 hover:bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-black text-slate-900 mb-1">{category.value}</div>
                  <StarRating rating={category.value} size="sm" />
                  <div className="h-px w-8 bg-slate-200 my-4"></div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{category.label}</div>
                  <div className={`p-2 rounded-lg bg-white border border-slate-100 shadow-sm text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RatingsBreakdown;
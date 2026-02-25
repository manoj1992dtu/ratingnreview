'use client';

import React from 'react';
import { CompanyWithMeta } from '@/types/company';
import StarRating from '@/components/StarRating';
import { TrendingUp, DollarSign, Users, BookOpen, Shield } from 'lucide-react';

interface RatingsBreakdownProps {
  ratings: CompanyWithMeta['ratings'];
}

const RatingsBreakdown: React.FC<RatingsBreakdownProps> = ({ ratings }) => {
  const ratingCategories = [
    {
      key: 'workLife',
      label: 'Work-Life Balance',
      value: ratings.workLife,
      icon: TrendingUp,
      color: 'from-indigo-500 to-primary'
    },
    {
      key: 'salary',
      label: 'Compensation',
      value: ratings.salary,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      key: 'culture',
      label: 'Company Culture',
      value: ratings.culture,
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      key: 'skillDevelopment',
      label: 'Career Growth',
      value: ratings.skillDevelopment,
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600'
    },
    {
      key: 'jobSecurity',
      label: 'Job Security',
      value: ratings.jobSecurity,
      icon: Shield,
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Detailed Employee Ratings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {ratingCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div 
                key={category.key} 
                className="group bg-gray-50 hover:bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{category.value}</div>
                  <StarRating rating={category.value} size="sm" />
                  <div className="text-sm text-gray-600 mt-3 font-medium leading-tight">{category.label}</div>
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
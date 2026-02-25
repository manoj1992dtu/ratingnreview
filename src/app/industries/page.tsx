import React from 'react';
import { getGroupedIndustries, getIndustryStats } from '@/services/industries';
import AllIndustriesClient from '@/components/categories/AllIndustriesClient';


import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Companies by Industry | Employee Reviews',
  description: 'Explore authentic employee reviews across all industries. Compare companies, salaries, and workplace cultures to make informed career decisions.',
  keywords: 'industry reviews, company reviews by industry, tech companies, finance companies, healthcare companies, employee reviews',
};

export default async function AllIndustriesServer() {
  // Fetch data in parallel
  const [groupedIndustries, stats] = await Promise.all([
    getGroupedIndustries({primaryLimit:7}),
    getIndustryStats(),
  ]);
  // console.log("groupedIndustries",groupedIndustries[0].industries[0])

  // If no industries found, show error state
  if (!groupedIndustries || groupedIndustries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Industries Found</h2>
          <p className="text-gray-600">Unable to load industry data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <AllIndustriesClient 
      industries={groupedIndustries}
      stats={stats}
    />
  );
}
import React from 'react';
import { CompanyReview } from '@/types/company';
import StaticReviewCard from './StaticReviewCard';
import { MessageSquare, PenTool } from 'lucide-react';

interface ServerReviewsListProps {
  reviews: CompanyReview[];
  companyName: string;
}

const ServerReviewsList: React.FC<ServerReviewsListProps> = ({ reviews, companyName }) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">No reviews yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Be the first to share your experience working at {companyName}. 
          Your review will help other job seekers make informed decisions.
        </p>
        <a
          href="/review"
          className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors font-medium space-x-2 shadow-lg hover:shadow-xl"
        >
          <PenTool className="h-5 w-5" />
          <span>Write the first review</span>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <StaticReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ServerReviewsList;
'use client';

import React, { useState } from 'react';
import { CompanyReview } from '@/types/company';
import StarRating from '@/components/StarRating';
import { ThumbsUp, Flag, Calendar, Briefcase } from 'lucide-react';

interface ReviewCardProps {
  review: CompanyReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [isHelpful, setIsHelpful] = useState(false);

  const handleHelpfulClick = () => {
    setIsHelpful(!isHelpful);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 hover:border-gray-300 group">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className={`flex items-center space-x-3 mb-3 review-${review.id}-rating`}>
            
            <StarRating rating={review.overall_rating} size="sm" />
            <span className="font-bold text-xl text-gray-900">{review.overall_rating}.0</span>
            <div className="h-4 w-px bg-gray-300"></div>
            {/* <span className="text-sm text-primary font-medium bg-indigo-50 px-3 py-1 rounded-full">
              Verified Employee
            </span> */}
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            {review.designation || 'Anonymous Employee'} Review
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
              <Briefcase className="h-3 w-3" />
              <span>{review.department || 'General'}</span>
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">{review.employment_type}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">{review.work_policy}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(review.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Review Content */}
      <div className={`space-y-6 review-${review.id}-content`}>
        {review.likes && (
          <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-400">
            <h4 className="font-bold text-green-800 mb-3 flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>What I liked</span>
            </h4>
            <p className="text-gray-800 leading-relaxed text-lg">{review.likes}</p>
          </div>
        )}
        
        {review.dislikes && (
          <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400">
            <h4 className="font-bold text-red-800 mb-3 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Areas for improvement</span>
            </h4>
            <p className="text-gray-800 leading-relaxed text-lg">{review.dislikes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleHelpfulClick}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isHelpful 
              ? 'bg-indigo-100 text-primary-hover border border-indigo-200' 
              : 'text-gray-600 hover:text-primary hover:bg-indigo-50'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${isHelpful ? 'fill-current' : ''}`} />
          <span className="font-medium">
            {/* Helpful {review.helpful_count ? `(${review.helpful_count})` : ''} */}
            Helpful
          </span>
        </button>
        
        <button className="flex items-center space-x-2 text-gray-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all">
          <Flag className="h-4 w-4" />
          <span className="font-medium">Report</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
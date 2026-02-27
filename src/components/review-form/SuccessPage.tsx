import React from 'react';
import { CheckCircle, Share2, Users } from 'lucide-react';
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RatingNReviews - Anonymous Company Reviews',
        text: 'Check out RatingNReviews for honest company reviews and workplace insights!',
        url: window.location.origin,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl text-center">
      {/* Success Icon */}
      <div className="mb-6 h-24 w-24 bg-green-50 rounded-full flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
        Review Submitted Successfully
      </h1>
      <p className="text-gray-500 mb-10 text-lg max-w-md">
        Your anonymous review has been submitted and will help thousands of others make better career decisions.
      </p>

      {/* Share Section */}
      <div className="w-full max-w-sm bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-6 mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <Share2 className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">
          Help the Community Grow
        </h2>
        <p className="text-sm text-gray-600 mb-6 font-medium">
          A transparent job market helps everyone. Refer a friend to share their experience.
        </p>
        <button
          onClick={handleShare}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 px-4 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share RatingNReviews</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
        <Link href="/" className="w-full">
          <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-all font-medium">
            Explore Companies
          </button>
        </Link>
        <Link href="/review" className="w-full">
          <button className="w-full bg-white text-gray-700 border border-gray-200 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all font-medium">
            Write Another
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;

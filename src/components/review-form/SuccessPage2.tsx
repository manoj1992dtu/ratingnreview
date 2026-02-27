import React from 'react';
import { CheckCircle, Share2, Users } from 'lucide-react';
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RatingNReview - Anonymous Company Reviews',
        text: 'Check out RatingNReview for honest company reviews and workplace insights!',
        url: window.location.origin,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-10 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="h-20 w-20 text-indigo-500 mx-auto" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Insights Received.
          </h1>
          <p className="text-slate-500 mb-10 font-medium">
            Your professional perspective is now live. You've helped fellow experts navigate their career path with clarity.
          </p>

          {/* Share Section */}
          <div className="bg-slate-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full"></div>
            <div className="flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="font-bold text-white mb-3 text-lg">
              Expand the Network
            </h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              Recommend RatingNReview to your colleagues and help build a truly transparent job market.
            </p>
            <button
              onClick={handleShare}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-2xl hover:bg-indigo-500 transition-all font-black flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/40"
            >
              <Share2 className="h-5 w-5" />
              <span>Broadcast Platform</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/review">
              <div className="w-full bg-slate-50 text-slate-900 py-4 px-6 rounded-2xl hover:bg-slate-100 transition-all font-bold text-center border border-slate-200">
                Register New Experience
              </div>
            </Link>
            <Link href="/">
              <div className="w-full text-indigo-600 py-4 px-6 rounded-2xl hover:bg-indigo-50 transition-all font-bold text-center">
                Return to Hub
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

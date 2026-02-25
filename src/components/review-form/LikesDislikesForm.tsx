import React from 'react';
import { ReviewData } from '../ReviewFormPage';

interface LikesDislikesFormProps {
  data: ReviewData;
  onUpdate: (data: Partial<ReviewData>) => void;
  onNext: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const LikesDislikesForm: React.FC<LikesDislikesFormProps> = ({
  data,
  onUpdate,
  onNext,
  onSkip,
  onSubmit,
  isSubmitting
}) => {

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Likes & Dislikes
      </h2>
      <p className="text-gray-600 mb-6">
        Share what you liked and what could be improved about the company.
      </p>

      <div className="space-y-6">
        {/* Likes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What did you like about working here?
          </label>
          <textarea
            value={data.likes || ''}
            onChange={(e) => onUpdate({ likes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={4}
            placeholder="Share what you enjoyed about the company culture, work environment, benefits, etc."
          />
        </div>

        {/* Dislikes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What could be improved?
          </label>
          <textarea
            value={data.dislikes || ''}
            onChange={(e) => onUpdate({ dislikes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={4}
            placeholder="Share areas where the company could improve - management, processes, work-life balance, etc."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
        </button>
        {/* <button
          onClick={onNext}
          className="sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
        >
          Add Interview Details
        </button> */}
        <button
          onClick={onSkip}
          className="sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default LikesDislikesForm;
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ReviewData } from '@/components/ReviewFormPage';
import StarRating from '../StarRating';

interface InterviewFormProps {
  data: ReviewData;
  onUpdate: (data: Partial<ReviewData>) => void;
  onSubmit: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

const InterviewForm: React.FC<InterviewFormProps> = ({
  data,
  onUpdate,
  onSubmit,
  onSkip,
  isSubmitting
}) => {
  const [questions, setQuestions] = useState<string[]>(
    data.interviewQuestions || ['', '']
  );

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
    onUpdate({ interviewQuestions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestions = [...questions, ''];
    setQuestions(newQuestions);
    onUpdate({ interviewQuestions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 2) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      onUpdate({ interviewQuestions: newQuestions });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Interview Experience & Details
      </h2>
      <p className="text-gray-600 mb-6">
        Share your interview questions & help people get their dream job!
      </p>

      <div className="space-y-6">
        {/* Interview Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate overall interview experience
          </label>
          <StarRating
            rating={data.interviewRating || 0}
            interactive
            onRatingChange={(rating) => onUpdate({ interviewRating: rating })}
            size="lg"
          />
        </div>

        {/* Interview Questions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Add Interview Questions (At least 2 required)
          </label>
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={2}
                    placeholder={`Interview question ${index + 1}...`}
                  />
                </div>
                {questions.length > 2 && (
                  <button
                    onClick={() => removeQuestion(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="mt-3 flex items-center space-x-2 text-primary hover:text-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add another question</span>
          </button>
        </div>

        {/* Additional Interview Details */}
        <div className="space-y-6 mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
          
          {/* Interview Timing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              When was the interview?
            </label>
            <div className="space-y-2">
              {[
                'Less than a month',
                '1-6 months',
                '6-12 months',
                'More than a year'
              ].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    checked={data.interviewTiming === option}
                    onChange={() => onUpdate({ interviewTiming: option })}
                    className="mr-3 text-primary"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Process Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Interview process duration?
            </label>
            <div className="space-y-2">
              {[
                'Less than 2 weeks',
                '2-4 weeks',
                '4-6 weeks',
                '6-8 weeks',
                'More than 8 weeks'
              ].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    checked={data.processDuration === option}
                    onChange={() => onUpdate({ processDuration: option })}
                    className="mr-3 text-primary"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interview Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Interview difficulty
            </label>
            <div className="space-y-2">
              {['Easy', 'Moderate', 'Hard'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    checked={data.difficulty === option}
                    onChange={() => onUpdate({ difficulty: option })}
                    className="mr-3 text-primary"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Offer Received */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Did you get an offer?
            </label>
            <div className="space-y-2">
              {[
                'Yes, I joined',
                'Yes, but declined',
                'No',
                'No response'
              ].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    checked={data.offerReceived === option}
                    onChange={() => onUpdate({ offerReceived: option })}
                    className="mr-3 text-primary"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Advice for job seekers (Optional)
            </label>
            <textarea
              value={data.advice || ''}
              onChange={(e) => onUpdate({ advice: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={4}
              placeholder="Share any tips or advice for future candidates..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
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

export default InterviewForm;
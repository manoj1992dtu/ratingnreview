'use client';
import { Suspense } from 'react';
import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import CompanyReviewForm from './review-form/CompanyReviewForm';
import LikesDislikesForm from './review-form/LikesDislikesForm';
import InterviewForm from './review-form/InterviewForm';
import SuccessPage from './review-form/SuccessPage';
import AuthModal from './AuthModal';
import { reviewsApi, interviewApi } from '../services/api';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/stores/useAuthModal';
import { DebugInfo } from './DebugInfo';

export interface ReviewData {
  // Step 1: Company Review
  companyName: string;
  overallRating: number;
  workLifeBalance: number;
  salary: number;
  promotions: number;
  jobSecurity: number;
  skillDevelopment: number;
  workSatisfaction: number;
  companyCulture: number;
  gender?: string;
  workPolicy: string;
  officeLocation?: string;
  currentlyWorking: boolean;
  startDate?: { month: string; year: string };
  endDate?: { month: string; year: string };
  designation?: string;
  employmentType: string;
  department?: string;
  // Step 2: Likes/Dislikes
  likes?: string;
  dislikes?: string;
  // Step 3: Interview
  interviewRating?: number;
  interviewQuestions?: string[];
  interviewTiming?: string;
  processDuration?: string;
  difficulty?: string;
  offerReceived?: string;
  advice?: string;
}

const ReviewFormContent: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<'company' | 'likes' | 'interview' | 'success'>('company');
  const [reviewData, setReviewData] = useState<ReviewData>({
    companyName: '',
    // overallRating: 1,
    // workLifeBalance: 1,
    // salary: 1,
    // promotions: 1,
    // jobSecurity: 1,
    // skillDevelopment: 1,
    // workSatisfaction: 1,
    // companyCulture: 1,
    overallRating: 0,
    workLifeBalance: 0,
    salary: 0,
    promotions: 0,
    jobSecurity: 0,
    skillDevelopment: 0,
    workSatisfaction: 0,
    companyCulture: 0,
    // workPolicy: 'Permanent WFH',
    workPolicy: 'Office',
    currentlyWorking: true,
    employmentType: 'Full Time',
    gender: 'Male'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { isOpen: showAuthModal, openModal, closeModal, pendingCallback } = useAuthModal();

  // Check URL parameters for steps and pending review
  useEffect(() => {
    if (loading) return;

    // Check for step in URL
    const stepParam = searchParams.get('step');
    if (stepParam) {
      if (stepParam === 'likes') setCurrentForm('likes');
      if (stepParam === 'interview') setCurrentForm('interview');
      if (stepParam === 'success') setCurrentForm('success');
    }

    // Check if we should load pending review data after authentication
    const loadPending = searchParams.get('loadPending') === 'true';

    if (loadPending && user) {
      const pendingReviewJson = localStorage.getItem('pendingReview');

      if (pendingReviewJson) {
        try {
          const pendingReview = JSON.parse(pendingReviewJson);
          setReviewData(prev => ({ ...prev, ...pendingReview }));

          // Clean up pending data
          localStorage.removeItem('pendingReview');

          // Update URL to remove the loadPending parameter
          // const url = new URL(window.location.href);
          // url.searchParams.delete('loadPending');
          // router.replace(url.pathname + url.search);
          if (!stepParam) {
            setCurrentForm('likes');

            // Update URL to reflect current form
            const url = new URL(window.location.href);
            url.searchParams.set('step', 'likes');
            router.replace(url.toString());
          }
        } catch (error) {
          console.error('Error processing pending review:', error);
        }
      }
    }
  }, [loading, user, searchParams, router]);

  const updateReviewData = (data: Partial<ReviewData>) => {
    setReviewData(prev => ({ ...prev, ...data }));
  };

  const handleCompanyReviewNext = () => {
    // Store review data in localStorage
    // localStorage.setItem('pendingReview', JSON.stringify(reviewData));



    // Check if user is authenticated
    if (!user) {
      // Open auth modal - after auth, the callback page will redirect back
      console.log("Saved review data before authentication:", reviewData);
      localStorage.setItem('pendingReview', JSON.stringify(reviewData));
      // Save redirect path explicitly
      localStorage.setItem('redirectAfterLogin', '/review?step=likes');
      openModal();
    } else {
      // User is already authenticated, proceed to likes form
      setCurrentForm('likes');

      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('step', 'likes');
      router.replace(url.toString());
    }
  };

  const handleCompanyReviewSubmit = async () => {
    // Store review data in case authentication is needed
    localStorage.setItem('pendingReview', JSON.stringify(reviewData));

    // Check if user is authenticated
    if (!user) {
      // Open auth modal with a callback
      openModal(() => {
        // After authentication, submit the review and go to success
        handleSubmit();
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await reviewsApi.submitReview(reviewData);
      // setCurrentForm('success');
      setCurrentForm('likes');

      // Update URL
      const url = new URL(window.location.href);
      // url.searchParams.set('step', 'success');
      // router.replace(url.toString());
      url.searchParams.set('step', 'likes');
      router.replace(url.toString());
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikesNext = () => {
    setCurrentForm('interview');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'interview');
    router.replace(url.toString());
  };

  const handleLikesSubmit = async () => {
    setIsSubmitting(true);
    try {
      await reviewsApi.submitReview(reviewData);
      // setCurrentForm('success');

      // // Update URL
      // const url = new URL(window.location.href);
      // url.searchParams.set('step', 'success');
      // router.replace(url.toString());
      handleLikesNext()
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLikes = () => {
    setCurrentForm('likes');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'likes');
    router.replace(url.toString());
  };

  const handleBackToCompany = () => {
    setCurrentForm('company');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.delete('step');
    router.replace(url.toString());
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit review first
      await reviewsApi.submitReview(reviewData);

      // Submit interview experience if provided
      if (reviewData.interviewRating || reviewData.interviewQuestions?.length) {
        await interviewApi.submitInterview({
          companyName: reviewData.companyName,
          interviewRating: reviewData.interviewRating,
          interviewQuestions: reviewData.interviewQuestions,
          interviewTiming: reviewData.interviewTiming,
          processDuration: reviewData.processDuration,
          difficulty: reviewData.difficulty,
          offerReceived: reviewData.offerReceived,
          advice: reviewData.advice
        });
      }

      setCurrentForm('success');

      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('step', 'success');
      router.replace(url.toString());
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipToInterview = () => {
    setCurrentForm('interview');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'interview');
    router.replace(url.toString());
  };

  const handleSkipToSuccess = () => {
    setCurrentForm('success');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'success');
    router.replace(url.toString());
  };

  const renderCurrentForm = () => {
    switch (currentForm) {
      case 'company':
        return (
          <CompanyReviewForm
            data={reviewData}
            onUpdate={updateReviewData}
            onNext={handleCompanyReviewNext}
            onSubmit={handleCompanyReviewSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'likes':
        return (
          <LikesDislikesForm
            data={reviewData}
            onUpdate={updateReviewData}
            onNext={handleLikesNext}
            onSkip={handleSkipToInterview}
            // onSubmit={handleSubmit}
            onSubmit={handleLikesSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'interview':
        return (
          <InterviewForm
            data={reviewData}
            onUpdate={updateReviewData}
            onSubmit={handleSubmit}
            onSkip={handleSkipToSuccess}
            isSubmitting={isSubmitting}
          />
        );
      case 'success':
        return <SuccessPage />;
      default:
        return null;
    }
  };

  if (currentForm === 'success') {
    return <SuccessPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Contribute Your <span className="text-primary">Perspective</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Empower the community with authentic workplace metrics and honest feedback.
          </p>
        </div>
        {/* Form Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {renderCurrentForm()}
        </div>
        {/* Navigation */}
        {(currentForm === 'likes' || currentForm === 'interview') && (
          <div className="flex justify-between mt-6">
            <button
              onClick={currentForm === 'likes' ? handleBackToCompany : handleBackToLikes}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {/* {showAuthModal && (
        <AuthModal
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            // The callback stored in openModal will be triggered by the auth callback page
          }}
        />
      )} */}
      <DebugInfo />
    </div>
  );
};



// Main component with Suspense
const ReviewFormPage = () => {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <ReviewFormContent />
    </Suspense>
  );
};

export default ReviewFormPage;

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/stores/useAuthModal';

const AuthCallbackPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { triggerCallback } = useAuthModal();
  const [redirected, setRedirected] = useState(false);
  
  useEffect(() => {
    const handleRedirect = () => {
      // Prevent multiple redirects
      if (redirected) return;
      setRedirected(true);
      
      console.log("Auth callback triggered, user:", user ? "authenticated" : "not authenticated");
      
      if (!user) {
        console.log("No authenticated user, redirecting to home");
        router.push('/');
        return;
      }
      
      // User is authenticated, trigger any pending callback
      triggerCallback();
      
      // Check for pending review data - this is our signal to go to the review form
      const hasPendingReview = localStorage.getItem('pendingReview') !== null;
      
      if (hasPendingReview) {
        console.log("Found pending review, redirecting to review page with likes step");
        // Redirect to the review page with the likes step
        router.push('/review?step=likes');
      } else {
        console.log("No pending review, redirecting to home");
        router.push('/');
      }
    };
    
    // Wait until we know the authentication state
    if (!loading) {
      handleRedirect();
    }
  }, [loading, user, router, triggerCallback, redirected]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Completing Sign In</h2>
        <p className="text-gray-600 text-center mb-6">
          Please wait while we redirect you...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
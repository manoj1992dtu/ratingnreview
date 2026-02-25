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
    // If there's a code or hash fragment (implicit token), Supabase is currently processing it.
    // getSession() might return quickly with no user before the processing completes.
    // So we wait until the user object is actually hydrated, or a timeout occurs.
    const hasAuthParams = typeof window !== 'undefined' &&
      (window.location.search.includes('code=') || window.location.hash.includes('access_token=') || window.location.hash.includes('error='));

    const handleRedirect = () => {
      if (redirected) return;

      if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
        console.error("Auth error:", window.location.hash);
        setRedirected(true);
        router.push('/');
        return;
      }

      // If we expect params to be processed, wait for user. If not loaded after 3 seconds, abort.
      if (hasAuthParams && !user) {
        // Still processing... wait for user to be populated via listener
        return;
      }

      setRedirected(true);
      console.log("Auth callback triggered, user:", user ? "authenticated" : "not authenticated");

      if (!user) {
        console.log("No authenticated user, redirecting to home");
        router.push('/');
        return;
      }

      // User is authenticated, trigger any pending callback
      triggerCallback();

      // Check for pending review data
      const hasPendingReview = typeof window !== 'undefined' && localStorage.getItem('pendingReview') !== null;

      if (hasPendingReview) {
        console.log("Found pending review, redirecting to review page with likes step");
        router.push('/review?step=likes');
      } else {
        console.log("No pending review, redirecting to home");
        router.push('/');
      }
    };

    // Safety timeout in case we get stuck processing
    const timeout = setTimeout(() => {
      if (!redirected && !user) {
        console.log("Auth callback timeout reached, redirecting to home");
        setRedirected(true);
        router.push('/');
      }
    }, 5000);

    if (!loading) {
      handleRedirect();
    }

    return () => clearTimeout(timeout);
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
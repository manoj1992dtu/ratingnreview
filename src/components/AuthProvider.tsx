'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/stores/useAuthModal';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

export default function AuthProvider({ 
  children 
}: { 
  children: ReactNode 
}) {
  const { isOpen, closeModal, triggerCallback } = useAuthModal();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prevAuthState, setPrevAuthState] = useState<boolean | null>(null);
  
  // Monitor for auth state changes
  useEffect(() => {
    // Skip initial render and loading states
    if (loading || prevAuthState === null) {
      setPrevAuthState(!!user);
      return;
    }
    
    const wasAuthenticated = prevAuthState;
    const isAuthenticated = !!user;
    setPrevAuthState(isAuthenticated);
    
    // If user just became authenticated
    if (!wasAuthenticated && isAuthenticated) {
      console.log("Authentication state changed: User logged in");
      
      // Check for pending review
      const pendingReviewJson = localStorage.getItem('pendingReview');
      
      if (pendingReviewJson) {
        console.log("Found pending review after login, redirecting to review page");
        
        // Trigger any pending callback first
        triggerCallback();
        
        // Redirect to the review page with the likes step
        // router.push('/review?step=likes');
          // ✅ Only redirect if we explicitly set a target during review submission
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath) {
            router.push(redirectPath);
            localStorage.removeItem('redirectAfterLogin');
          }
      }
    }
    // If user just logged out
    else if (wasAuthenticated && !isAuthenticated) {
      console.log("Authentication state changed: User logged out");
    }
  }, [user, loading, router, triggerCallback, prevAuthState]);
  
  // Handle callback from localStorage
  useEffect(() => {
    const shouldTriggerCallback = localStorage.getItem('triggerAuthCallback') === 'true';
    
    if (shouldTriggerCallback) {
      localStorage.removeItem('triggerAuthCallback');
      triggerCallback();
    }
  }, [triggerCallback]);

  return (
    <>
      {children}
      {isOpen && (
        <AuthModal
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            localStorage.setItem('triggerAuthCallback', 'true');
          }}
        />
      )}
    </>
  );
}
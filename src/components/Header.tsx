'use client';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import AuthModal from './AuthModal';
import { useAuthModal } from '@/stores/useAuthModal';


const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  //  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isOpen, closeModal, triggerCallback, openModal } = useAuthModal();

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authApi.signOut(); // Should internally call supabase.auth.signOut()
      router.push('/'); // Redirect to home after sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  const handleAuthSuccess = () => {
    closeModal();
    triggerCallback(); // This runs pending form submission

    // setShowAuthModal(false);
  };


  return (
    <>
      <header className="glass-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="RatingNReview Logo"
                width={180}
                height={36}
                priority
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8" role="navigation">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                Explore
              </Link>

              <div className="flex items-center gap-6 pl-6 border-l border-border">
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-foreground font-medium">
                      {user?.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openModal()}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                  >
                    Sign In
                  </button>
                )}

                <Link
                  href="/review"
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm hover:-translate-y-0.5 duration-200"
                >
                  Write a Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )} */}
      {isOpen && (
        <AuthModal
          onClose={closeModal}
          onSuccess={handleAuthSuccess}
        // title="Sign in to submit and manage your review ✍️"
        />
      )}

    </>
  );
};

export default Header;

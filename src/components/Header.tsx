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
      <header className="glass sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="bg-indigo-600 p-2.5 rounded-2xl group-hover:bg-indigo-500 transition-all duration-500 shadow-lg shadow-indigo-600/20 group-hover:rotate-6">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">RatingNReview</span>
            </Link>

            <div className="hidden md:flex items-center space-x-12" role="navigation">
              <Link
                href="/"
                className="text-slate-500 hover:text-indigo-600 transition-all font-bold text-sm uppercase tracking-widest"
              >
                Explore
              </Link>

              <div className="flex items-center gap-8 pl-8 border-l border-slate-200">
                {isAuthenticated ? (
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Member</span>
                      <span className="text-sm text-slate-900 font-black tracking-tight">
                        {user?.email?.split('@')[0]}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
                    >
                      <User className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openModal()}
                    className="text-slate-900 hover:text-indigo-600 transition-all font-black text-sm uppercase tracking-widest"
                  >
                    Sign In
                  </button>
                )}

                <Link
                  href="/review"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-500 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5 mt-[-2px]"
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

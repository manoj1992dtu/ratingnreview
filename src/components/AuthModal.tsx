import React from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FcGoogle } from 'react-icons/fc'; // For Google icon

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const handleGoogleSignIn = async () => {
    try {
      // Make sure we have a flag to indicate we're coming from review form
      localStorage.setItem('fromReviewForm', 'true');
      
      // Sign in with Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Failed to sign in. Please try again.');
    }
  };
  
 return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Heading */}
        <div className="mb-6 text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Sign in to continue
          </h2>
          <p className="text-gray-600 text-sm">
            {/* Your review is saved. Sign in to add interview details and finish submitting. Your identity will remain anonymous. */}
            Your review will remain completely anonymous
          </p>
        </div>

        {/* Google Sign-in */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm transition"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        {/* Footer trust text */}
        <p className="text-xs text-gray-500 text-center mt-6">
          We only use your account to verify authenticity. We will not share your identity.
        </p>
      </div>
    </div>
  );
  // return (
  //   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //     <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative">
  //       <button
  //         onClick={onClose}
  //         className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
  //       >
  //         <X className="h-6 w-6" />
  //       </button>

  //       <div className="text-center mb-6">
  //         <h2 className="text-2xl font-bold text-gray-900 mb-2">
  //           {/* Sign in to add more details */}
  //           {"Sign in to add likes/dislikes and interview details. Your review will remain completely anonymous."}
  //         </h2>
  //         <p className="text-gray-600">
  //           Your review will remain completely anonymous.
  //           {/* Your company review is saved. Sign in to add likes/dislikes and interview details. Your review will remain completely anonymous. */}
  //           {/* {title??"Your company review is saved. Sign in to add likes/dislikes and interview details. Your review will remain completely anonymous."} */}
  //         </p>
  //       </div>

  //       <div className="space-y-4">
  //         <button
  //           onClick={handleGoogleAuth}
  //           className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors"
  //         >
  //           <Chrome className="h-5 w-5 text-primary" />
  //           <span className="font-medium text-gray-700">Continue with Google</span>
  //         </button>

  //         <button
  //           onClick={handleEmailAuth}
  //           className="w-full flex items-center justify-center space-x-3 bg-primary text-white rounded-lg py-3 px-4 hover:bg-primary-hover transition-colors"
  //         >
  //           <Mail className="h-5 w-5" />
  //           <span className="font-medium">Continue with Email</span>
  //         </button>
  //       </div>

  //       <p className="text-xs text-gray-500 text-center mt-6">
  //         We only use your account to verify authenticity. Your review will remain anonymous.
  //       </p>
  //     </div>
  //   </div>
  // );
};

export default AuthModal;
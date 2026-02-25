'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, loading } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const localStorageItems = Object.keys(localStorage).map(key => {
    let value = localStorage.getItem(key);
    if (value && value.length > 50) {
      value = value.substring(0, 50) + '...';
    }
    return { key, value };
  });
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="bg-indigo-500 text-white px-3 py-1 rounded-md text-xs"
      >
        {isVisible ? 'Hide Debug' : 'Debug'}
      </button>
      
      {isVisible && (
        <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-2 w-80 text-xs">
          <div className="mb-2">
            <strong>Auth:</strong> {loading ? 'loading' : (user ? 'authenticated' : 'not authenticated')}
          </div>
          <div className="mb-2">
            <strong>URL:</strong> {window.location.href}
          </div>
          <div>
            <strong>localStorage:</strong>
            <ul className="mt-1 space-y-1">
              {localStorageItems.map(({ key, value }) => (
                <li key={key}>
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => localStorage.clear()}
              className="bg-red-100 text-red-800 px-2 py-1 rounded-sm text-xs"
            >
              Clear Storage
            </button>
            <button
              onClick={() => {
                localStorage.setItem('pendingReview', JSON.stringify({
                  companyName: 'Test Company',
                  rating: 4,
                  comment: 'Test review'
                }));
              }}
              className="bg-green-100 text-green-800 px-2 py-1 rounded-sm text-xs"
            >
              Set Test Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
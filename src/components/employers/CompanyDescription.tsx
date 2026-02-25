'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface CompanyDescriptionProps {
  name: string;
  description: string;
  maxLength?: number; // optional for truncation
}

const CompanyDescription: React.FC<CompanyDescriptionProps> = ({ name, description,  maxLength = 250 
 }) => {
  const [expanded, setExpanded] = useState(false);

  const isLong = description.length > maxLength;
  const displayedText = expanded ? description : description.slice(0, maxLength);
  return (
     <section className="bg-white border-b border-gray-200">
               <div className="max-w-6xl mx-auto px-4 py-6">
                 <div className="flex items-start space-x-3">
                   <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                     <Info className="h-4 w-4 text-primary" />
                   </div>
                   <div className="flex-1">
                     <h2 className="text-lg font-semibold text-gray-900 mb-3">About {name}</h2>
                     <div className="prose prose-gray max-w-none">
                       <p className="company-description text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {displayedText}
                          {!expanded && isLong && '...'}
                       </p>
                       {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 text-primary font-medium hover:underline"
                >
                  {expanded ? 'Read less' : 'Read more'}
                </button>
              )}
                     </div>
                   </div>
                 </div>
               </div>
             </section>
  );
};

export default CompanyDescription;
'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface CompanyDescriptionProps {
  name: string;
  description: string;
}

const CompanyDescription: React.FC<CompanyDescriptionProps> = ({ name, description }) => {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {name}</h2>
            <div className="prose prose-lg prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyDescription;
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText } from 'lucide-react';

interface CompanyOverallReviewProps {
  overallReview: string;
}

const CompanyOverallReview: React.FC<CompanyOverallReviewProps> = ({ overallReview }) => {
  return (
    <section className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Employee Experience</h2>
            <div className="prose prose-lg prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-800 prose-p:leading-relaxed prose-strong:text-gray-900 prose-em:text-gray-600 prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">{children}</h3>,
                  h2: ({ children }) => <h4 className="text-lg font-bold text-gray-900 mb-3 mt-6 first:mt-0">{children}</h4>,
                  h3: ({ children }) => <h5 className="text-base font-bold text-gray-900 mb-2 mt-5 first:mt-0">{children}</h5>,
                  p: ({ children }) => <p className="text-gray-800 leading-relaxed mb-4 text-lg">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-800 text-lg">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-green-300 pl-6 py-4 bg-green-50/50 rounded-r-xl mb-6">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-6 rounded-xl overflow-x-auto mb-6">
                      {children}
                    </pre>
                  ),
                }}
              >
                {overallReview}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyOverallReview;
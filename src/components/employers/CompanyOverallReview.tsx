"use client";

import React, { useState, useRef, useEffect } from "react";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";


interface CompanyOverallReviewProps {
  overallReview: string;
  name:string;
}

const CompanyOverallReview: React.FC<CompanyOverallReviewProps> = ({
  name,
  overallReview,
}) => {
   const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const MAX_HEIGHT = 500;

  useEffect(() => {
    if (contentRef.current) {
      setShowButton(contentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [overallReview]);

  const handleToggle = () => {
    if (isExpanded && sectionRef.current) {
      // When collapsing, first scroll to the top of the section
      const sectionTop = sectionRef.current.offsetTop;
      window.scrollTo({
        top: sectionTop - 20, // Add some padding
        behavior: 'smooth'
      });

      // Wait for scroll to complete before collapsing
      setTimeout(() => {
        setIsExpanded(false);
      }, 100);
    } else {
      setIsExpanded(true);
    }
  };
    const markdownComponents: Components = {
                  h1: ({ children }) => (
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6 first:mt-0">
                      {children}
                    </h3>
                  ),
                  h2: ({ children }) => (
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-5 first:mt-0">
                      {children}
                    </h4>
                  ),
                  h3: ({ children }) => (
                    <h5 className="text-base font-semibold text-gray-900 mb-2 mt-4 first:mt-0">
                      {children}
                    </h5>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-600">{children}</em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-indigo-200 pl-4 py-2 bg-indigo-50 rounded-r-lg mb-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                };
  return (
    <section ref={sectionRef} className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <FileText className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Detailed {name} employee reviews & experience
            </h2>
            
            {/* Content Container */}
            <div className="relative">
              <div
                ref={contentRef}
                className={`prose prose-gray max-w-none transition-all duration-300 ease-in-out
                  ${!isExpanded ? "max-h-[500px] overflow-hidden" : ""}`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {overallReview}
                </ReactMarkdown>
              </div>

              {/* Gradient Overlay */}
              {!isExpanded && showButton && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Toggle Button */}
            {showButton && (
              <div className="sticky bottom-0 pt-4 bg-white">
                <button
                  onClick={handleToggle}
                  className="w-full py-2 px-4 text-sm font-medium text-primary 
                    hover:text-primary-hover focus:outline-none focus:ring-2 
                    focus:ring-indigo-500 focus:ring-offset-2 rounded-lg 
                    border border-indigo-200 hover:border-indigo-300 
                    transition-colors bg-white"
                  aria-expanded={isExpanded}
                  aria-controls="content-section"
                >
                  <span className="flex items-center justify-center">
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(CompanyOverallReview);
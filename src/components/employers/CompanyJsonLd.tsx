'use client';

import React from 'react';
import { Company, CompanyReview, CompanyWithMeta } from '@/types/company';

interface CompanyJsonLdProps {
  company: CompanyWithMeta;
  reviews: CompanyReview[];
}

const CompanyJsonLd: React.FC<CompanyJsonLdProps> = ({ company, reviews }) => {
  // Generate aggregate rating from reviews
  const aggregateRating = {
    "@type": "AggregateRating",
    "ratingValue": company.ratings.overall,
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": company.reviewCount
  };

  // Generate individual reviews for structured data
  const reviewsStructuredData = reviews.slice(0, 10).map((review) => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      // "name": review.designation || "Anonymous Employee"
      "name": "Anonymous Employee"
      
    },
    "datePublished": review.created_at,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.overall_rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": [review.likes, review.dislikes].filter(Boolean).join(' ')
  }));

  // Main organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.name,
    "url": company.website,
    "logo": company.logo_url,
    "description": company.description,
    "address": company.headquarters ? {
      "@type": "PostalAddress",
      "addressLocality": company.headquarters
    } : undefined,
    "numberOfEmployees": company.employee_count,
    "industry": company.industry,
    "aggregateRating": aggregateRating,
    "review": reviewsStructuredData
  };

  // Employer aggregate rating for job search
  const employerRatingData = {
    "@context": "https://schema.org",
    "@type": "EmployerAggregateRating",
    "ratingValue": company.ratings.overall,
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": company.reviewCount,
    "itemReviewed": {
      "@type": "Organization",
      "name": company.name,
      "sameAs": company.website
    }
  };

  // Local business data (if applicable)
  const localBusinessData = company.headquarters ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": company.name,
    "url": company.website,
    "logo": company.logo_url,
    "description": company.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": company.headquarters
    },
    "aggregateRating": aggregateRating
  } : null;

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData, null, 2)
        }}
      />
      
      {/* Employer Rating Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(employerRatingData, null, 2)
        }}
      />

      {/* Local Business Schema (if location available) */}
      {localBusinessData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessData, null, 2)
          }}
        />
      )}

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Companies",
                "item": "/companies"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": `${company.name} Reviews`,
                "item": `/employers/${company.slug}`
              }
            ]
          }, null, 2)
        }}
      />

      {/* FAQ Schema for common questions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is the overall rating for ${company.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${company.name} has an overall employee rating of ${company.ratings.overall} out of 5 stars based on ${company.reviewCount} employee reviews.`
                }
              },
              {
                "@type": "Question",
                "name": `What do employees say about work-life balance at ${company.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Employees rate work-life balance at ${company.name} as ${company.ratings.workLife} out of 5 stars.`
                }
              },
              {
                "@type": "Question",
                "name": `How is the company culture at ${company.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Company culture at ${company.name} is rated ${company.ratings.culture} out of 5 stars by current and former employees.`
                }
              }
            ]
          }, null, 2)
        }}
      />
    </>
  );
};

export default CompanyJsonLd;
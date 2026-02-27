// src/lib/jsonld.ts
import type { Company } from '@/types/company';
import {CompanyReview} from './supabase'

export function generateCompanyJsonLd(company: Company, reviews?: CompanyReview[]) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `https://ratingnreviews.com/employers/${company.slug}`,
    "name": company.name,
    "url": company.website,
    // "logo": `${company.logo_url || 'https://ratingnreviews.com/logo/'+company.slug+'.png'}`,   

    // Existing properties...
    "aggregateRating": reviews?.length ? {
      "@type": "AggregateRating",
      "@id": `https://ratingnreviews.com/employers/${company.slug}#aggregate-rating`, // ← This was missing!
      "ratingValue": calculateOverallAverageRating(reviews),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,

     // Add speakable property for voice assistants
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        ".company-name",
        ".company-description",
        ".rating-summary",
        ".review-highlights"
      ],
      // Alternative xpath selectors if needed
      "xpath": [
        "/html/head/title",
        "//div[@class='company-description']",
        "//div[@class='rating-summary']",
        "//div[@class='review-highlights']"
      ]
    },
    
    "review": reviews?.map(review => ({
      "@type": "Review",
      // "@id": `https://ratingnreviews.com/employers/${company.slug}-review/categories/${review.id}`,
      "@id": `https://ratingnreviews.com/employers/${company.slug}#review-${review.id}`, // ← This was missing!

      "reviewRating": {
        "@type": "Rating",
        // "@id": `https://ratingnreviews.com/companies/${company.id}/categories/${review.id}#rating`,

        "ratingValue": review.overall_rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": review.is_anonymous ? "Anonymous User" : "Verified Employee"
      },
      "datePublished": review.created_at,
      "reviewBody": review.likes,
      // Make review content speakable as well
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          `.review-${review.id}-content`,
          `.review-${review.id}-rating`
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "RatingNReviews"
      },
      "positiveNotes": review.likes,
      "negativeNotes": review.dislikes,
      "employmentType": review.employment_type,
      "department": review.department
    }))
  };

  return jsonLd;
}

// Simplified function that uses the overall_rating directly
function calculateOverallAverageRating(reviews: CompanyReview[]): number {
  if (!reviews.length) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.overall_rating, 0);
  return Number((sum / reviews.length).toFixed(1));
}

// function calculateAverageRating(reviews: CompanyReview[]): number {
//   if (!reviews.length) return 0;
  
//   const sum = reviews.reduce((acc, review) => {
//     return acc + (
//       review.overall_rating +
//       review.work_life_balance +
//       review.salary +
//       review.promotions +
//       review.job_security +
//       review.skill_development +
//       review.work_satisfaction +
//       review.company_culture
//     ) / 8;  // Average of all rating fields
//   }, 0);
  
//   return Number((sum / reviews.length).toFixed(1));
// }
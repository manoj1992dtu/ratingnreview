
import type { Metadata } from 'next'
import HomePage from '../components/HomePage';
import { companyApi } from '@/services/api';
import { getPrimaryIndustries, getAdditionalIndustries } from '@/services/industries';


// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// Generate metadata for SEO
// Homepage-specific metadata
export const metadata: Metadata = {
  title: 'Find Your Next Great Workplace',
  description: 'RatingNReview provides anonymous employee reviews and ratings for 10,000+ companies. Make informed career decisions with honest insights from real employees across all industries.',
  keywords: [
    'RatingNReview',
    'company reviews',
    'employee reviews',
    'workplace ratings',
    'career advice',
    'job search',
    'company culture reviews',
    'salary information',
    'anonymous employee reviews',
    'glassdoor alternative',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RatingNReview - Find Your Next Great Workplace',
    description: 'Read anonymous employee reviews and ratings for 10,000+ companies.',
    url: '/',
    type: 'website',
    // images: [
    //   {
    //     url: '/og-homepage.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'RatingNReview - Find Your Next Great Workplace',
    //   },
    // ],
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'RatingNReview - Find Your Next Great Workplace',
  //   description: 'Read anonymous employee reviews from 10,000+ companies.',
  //   images: ['/twitter-homepage.png'],
  // },
};
// Generate structured data with brand name
// function generateHomePageSchema() {
//   const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ratingnreview.com';

//   return {
//     '@context': 'https://schema.org',
//     '@graph': [
//       {
//         '@type': 'WebSite',
//         '@id': `${siteUrl}/#website`,
//         url: siteUrl,
//         name: 'RatingNReview',
//         description: 'Anonymous employee reviews and company ratings platform',
//         potentialAction: {
//           '@type': 'SearchAction',
//           target: {
//             '@type': 'EntryPoint',
//             urlTemplate: `${siteUrl}/search?q={search_term_string}`,
//           },
//           'query-input': 'required name=search_term_string',
//         },
//       },
//       {
//         '@type': 'Organization',
//         '@id': `${siteUrl}/#organization`,
//         name: 'RatingNReview',
//         url: siteUrl,
//         logo: {
//           '@type': 'ImageObject',
//           url: `${siteUrl}/logo.png`,
//         },
//         sameAs: [
//           'https://twitter.com/ratingnreview',
//           'https://www.linkedin.com/employers/ratingnreview',
//           // Add your social media links
//         ],
//       },
//       {
//         '@type': 'WebPage',
//         '@id': `${siteUrl}/#webpage`,
//         url: siteUrl,
//         name: 'RatingNReview - Find Your Next Great Workplace',
//         isPartOf: { '@id': `${siteUrl}/#website` },
//         about: { '@id': `${siteUrl}/#organization` },
//         description: 'Read anonymous employee reviews and ratings for 10,000+ companies.',
//       },
//     ],
//   };
// }
// Fetch data on the server ✅

export default async function Home() {
   // Fetch data on server ✅
  const [primaryIndustries, additionalIndustries, featuredCompanies] = await Promise.all([
    getPrimaryIndustries(8), // Only 8 for homepage
    getAdditionalIndustries(8, 6), // Next 6 industries
    companyApi.getFeaturedCompanies()
  ]);
  

  return <HomePage primaryIndustries={primaryIndustries}
        additionalIndustries={additionalIndustries}
        featuredCompanies={featuredCompanies}/>;
}

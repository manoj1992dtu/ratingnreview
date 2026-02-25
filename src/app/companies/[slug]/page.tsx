// Rename this file from:
// src/app/employers/[companyId]/page.tsx
// to:
// src/app/employers/[companySlug]/page.tsx
import { companyApi, reviewsApi } from '../../../services/api';
import CompanyPage from '@/components/CompanyPage';
import type { Metadata } from "next";
import { generateCompanyJsonLd } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import { CompanyWithMeta } from '@/types/company';



export async function generateMetadata(
  { params }: { params: Promise<{ companySlug: string }> }
): Promise<Metadata> {
  try {
    const { companySlug } = await params; // ✅ await params
    const slug = companySlug.replace(/-reviews$/, '');
    const company = await companyApi.getCompanyBySlug(slug);

    return {
      title: `Working at ${company.name}: Reviews, Salaries & Culture`,
      description: `Is ${company.name} a good place to work? Check out ${company.reviewCount} unfiltered employee ratings and insights. Current overall score: ${company.ratings.overall} stars.`,
    };
  } catch {
    return {
      title: "Company Reviews",
      description: "Employee reviews and company ratings",
      //  title: "Company Employee Reviews & Ratings",
      // description: "Read authentic employee reviews, ratings, and workplace insights to make informed career decisions.",
      // keywords: "employee reviews, company ratings, workplace culture, job reviews, career insights"
    };
  }
}

interface CompanyPageProps {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Company({ params, searchParams }: CompanyPageProps) {
  const { companySlug } = await params;
  const { sortBy = 'newest', filterRating = 'all' } = await searchParams;

  const slug = companySlug.replace(/-reviews$/, '');

  // try {
  // Fetch data server-side for SEO
  const company: CompanyWithMeta = await companyApi.getCompanyBySlug(slug);
  const filterRatingNum = filterRating === 'all' ? undefined : parseInt(filterRating as string);
  const reviews = await reviewsApi.getCompanyReviewsBySlug(
    slug,
    sortBy as string,
    filterRatingNum
  );
  const jsonLd = generateCompanyJsonLd(company, reviews);



  return (
    <>
      <JsonLd data={jsonLd} />
      <CompanyPage
        company={company}
        initialReviews={reviews}
        initialFilters={{
          sortBy: sortBy as any,
          filterRating: filterRating as any
        }}
      />
    </>
  );
  // } catch (error) {
  //   console.error('Error fetching company data:', error);

  //   // Return error page component
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
  //       <div className="text-center bg-white p-12 rounded-2xl shadow-lg max-w-md">
  //         <div className="text-6xl mb-6">🏢</div>
  //         <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
  //         <p className="text-gray-600 mb-6">
  //           We couldn't find the company you're looking for. It may have been moved or doesn't exist.
  //         </p>
  //          <a
  //           href="/"
  //           className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors font-medium inline-block"
  //           >
  //           Back to Home
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }
}
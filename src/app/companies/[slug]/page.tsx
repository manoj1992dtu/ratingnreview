// Rename this file from:
// src/app/employers/[companyId]/page.tsx
// to:
// src/app/employers/[companySlug]/page.tsx
import { companyApi, reviewsApi } from '../../../services/api';
import { getCompanyIndustries, getRelatedCompanies } from '@/services/industries';
import CompanyPage from '@/components/CompanyPage';
import type { Metadata } from "next";
import { generateCompanyJsonLd } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import { CompanyWithMeta } from '@/types/company';

// Cache company pages for 1 hour (3600 seconds) to balance performance with fresh review data.
// Since the AI engine publishes once daily and real users submit reviews occasionally, 1 hour 
// ensures high Vercel cache hit rates while never letting content get too stale.
export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params; // ✅ await params
    const cleanSlug = slug.replace(/-reviews$/, '');
    const company = await companyApi.getCompanyBySlug(cleanSlug);

    // Fetch industry for context
    const industries = await getCompanyIndustries(company.id!);
    const primaryIndustry = industries.find(i => i.is_primary) || industries[0];
    const industryName = primaryIndustry?.name || 'various sectors';

    return {
      title: `${company.name} Employee Reviews & Ratings | ${industryName}`,
      description: `Is ${company.name} a good place to work? Check out ${company.reviewCount} unfiltered employee ratings and insights. Current overall score: ${company.ratings.overall} stars.`,
    };
  } catch {
    return {
      title: "Company Reviews",
      description: "Employee reviews and company ratings",
    };
  }
}

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Company({ params, searchParams }: CompanyPageProps) {
  const { slug } = await params;
  const { sortBy = 'newest', filterRating = 'all' } = await searchParams;

  const cleanSlug = slug.replace(/-reviews$/, '');

  // Fetch data server-side for SEO
  const company: CompanyWithMeta = await companyApi.getCompanyBySlug(cleanSlug);
  const filterRatingNum = filterRating === 'all' ? undefined : parseInt(filterRating as string);
  const reviews = await reviewsApi.getCompanyReviewsBySlug(
    cleanSlug,
    sortBy as string,
    filterRatingNum
  );

  // Fetch industry for breadcrumbs and related companies
  const industries = await getCompanyIndustries(company.id!);
  const primaryIndustry = industries.find(i => i.is_primary) || industries[0];

  // Fetch related companies in the same industry
  let relatedCompanies: any[] = [];
  if (primaryIndustry) {
    relatedCompanies = await getRelatedCompanies(primaryIndustry.id, company.id!, 24);
  }

  const jsonLd = generateCompanyJsonLd(company, reviews);

  return (
    <>
      <JsonLd data={jsonLd} />
      <CompanyPage
        company={company}
        initialReviews={reviews}
        industry={primaryIndustry}
        relatedCompanies={relatedCompanies}
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
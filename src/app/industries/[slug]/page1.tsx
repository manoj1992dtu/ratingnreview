// app/categories/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Building, Users, Star, Award } from 'lucide-react';
import { getIndustry, getIndustryCompanies } from '@/services/industries';
import CategoryFilters from '@/components/categories/category/CategoryFilters';
import CompanyList from '@/components/categories/category/CompanyList';
import CategorySidebar from '@/components/categories/category/CategorySidebar';
import SubcategoriesSection from './SubcategoriesSection';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    size?: string;
    search?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const industry = await getIndustry(slug);

  if (!industry) {
    return {
      title: 'Industry Not Found',
    };
  }

  return {
    title: `${industry.meta_title}|| ${industry.name} Company Reviews | Employee Reviews`,
    description: industry.meta_description || industry.description,
  };
}

export default async function IndustryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page, search, sort } = await searchParams;
  const pageNumber = parseInt(page || '1');
  const sortBy = sort || 'rating';
  // const search = searchParams.search || '';

  // Fetch industry data
  const industry = await getIndustry(slug);

  if (!industry) {
    notFound();
  }

  // Fetch companies for this industry
  const companiesData = await getIndustryCompanies(industry.id, {
    page: pageNumber,
    limit: 12,
    orderBy: sortBy as any,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-8">
            <Link href="/industries" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
              <span className="p-1 bg-slate-800 rounded">←</span> Back to Industries
            </Link>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              {industry.name} <span className="text-indigo-400">Hub</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
              {industry.description || `Comprehensive insights and anonymous feedback for the ${industry.name} industry.`}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col min-w-[140px]">
                <span className="text-3xl font-black text-white mb-1">{(industry.company_count || 0).toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organizations</span>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col min-w-[140px]">
                <span className="text-3xl font-black text-white mb-1">{(industry.review_count || 0).toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experiences</span>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col min-w-[140px]">
                <span className="text-3xl font-black text-white mb-1">{industry.avg_rating?.toFixed(1) || 'N/A'}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories Section - Server Component */}
      <SubcategoriesSection parentIndustryId={industry.id} />

      {/* Filters - Client Component */}
      <CategoryFilters />

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company List - Client Component */}
          <div className="lg:col-span-2">
            <CompanyList
              companies={companiesData.data}
              total={companiesData.total}
              page={pageNumber}
              hasMore={companiesData.hasMore}
              industrySlug={slug}
            />
          </div>

          {/* Sidebar - Client Component */}
          <CategorySidebar industryId={industry.id} />
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
            Industry Insights: {industry.name}
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Gain a competitive edge by exploring unfiltered perspectives from professionals working within the {industry.name.toLowerCase()} industry.
              Our data-driven platform consolidates thousands of data points to provide a crystal-clear view of the standard workplace dynamics in this field.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              From established giants to disruptive startups, compare how various players in the industry stack up when it comes to long-term stability and modern workplace culture.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" />
                  What to Track
                </h3>
                <ul className="text-slate-600 space-y-3 font-medium">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Operational Transparency
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Leadership Engagement
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Skill-Building Initiatives
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-500" />
                  Industry Standards
                </h3>
                <ul className="text-slate-600 space-y-3 font-medium">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Remote-First Adoption
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Total Rewards Packages
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Diversity Benchmarks
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star, TrendingUp, Users, Building, Code, DollarSign,
  Heart, Briefcase, ShoppingBag, Factory, Zap, Home,
  Truck, Film, Wifi, GraduationCap, Coffee, Wheat,
  ChevronRight, Globe
} from 'lucide-react';
import CompanySearchDropdown from '@/components/CompanySearchDropdown';
import { useRouter } from 'next/navigation';
import { CompanyPreview } from '@/types/company';

// Icon mapping
const iconMap: Record<string, any> = {
  'technology-companies': Code,
  'financial-services-companies': DollarSign,
  'healthcare-companies': Heart,
  'consulting-firms': Briefcase,
  'ecommerce-companies': ShoppingBag,
  'manufacturing-companies': Factory,
  'energy-companies': Zap,
  'real-estate-companies': Home,
  'logistics-companies': Truck,
  'media-companies': Film,
  'telecommunications-companies': Wifi,
  'education-companies': GraduationCap,
  'hospitality-companies': Coffee,
  'agriculture-companies': Wheat,
};

const colorMap: Record<string, string> = {
  'technology-companies': 'bg-indigo-100 text-primary',
  'financial-services-companies': 'bg-green-100 text-green-600',
  'healthcare-companies': 'bg-red-100 text-red-600',
  'consulting-firms': 'bg-purple-100 text-purple-600',
  'ecommerce-companies': 'bg-pink-100 text-pink-600',
  'manufacturing-companies': 'bg-gray-100 text-gray-600',
  'energy-companies': 'bg-yellow-100 text-yellow-600',
  'real-estate-companies': 'bg-indigo-100 text-indigo-600',
};

interface Industry {
  id: string;
  slug: string;
  name: string;
  is_primary: boolean;
  company_count?: number;
}

interface HomePageClientProps {
  primaryIndustries: Industry[];
  additionalIndustries: Industry[];
  featuredCompanies: any[];
}

export default function HomePageClient({
  primaryIndustries,
  additionalIndustries,
  featuredCompanies,
}: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleCompanySelect = (company: CompanyPreview) => {
    router.push(`/companies/${company.slug}`);
  };

  const getIcon = (slug: string) => iconMap[slug] || Globe;
  const getColor = (slug: string) => colorMap[slug] || 'bg-gray-100 text-gray-600';
  const formatCompanyCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-slate-50 py-32 overflow-hidden" aria-labelledby="main-hero-title">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-1000"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-indigo-100">
            <Zap className="h-3 w-3" />
            Verified Workplace Insights
          </div>

          <h1 id="main-hero-title" className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.1]">
            Transparent Workplace <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Insights.
            </span>
          </h1>

          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover honest, unfiltered employee experiences to help you navigate your professional journey with confidence.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative p-2 bg-white/50 backdrop-blur-xl border border-white rounded-2xl shadow-2xl shadow-indigo-500/10 transition-all hover:shadow-indigo-500/20">
              <label htmlFor="company-search" className="sr-only">
                Search employers...
              </label>
              <CompanySearchDropdown
                value={searchQuery}
                onChange={setSearchQuery}
                onCompanySelect={handleCompanySelect}
              />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div> Live Database</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 100% Anonymous</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Professional Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 relative overflow-hidden" aria-label="Platform reach">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="text-white group">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500/20 transition-all duration-500 ring-1 ring-white/10">
                <Building className="h-8 w-8 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-black mb-2 tracking-tighter">12K+</div>
              <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Monitored Entities</div>
            </div>
            <div className="text-white group">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500/20 transition-all duration-500 ring-1 ring-white/10">
                <Users className="h-8 w-8 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-black mb-2 tracking-tighter">65K+</div>
              <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Contributor Insights</div>
            </div>
            <div className="text-white group">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500/20 transition-all duration-500 ring-1 ring-white/10">
                <TrendingUp className="h-8 w-8 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-black mb-2 tracking-tighter">98%</div>
              <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Verified Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section - Data from server ✅ */}
      <section className="py-16 bg-white" aria-labelledby="industries-heading">
        <div className="max-w-6xl mx-auto px-4">
          <header className="mb-12">
            <h2 id="industries-heading" className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Explore <span className="text-primary">Industries</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Deep dive into specific industries to compare workplace standards
            </p>
          </header>

          <nav aria-label="Industry categories">
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {primaryIndustries.map((industry) => {
                const IconComponent = getIcon(industry.slug);
                const colorClass = getColor(industry.slug);

                return (
                  <li key={industry.id} className="animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
                    <Link
                      href={`/industries/${industry.slug}`}
                      className="group bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:border-indigo-200 transition-all duration-500 block relative overflow-hidden"
                      aria-label={`Browse ${industry.name} workplaces`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors"></div>

                      <div className={`w-14 h-14 ${colorClass.replace('bg-indigo-100', 'bg-slate-50').replace('text-primary', 'text-indigo-600')} shadow-sm border border-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <IconComponent className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="font-black text-slate-900 mb-2 text-xl group-hover:text-primary transition-colors tracking-tight">
                        {industry.name}
                      </h3>
                      <p className="text-sm text-slate-400 mb-8 font-bold uppercase tracking-widest text-[10px]">
                        {formatCompanyCount(industry.company_count || 0)} Organizations
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-600 text-xs font-black tracking-widest uppercase flex items-center gap-1">
                          Explore
                          <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="h-1 w-8 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-0 group-hover:w-full transition-all duration-700"></div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Additional Industries */}
          {additionalIndustries.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                More Industries
              </h3>
              <nav aria-label="Additional industry categories">
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {additionalIndustries.map((industry) => {
                    const IconComponent = getIcon(industry.slug);
                    return (
                      <li key={industry.id}>
                        <Link
                          href={`/industries/${industry.slug}`}
                          className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
                            <IconComponent className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" aria-hidden="true" />
                          </div>
                          <span className="text-sm text-center text-gray-700 group-hover:text-primary transition-colors font-medium">
                            {industry.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/industries"
              className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-slate-800 transition-all font-bold group"
            >
              Explore All Industries
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Companies - Data from server ✅ */}
      <section className="py-20 bg-white" aria-labelledby="top-workplaces-title">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 id="top-workplaces-title" className="text-3xl font-bold text-slate-900 mb-2">
                Top-Rated Workplaces
              </h2>
              <p className="text-slate-500 font-medium">Companies with the highest employee satisfaction scores</p>
            </div>
            <Link href="/industries" className="text-primary font-bold hover:underline hidden md:block">
              Full Index &rarr;
            </Link>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCompanies.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.slug}`}
                  className="group bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-[0_40px_80px_rgba(79,70,229,0.08)] hover:-translate-y-2 transition-all duration-500 block relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>

                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <Building className="h-8 w-8 text-slate-400 group-hover:text-indigo-500 transition-colors" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100 shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      <span className="font-extrabold text-yellow-700 text-xs">{company.avgRating || '0.0'}</span>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 mb-1 text-xl group-hover:text-primary transition-colors tracking-tight">{company.name}</h3>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6 border-b border-slate-50 pb-6">{company.industry || 'General'}</p>

                  <div className="flex justify-between items-center group/btn">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {company.reviewCount} Ratings
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-all" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24 bg-indigo-600 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:32px_32px]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 id="cta-heading" className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1] animate-float">
            Influence the <br /><span className="text-indigo-300">Culture.</span>
          </h2>
          <p className="text-xl text-indigo-100 mb-12 leading-relaxed font-bold uppercase tracking-widest text-xs opacity-80">
            Trusted by 50,000+ professionals monthly.
          </p>
          <Link
            href="/review"
            className="inline-flex items-center bg-white text-indigo-600 px-12 py-6 rounded-full hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-900/40 font-black text-xl hover:-translate-y-2 group"
          >
            Start Your Review
            <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          <div className="mt-12 flex justify-center gap-8 grayscale opacity-50">
            <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
            <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
            <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
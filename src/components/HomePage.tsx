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
    <div className="min-h-screen bg-background">
      {/* Search Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden pt-10" aria-labelledby="main-hero-title">
        {/* Ambient glow effects */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/6 blur-3xl" />
        <div className="container mx-auto px-4 text-center z-10 w-full">
          <h1 id="main-hero-title" className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Find the right <span className="text-gradient">workplace</span>
            <br />
            for your career
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Anonymous reviews from real employees to help you make informed career decisions.
          </p>

          <div className="mx-auto mt-10 max-w-2xl relative group">
            <div className="relative glass rounded-xl p-2 transition-all">
              <label htmlFor="company-search" className="sr-only">
                Search employers...
              </label>
              <CompanySearchDropdown
                value={searchQuery}
                onChange={setSearchQuery}
                onCompanySelect={handleCompanySelect}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="container mx-auto px-4 py-20 relative" aria-labelledby="industries-heading">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 text-center">
            <h2 id="industries-heading" className="text-3xl font-bold text-foreground mb-2">
              Browse by Industry
            </h2>
          </header>

          <nav aria-label="Industry categories">
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {primaryIndustries.map((industry) => {
                const IconComponent = getIcon(industry.slug);
                return (
                  <li key={industry.id}>
                    <Link
                      href={`/industries/${industry.slug}`}
                      className="group flex flex-col items-center justify-center glass rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                      aria-label={`Browse ${industry.name} workplaces`}
                    >
                      <div className="mb-4 rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary transition-transform duration-200" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold text-foreground text-center group-hover:text-primary transition-colors text-sm">
                        {industry.name}
                      </h3>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="text-center mt-10">
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
            >
              More Industries <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="container mx-auto px-4 py-20" aria-labelledby="top-workplaces-title">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 text-center flex flex-col items-center">
            <h2 id="top-workplaces-title" className="text-3xl font-bold text-foreground mb-2">
              Trending Companies
            </h2>
            <Link
              href="/industries"
              className="group inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors mt-2"
            >
              View Benchmark
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </header>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCompanies.map((company, i) => (
              <li key={company.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <Link
                  href={`/companies/${company.slug}`}
                  className="group glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 transition-all duration-300 block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                      {company.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 bg-warning/20 text-warning-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      <span>{company.avgRating || '0.0'}</span>
                    </div>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{company.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{company.industry || 'General'}</p>

                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                      {company.reviewCount.toLocaleString()} reviews
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center" aria-labelledby="cta-heading">
        <div className="glass max-w-3xl mx-auto p-12 rounded-2xl">
          <h2 id="cta-heading" className="text-3xl font-bold text-foreground mb-4">
            Share Your Experience
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Help millions of job seekers make better career decisions. Your review stays anonymous.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/review"
              className="inline-flex items-center bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm hover:-translate-y-0.5 duration-200"
            >
              Write a Review
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
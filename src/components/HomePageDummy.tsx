'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, TrendingUp, Users, Building, Code, DollarSign, Heart, Briefcase, ShoppingBag, Factory, Zap, Home, Truck, Film, Wifi, GraduationCap, Coffee, Wheat, ChevronRight } from 'lucide-react';
import CompanySearchDropdown from '@/components/CompanySearchDropdown';
import { companyApi } from '../services/api';
import { Company } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CompanyPreview } from '@/types/company';

// Primary industry categories with icons
const primaryCategories = [
  { 
    name: 'Technology & Software', 
    slug: 'technology-companies',
    icon: Code,
    searches: '40.5K/mo',
    color: 'bg-indigo-100 text-primary'
  },
  { 
    name: 'Finance & Banking', 
    slug: 'finance-companies',
    icon: DollarSign,
    searches: '18.1K/mo',
    color: 'bg-green-100 text-green-600'
  },
  { 
    name: 'Healthcare & Pharma', 
    slug: 'healthcare-companies',
    icon: Heart,
    searches: '14.8K/mo',
    color: 'bg-red-100 text-red-600'
  },
  { 
    name: 'Consulting & Services', 
    slug: 'consulting-firms',
    icon: Briefcase,
    searches: '12.1K/mo',
    color: 'bg-purple-100 text-purple-600'
  },
  { 
    name: 'Retail & E-commerce', 
    slug: 'retail-companies',
    icon: ShoppingBag,
    searches: '9.9K/mo',
    color: 'bg-pink-100 text-pink-600'
  },
  { 
    name: 'Manufacturing', 
    slug: 'manufacturing-companies',
    icon: Factory,
    searches: '8.2K/mo',
    color: 'bg-gray-100 text-gray-600'
  },
  { 
    name: 'Energy & Utilities', 
    slug: 'energy-companies',
    icon: Zap,
    searches: '7.5K/mo',
    color: 'bg-yellow-100 text-yellow-600'
  },
  { 
    name: 'Real Estate', 
    slug: 'real-estate-companies',
    icon: Home,
    searches: '6.8K/mo',
    color: 'bg-indigo-100 text-indigo-600'
  },
];

// Additional categories for quick access
const additionalCategories = [
  { name: 'Transportation & Logistics', slug: 'logistics-companies', icon: Truck },
  { name: 'Media & Entertainment', slug: 'media-companies', icon: Film },
  { name: 'Telecommunications', slug: 'telecommunications-companies', icon: Wifi },
  { name: 'Education', slug: 'education-companies', icon: GraduationCap },
  { name: 'Hospitality & Travel', slug: 'hospitality-companies', icon: Coffee },
  { name: 'Agriculture', slug: 'agriculture-companies', icon: Wheat },
];

const HomePageDummy: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedCompanies = async () => {
      try {
        const companies = await companyApi.getFeaturedCompanies(4);
        setFeaturedCompanies(companies);
      } catch (error) {
        console.error('Error fetching featured companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCompanies();
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handleCompanySelect = (company: CompanyPreview) => {
    router.push(`/employers/${company.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Your Next Great Workplace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Anonymous reviews from real employees to help you make informed career decisions
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative text-lg">
              <CompanySearchDropdown
                value={searchQuery}
                onChange={setSearchQuery}
                onCompanySelect={handleCompanySelect}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <Building className="h-12 w-12 mx-auto mb-4" />
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-indigo-100">Companies Reviewed</div>
            </div>
            <div className="text-white">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-indigo-100">Anonymous Reviews</div>
            </div>
            <div className="text-white">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <div className="text-3xl font-bold">95%</div>
              <div className="text-indigo-100">Verified Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Industry
            </h2>
            <p className="text-lg text-gray-600">
              Explore company reviews across the most popular industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {primaryCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-500 hover:shadow-xl transition-all duration-300 block"
                >
                  <div className={`w-14 h-14 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{category.searches} searches</p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Explore reviews
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Additional Categories - Compact View */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              More Industries
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {additionalCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
                      <IconComponent className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm text-center text-gray-700 group-hover:text-primary transition-colors font-medium">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* View All Categories Link */}
          <div className="text-center mt-8">
            <Link
              href="/categories/all-industries"
              className="inline-flex items-center text-primary hover:text-primary-hover font-semibold"
            >
              View All Industries
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Popular Companies
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading companies...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/employers/${company.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow block"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{company.avgRating || 0}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{company.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{company.industry || 'Technology'}</p>
                  <p className="text-sm text-primary">{company.reviewCount} reviews</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Share Your Experience
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Help others make informed decisions by sharing your workplace experience anonymously
          </p>
          <Link
            href="/review"
            className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-xl hover:bg-primary-hover transition-colors font-semibold text-lg"
          >
            Write a Review
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePageDummy;
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Code, DollarSign, Heart, Briefcase, ShoppingBag, Factory, Zap, Home, Truck, Film, Wifi, GraduationCap, Coffee, Wheat, Building2, Hammer, Pill, Calculator, Scale, Megaphone, TrendingUp, ChevronRight } from 'lucide-react';

interface Industry {
  name: string;
  slug: string;
  icon: React.ComponentType<any>;
  color: string;
  companies: number;
  reviews: number;
  avgRating: number;
  description: string;
  searches?: string; // 👈 optional
}
interface IndustryGroup {
  category: string;
  isPrimary: boolean;
  industries: Industry[];
}
// Industry categories with full data
const allIndustries: IndustryGroup[] = [
  // Primary Industries
  {
    category: 'Popular Industries',
    isPrimary: true,
    industries: [
      {
        name: 'Technology & Software',
        slug: 'technology-companies',
        icon: Code,
        color: 'bg-indigo-100 text-primary',
        companies: 1247,
        reviews: 8934,
        avgRating: 4.2,
        searches: '40.5K/mo',
        description: 'Software development, IT services, SaaS, AI, and tech innovation'
      },
      {
        name: 'Finance & Banking',
        slug: 'finance-companies',
        icon: DollarSign,
        color: 'bg-green-100 text-green-600',
        companies: 892,
        reviews: 6543,
        avgRating: 4.0,
        searches: '18.1K/mo',
        description: 'Financial services, banking, investment, and accounting'
      },
      {
        name: 'Healthcare & Pharmaceuticals',
        slug: 'healthcare-companies',
        icon: Heart,
        color: 'bg-red-100 text-red-600',
        companies: 756,
        reviews: 5234,
        avgRating: 4.1,
        searches: '14.8K/mo',
        description: 'Healthcare providers, pharmaceutical, and medical services'
      },
      {
        name: 'Consulting & Professional Services',
        slug: 'consulting-firms',
        icon: Briefcase,
        color: 'bg-purple-100 text-purple-600',
        companies: 634,
        reviews: 4876,
        avgRating: 3.9,
        searches: '12.1K/mo',
        description: 'Management consulting, advisory, and professional services'
      },
      {
        name: 'Retail & E-commerce',
        slug: 'retail-companies',
        icon: ShoppingBag,
        color: 'bg-pink-100 text-pink-600',
        companies: 543,
        reviews: 4123,
        avgRating: 3.8,
        searches: '9.9K/mo',
        description: 'Retail stores, e-commerce platforms, and consumer brands'
      },
      {
        name: 'Manufacturing & Industrial',
        slug: 'manufacturing-companies',
        icon: Factory,
        color: 'bg-gray-100 text-gray-600',
        companies: 478,
        reviews: 3567,
        avgRating: 3.7,
        searches: '8.2K/mo',
        description: 'Manufacturing, industrial equipment, and production'
      },
      {
        name: 'Energy & Utilities',
        slug: 'energy-companies',
        icon: Zap,
        color: 'bg-yellow-100 text-yellow-600',
        companies: 387,
        reviews: 2890,
        avgRating: 3.9,
        searches: '7.5K/mo',
        description: 'Energy production, utilities, and renewable energy'
      },
      {
        name: 'Real Estate & Construction',
        slug: 'real-estate-companies',
        icon: Home,
        color: 'bg-indigo-100 text-indigo-600',
        companies: 423,
        reviews: 3124,
        avgRating: 3.6,
        searches: '6.8K/mo',
        description: 'Real estate, construction, and property management'
      },
    ]
  },
  // Secondary Industries
  {
    category: 'More Industries',
    isPrimary: false,
    industries: [
      {
        name: 'Transportation & Logistics',
        slug: 'logistics-companies',
        icon: Truck,
        color: 'bg-orange-100 text-orange-600',
        companies: 312,
        reviews: 2456,
        avgRating: 3.7,
        description: 'Logistics, supply chain, shipping, and transportation'
      },
      {
        name: 'Media & Entertainment',
        slug: 'media-companies',
        icon: Film,
        color: 'bg-rose-100 text-rose-600',
        companies: 289,
        reviews: 2134,
        avgRating: 4.0,
        description: 'Media, entertainment, streaming, and content production'
      },
      {
        name: 'Telecommunications',
        slug: 'telecommunications-companies',
        icon: Wifi,
        color: 'bg-cyan-100 text-cyan-600',
        companies: 234,
        reviews: 1876,
        avgRating: 3.8,
        description: 'Telecom providers, wireless carriers, and network services'
      },
      {
        name: 'Education',
        slug: 'education-companies',
        icon: GraduationCap,
        color: 'bg-teal-100 text-teal-600',
        companies: 456,
        reviews: 3245,
        avgRating: 4.1,
        description: 'Educational institutions, online learning, and training'
      },
      {
        name: 'Hospitality & Travel',
        slug: 'hospitality-companies',
        icon: Coffee,
        color: 'bg-amber-100 text-amber-600',
        companies: 389,
        reviews: 2789,
        avgRating: 3.7,
        description: 'Hotels, restaurants, tourism, and travel services'
      },
      {
        name: 'Food & Beverage',
        slug: 'food-beverage-companies',
        icon: Coffee,
        color: 'bg-lime-100 text-lime-600',
        companies: 412,
        reviews: 2945,
        avgRating: 3.8,
        description: 'Food production, beverage companies, and restaurants'
      },
      {
        name: 'Agriculture',
        slug: 'agriculture-companies',
        icon: Wheat,
        color: 'bg-emerald-100 text-emerald-600',
        companies: 187,
        reviews: 1234,
        avgRating: 3.9,
        description: 'Agriculture, farming, and agtech companies'
      },
      {
        name: 'Automotive',
        slug: 'automotive-companies',
        icon: Truck,
        color: 'bg-slate-100 text-slate-600',
        companies: 298,
        reviews: 2156,
        avgRating: 3.8,
        description: 'Automotive manufacturing and vehicle companies'
      },
      {
        name: 'Aerospace & Defense',
        slug: 'aerospace-companies',
        icon: Building2,
        color: 'bg-sky-100 text-sky-600',
        companies: 156,
        reviews: 1345,
        avgRating: 4.0,
        description: 'Aerospace, aviation, and defense contractors'
      },
      {
        name: 'Legal Services',
        slug: 'law-firms',
        icon: Scale,
        color: 'bg-violet-100 text-violet-600',
        companies: 267,
        reviews: 1876,
        avgRating: 3.7,
        description: 'Law firms and legal services providers'
      },
      {
        name: 'Marketing & Advertising',
        slug: 'marketing-agencies',
        icon: Megaphone,
        color: 'bg-fuchsia-100 text-fuchsia-600',
        companies: 423,
        reviews: 2987,
        avgRating: 3.9,
        description: 'Marketing agencies, advertising, and PR firms'
      },
      {
        name: 'Nonprofit & Government',
        slug: 'nonprofit-organizations',
        icon: Heart,
        color: 'bg-red-100 text-red-600',
        companies: 345,
        reviews: 2234,
        avgRating: 4.0,
        description: 'Non-profit organizations, NGOs, and government agencies'
      },
    ]
  }
];

const AllIndustriesDummyPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate total stats
  const totalCompanies = allIndustries.reduce((sum, group) =>
    sum + group.industries.reduce((s, ind) => s + ind.companies, 0), 0
  );
  const totalReviews = allIndustries.reduce((sum, group) =>
    sum + group.industries.reduce((s, ind) => s + ind.reviews, 0), 0
  );

  // Filter industries based on search
  const filteredIndustries = allIndustries.map(group => ({
    ...group,
    industries: group.industries.filter(ind =>
      ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.industries.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Reviews by Industry
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl">
            Explore authentic employee reviews across all industries. Find the best companies in your field and make informed career decisions.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Building2 className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{totalCompanies.toLocaleString()}</div>
              <div className="text-indigo-100">Total Companies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <TrendingUp className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{totalReviews.toLocaleString()}</div>
              <div className="text-indigo-100">Employee Reviews</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Briefcase className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{allIndustries.reduce((s, g) => s + g.industries.length, 0)}</div>
              <div className="text-indigo-100">Industries Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search industries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {filteredIndustries.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {group.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.industries.map((industry) => {
                  const IconComponent = industry.icon;
                  return (
                    <Link
                      key={industry.slug}
                      href={`/categories/${industry.slug}`}
                      className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Icon and Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 ${industry.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-7 w-7" />
                        </div>
                        {industry.searches && (
                          <span className="text-xs bg-indigo-50 text-primary px-2 py-1 rounded-full font-medium">
                            {industry.searches}
                          </span>
                        )}
                      </div>

                      {/* Industry Name */}
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-primary transition-colors">
                        {industry.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {industry.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                        <div>
                          <span className="text-gray-500">{industry.companies} companies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">{industry.reviews} reviews</span>
                        </div>
                      </div>

                      {/* Average Rating */}
                      {industry.avgRating && (
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                            <span className="text-sm font-semibold text-gray-900">{industry.avgRating}</span>
                            <span className="text-yellow-500 ml-1">★</span>
                          </div>
                          <span className="text-xs text-gray-500">avg rating</span>
                        </div>
                      )}

                      {/* Arrow */}
                      <div className="flex items-center text-primary text-sm font-medium mt-4">
                        View reviews
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* No Results */}
          {filteredIndustries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No industries found</h3>
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find Your Industry?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            We're constantly adding new industries and companies. Share your workplace experience and help us grow.
          </p>
          <Link
            href="/review"
            className="inline-flex items-center bg-white text-primary px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors font-semibold text-lg"
          >
            Write a Review
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Browse Reviews by Industry?
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              Understanding industry-specific workplace cultures, compensation trends, and career growth opportunities is crucial for making informed career decisions. Our comprehensive industry pages help you compare companies within the same industry and discover what matters most to professionals in your field.
            </p>
            <p className="text-gray-600 mb-4">
              Each industry page features authentic employee reviews covering work-life balance, salary satisfaction, company culture, career development, and more. Whether you're exploring opportunities in tech startups, established finance firms, or healthcare organizations, you'll find valuable insights from real employees.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Featured Industry Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <strong className="text-gray-900">Technology & Software:</strong> Discover reviews of software companies, SaaS startups, cybersecurity firms, and AI companies.
              </div>
              <div>
                <strong className="text-gray-900">Finance & Banking:</strong> Explore workplace experiences at banks, investment firms, fintech companies, and accounting firms.
              </div>
              <div>
                <strong className="text-gray-900">Healthcare:</strong> Read about hospital systems, pharmaceutical companies, medical device manufacturers, and healthtech startups.
              </div>
              <div>
                <strong className="text-gray-900">Consulting:</strong> Learn about management consulting, IT consulting, strategy firms, and professional services.
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">What Makes Our Industry Reviews Valuable</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• <strong>Authentic Employee Feedback:</strong> All reviews come from verified current and former employees</li>
              <li>• <strong>Comprehensive Ratings:</strong> Detailed breakdowns of work-life balance, compensation, culture, and growth</li>
              <li>• <strong>Industry Comparisons:</strong> Compare companies within the same industry to find the best fit</li>
              <li>• <strong>Recent Reviews:</strong> Stay updated with the latest workplace experiences and company changes</li>
              <li>• <strong>Anonymous Submissions:</strong> Honest feedback without fear of retaliation</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllIndustriesDummyPage;
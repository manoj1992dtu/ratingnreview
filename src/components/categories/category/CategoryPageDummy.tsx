'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Building, Users, TrendingUp, Filter, Search, ChevronDown, Award, MapPin, Briefcase } from 'lucide-react';

// Mock data - replace with actual API calls
const mockIndustryData = {
  name: 'Technology & Software',
  slug: 'technology-companies',
  description: 'Explore honest employee reviews of technology and software companies. Find the best tech workplaces based on real experiences from software engineers, product managers, and other tech professionals.',
  companyCount: 1247,
  reviewCount: 8934,
  avgRating: 4.2,
  subCategories: [
    { name: 'Software Companies', slug: 'software-companies', count: 423 },
    { name: 'SaaS Companies', slug: 'saas-companies', count: 312 },
    { name: 'Cybersecurity', slug: 'cybersecurity-companies', count: 89 },
    { name: 'AI & Machine Learning', slug: 'artificial-intelligence-companies', count: 156 },
    { name: 'Cloud Computing', slug: 'cloud-computing-companies', count: 134 },
    { name: 'FinTech', slug: 'fintech-companies', count: 201 },
  ]
};

const mockCompanies = [
  { id: 1, name: 'Google', slug: 'google', rating: 4.5, reviewCount: 1234, location: 'Mountain View, CA', industry: 'Technology', logo: '🔍', size: '10,000+' },
  { id: 2, name: 'Microsoft', slug: 'microsoft', rating: 4.4, reviewCount: 987, location: 'Redmond, WA', industry: 'Technology', logo: '🪟', size: '10,000+' },
  { id: 3, name: 'Amazon', slug: 'amazon', rating: 3.9, reviewCount: 2145, location: 'Seattle, WA', industry: 'Technology', logo: '📦', size: '10,000+' },
  { id: 4, name: 'Meta', slug: 'meta', rating: 4.2, reviewCount: 876, location: 'Menlo Park, CA', industry: 'Technology', logo: '👍', size: '10,000+' },
  { id: 5, name: 'Apple', slug: 'apple', rating: 4.3, reviewCount: 1543, location: 'Cupertino, CA', industry: 'Technology', logo: '🍎', size: '10,000+' },
  { id: 6, name: 'Netflix', slug: 'netflix', rating: 4.1, reviewCount: 432, location: 'Los Gatos, CA', industry: 'Technology', logo: '🎬', size: '5,000+' },
];

const mockRecentReviews = [
  { 
    id: 1, 
    company: 'Google', 
    rating: 5, 
    title: 'Amazing workplace culture and benefits',
    excerpt: 'Great work-life balance, innovative projects, and excellent compensation...',
    designation: 'Software Engineer',
    date: '2 days ago'
  },
  { 
    id: 2, 
    company: 'Microsoft', 
    rating: 4, 
    title: 'Good company but slow promotion cycle',
    excerpt: 'Stable environment with good benefits but promotions take time...',
    designation: 'Product Manager',
    date: '5 days ago'
  },
  { 
    id: 3, 
    company: 'Amazon', 
    rating: 3, 
    title: 'Fast-paced but demanding',
    excerpt: 'Learn a lot but work-life balance can be challenging...',
    designation: 'SDE II',
    date: '1 week ago'
  },
];

const CategoryPageDummy = () => {
  const [sortBy, setSortBy] = useState('rating');
  const [filterSize, setFilterSize] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Industry Overview */}
      <section className="bg-gradient-to-r from-primary to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <Link href="/reviews" className="text-indigo-200 hover:text-white">
              ← All Industries
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {mockIndustryData.name} Reviews
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl">
            {mockIndustryData.description}
          </p>

          {/* Industry Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Building className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{mockIndustryData.companyCount.toLocaleString()}</div>
              <div className="text-indigo-100">Companies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Users className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{mockIndustryData.reviewCount.toLocaleString()}</div>
              <div className="text-indigo-100">Employee Reviews</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Star className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{mockIndustryData.avgRating}</div>
              <div className="text-indigo-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-categories */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Specialization</h2>
          <div className="flex flex-wrap gap-3">
            {mockIndustryData.subCategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/categories/${sub.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-indigo-100 rounded-full text-sm font-medium text-gray-700 hover:text-primary-hover transition-colors"
              >
                {sub.name} ({sub.count})
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Company Name</option>
              </select>

              <select
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Sizes</option>
                <option value="startup">Startup (1-50)</option>
                <option value="small">Small (51-200)</option>
                <option value="medium">Medium (201-1000)</option>
                <option value="large">Large (1000+)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company List - Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Top Technology Companies ({mockCompanies.length})
            </h2>

            <div className="space-y-4">
              {mockCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/employers/${company.slug}`}
                  className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                      {company.logo}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {company.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {company.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {company.size} employees
                            </span>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                          <Star className="h-5 w-5 fill-green-500 text-green-500" />
                          <span className="text-lg font-bold text-gray-900">{company.rating}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium text-primary">{company.reviewCount} reviews</span>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Work-Life:</span>
                          <span className="ml-1 font-medium">4.3</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Culture:</span>
                          <span className="ml-1 font-medium">4.5</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Salary:</span>
                          <span className="ml-1 font-medium">4.2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                Load More Companies
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Reviews */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {mockRecentReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{review.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{review.excerpt}</p>
                    <div className="text-xs text-gray-500">
                      {review.designation} at {review.company}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="#" className="text-sm text-primary hover:text-primary-hover font-medium mt-4 block">
                View all reviews →
              </Link>
            </div>

            {/* Top Rated Badge */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <Award className="h-8 w-8 text-yellow-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Rated in Tech</h3>
              <p className="text-sm text-gray-600 mb-4">
                Companies with 4.5+ ratings and 100+ reviews
              </p>
              <Link href="#" className="text-sm text-primary hover:text-primary-hover font-medium">
                See all winners →
              </Link>
            </div>

            {/* CTA Box */}
            <div className="bg-primary text-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Work in Tech?</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Share your experience to help others make informed career decisions
              </p>
              <Link
                href="/review"
                className="block w-full bg-white text-primary text-center px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Write a Review
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About Technology & Software Company Reviews
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              Discover authentic employee reviews of technology and software companies. Our platform features honest feedback from software engineers, product managers, designers, and other tech professionals about their workplace experiences.
            </p>
            <p className="text-gray-600 mb-4">
              Whether you're looking for information about work-life balance at major tech giants, salary expectations at startups, or career growth opportunities at mid-sized software companies, you'll find comprehensive reviews to guide your decision.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">What You'll Find</h3>
            <ul className="text-gray-600 space-y-2 mb-4">
              <li>• Detailed ratings on work-life balance, compensation, and company culture</li>
              <li>• Real experiences from current and former employees</li>
              <li>• Insights on interview processes and hiring practices</li>
              <li>• Information about benefits, perks, and remote work policies</li>
              <li>• Career growth and promotion opportunities</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPageDummy;
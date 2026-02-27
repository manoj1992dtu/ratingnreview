
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Code, DollarSign, Heart, Briefcase, ShoppingBag,
  Factory, Zap, Home, Truck, Film, Wifi, GraduationCap,
  Coffee, Wheat, Building2, Hammer, Pill, Scale, Megaphone,
  TrendingUp, ChevronRight, LucideIcon, Stethoscope, CreditCard,
  Shield, BarChart2, Calculator, Recycle, Flame, Battery, Wrench,
  Rocket, Star, RefreshCcw, User, Rainbow, Users, Leaf,
  Handshake, Beaker, Package, Plug, Gamepad, Landmark, Phone,
  Cpu, Lock, Cloud, Monitor, Globe, Dna, Building, Smartphone,
  Microscope, Dumbbell, Brush, Bitcoin, Sun,
  Sofa, Camera, Baby, Trophy, Music, Droplets,
  Gem, Link2 as LinkIcon, Umbrella, Calendar, Gift, Target, FileText,
  Clock, Mountain, Smile, Settings, TestTube, Plane, Box
} from 'lucide-react';
import { IndustryGroup, IndustryStats } from '@/services/industries';
import { getIconName, getIndustryColor, formatSearchVolume } from '@/lib/utils/industry-helpers';

// Comprehensive icon mapping
const iconComponents: Record<string, LucideIcon> = {
  Code, DollarSign, Heart, Briefcase, ShoppingBag, Factory, Zap,
  Home, Truck, Film, Wifi, GraduationCap, Coffee, Wheat,
  Building2, Hammer, Pill, Scale, Megaphone, TrendingUp, Stethoscope,
  CreditCard, Shield, BarChart2, Calculator, Recycle, Flame, Battery,
  Wrench, Rocket, Star, RefreshCcw, User, Rainbow, Users,
  Leaf, Handshake, Beaker, Package, Plug, Gamepad, Landmark, Phone,
  Cpu, Lock, Cloud, Monitor, Globe, Dna, Building, Smartphone,
  Microscope, Dumbbell, Brush, Bitcoin, Sun,
  Sofa, Camera, Baby, Trophy, Music, Droplets,
  Gem, LinkIcon, Umbrella, Calendar, Gift, Target, FileText,
  Clock, Mountain, Smile, Settings, TestTube, Plane, Box
};

interface AllIndustriesClientProps {
  industries: IndustryGroup[];
  stats: IndustryStats;
}

const AllIndustriesClient: React.FC<AllIndustriesClientProps> = ({ industries, stats }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter industries based on search
  const filteredIndustries = useMemo(() => {
    if (!searchQuery.trim()) return industries;

    return industries.map(group => ({
      ...group,
      industries: group.industries.filter(ind =>
        ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ind.description && ind.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })).filter(group => group.industries.length > 0);
  }, [industries, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Global <span className="text-indigo-400">Industry</span> Analysis
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-medium">
            Analyze authentic workplace metrics across every major economic industry. Compare cultural performance and compensation benchmarks to define your career trajectory.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 ring-1 ring-white/5 shadow-2xl">
              <Building2 className="h-8 w-8 mb-4 text-indigo-400" />
              <div className="text-4xl font-black text-white mb-1">{stats.totalCompanies.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registered Entities</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 ring-1 ring-white/5 shadow-2xl text-white">
              <TrendingUp className="h-8 w-8 mb-4 text-indigo-400" />
              <div className="text-4xl font-black mb-1">{stats.totalReviews.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Community Ratings</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 ring-1 ring-white/5 shadow-2xl text-white">
              <Briefcase className="h-8 w-8 mb-4 text-indigo-400" />
              <div className="text-4xl font-black mb-1">{stats.totalIndustries}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Industries</div>
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
                  const iconName = getIconName(industry.icon);
                  const IconComponent = iconComponents[iconName] || Briefcase;
                  const colorClass = getIndustryColor(industry.name);
                  const searchVolume = formatSearchVolume(industry.search_volume);

                  return (
                    <Link
                      key={industry.id}
                      href={`/categories/${industry.slug}`}
                      className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Icon and Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 ${colorClass} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-7 w-7" />
                        </div>
                        {searchVolume && (
                          <span className="text-xs bg-indigo-50 text-primary px-2 py-1 rounded-full font-medium">
                            {searchVolume}
                          </span>
                        )}
                      </div>

                      {/* Industry Name */}
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-primary transition-colors">
                        {industry.name}
                      </h3>

                      {/* Description */}
                      {industry.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {industry.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                        <div>
                          <span className="text-gray-500">{industry.company_count || 0} companies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">{industry.review_count || 0} reviews</span>
                        </div>
                      </div>

                      {/* Average Rating */}
                      {industry.avg_rating && industry.avg_rating > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                            <span className="text-sm font-semibold text-gray-900">{industry.avg_rating}</span>
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
      <section className="bg-indigo-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:24px_24px]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-black mb-6 tracking-tight">
            Help Others Navigate.
          </h2>
          <p className="text-xl text-indigo-100 mb-10 leading-relaxed font-medium">
            Missing an industry or specific workplace? Share your firsthand experience and help build the most transparent platform for your field.
          </p>
          <Link
            href="/review"
            className="inline-flex items-center bg-white text-indigo-600 px-10 py-5 rounded-3xl hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/20 font-black text-xl"
          >
            Start Your Review
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
            Industry Intelligence & Workforce Dynamics
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Decoding modern workplace culture requires more than just checking a rating. It demands a deep comparison of how specific industries prioritize employee well-being, compensation fairness, and operational transparency. Our multi-industry index allows for a granular view of these trends across diverse economic landscapes.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-12">
              From the high-intensity environments of financial modeling to the creative freedom of digital design agencies, we catalog thousands of unique viewpoints to establish what truly constitutes a "top workplace" in today's economy.
            </p>

            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Primary Focus Areas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <strong className="text-slate-900 font-bold block mb-2">Systems & Infrastructure:</strong>
                Analysis of software development standards, cloud computing hubs, and emerging AI tech stacks.
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <strong className="text-slate-900 font-bold block mb-2">Capital Markets:</strong>
                Workplace insights from banking giants, fintech disruptors, and asset management institutions.
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <strong className="text-slate-900 font-bold block mb-2">Clinical Life Sciences:</strong>
                Reviews covering hospital administration, pharmaceutical research, and medical innovation units.
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <strong className="text-slate-900 font-bold block mb-2">Strategic Consulting:</strong>
                Evaluation of operational efficiency and leadership growth within professional service firms.
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Our Analytical Framework</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-slate-700 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Verified Professional Contributions
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Granular Cultural Metrics
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Cross-Industry Benchmarking
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Real-Time Sentiment Analysis
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Identity Protection Protocols
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllIndustriesClient;

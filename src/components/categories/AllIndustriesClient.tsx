
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="pointer-events-none fixed left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl z-0" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-center">
            Global <span className="text-gradient">Industry</span> Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto text-center leading-relaxed">
            Analyze authentic workplace metrics across every major economic industry. Compare cultural performance and compensation benchmarks to define your career trajectory.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform duration-300">
              <Building2 className="h-8 w-8 mb-4 text-primary mx-auto" />
              <div className="text-4xl font-black text-foreground mb-1">{stats.totalCompanies.toLocaleString()}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Registered Entities</div>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform duration-300">
              <TrendingUp className="h-8 w-8 mb-4 text-primary mx-auto" />
              <div className="text-4xl font-black text-foreground mb-1">{stats.totalReviews.toLocaleString()}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Community Ratings</div>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform duration-300">
              <Briefcase className="h-8 w-8 mb-4 text-primary mx-auto" />
              <div className="text-4xl font-black text-foreground mb-1">{stats.totalIndustries}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Industries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative glass rounded-xl transition-all">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search industries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none text-lg text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {filteredIndustries.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8 pl-2 border-l-4 border-primary">
                {group.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.industries.map((industry) => {
                  const iconName = getIconName(industry.icon);
                  const IconComponent = iconComponents[iconName] || Briefcase;
                  const searchVolume = formatSearchVolume(industry.search_volume);

                  return (
                    <Link
                      key={industry.id}
                      href={`/industries/${industry.slug}`}
                      className="group glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Icon and Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {searchVolume && (
                          <span className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-md font-semibold">
                            {searchVolume} searches
                          </span>
                        )}
                      </div>

                      {/* Industry Name */}
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {industry.name}
                      </h3>

                      {/* Description */}
                      {industry.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                          {industry.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                          {industry.company_count || 0} companies
                        </span>

                        {industry.avg_rating && industry.avg_rating > 0 ? (
                          <div className="flex items-center gap-1 bg-warning/20 text-warning-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                            <span>{industry.avg_rating}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                            {industry.review_count || 0} reviews
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* No Results */}
          {filteredIndustries.length === 0 && (
            <div className="text-center py-20 glass rounded-2xl max-w-2xl mx-auto">
              <div className="text-muted-foreground mb-4">
                <Search className="h-16 w-16 mx-auto opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No industries found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search query to find what you're looking for.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10 text-center">
        <div className="glass-strong max-w-3xl mx-auto p-12 rounded-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
            Help Others Navigate.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Missing an industry or specific workplace? Share your firsthand experience and help build the most transparent platform for your field.
          </p>
          <div className="flex justify-center">
            <Link
              href="/review"
              className="inline-flex items-center bg-primary text-primary-foreground px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm hover:-translate-y-0.5 duration-200 text-lg"
            >
              Start Your Review
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-20 relative z-10 border-t border-border bg-card/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight text-center md:text-left">
            Industry Intelligence & Workforce Dynamics
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Decoding modern workplace culture requires more than just checking a rating. It demands a deep comparison of how specific industries prioritize employee well-being, compensation fairness, and operational transparency. Our multi-industry index allows for a granular view of these trends across diverse economic landscapes.
            </p>

            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-widest mt-12">Primary Focus Areas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative">
              <div className="glass p-6 rounded-2xl">
                <strong className="text-primary font-bold block mb-2">Systems & Infrastructure</strong>
                <span className="text-sm text-muted-foreground">Analysis of software development standards, cloud computing hubs, and emerging AI tech stacks.</span>
              </div>
              <div className="glass p-6 rounded-2xl">
                <strong className="text-primary font-bold block mb-2">Capital Markets</strong>
                <span className="text-sm text-muted-foreground">Workplace insights from banking giants, fintech disruptors, and asset management institutions.</span>
              </div>
              <div className="glass p-6 rounded-2xl">
                <strong className="text-primary font-bold block mb-2">Clinical Life Sciences</strong>
                <span className="text-sm text-muted-foreground">Reviews covering hospital administration, pharmaceutical research, and medical innovation units.</span>
              </div>
              <div className="glass p-6 rounded-2xl">
                <strong className="text-primary font-bold block mb-2">Strategic Consulting</strong>
                <span className="text-sm text-muted-foreground">Evaluation of operational efficiency and leadership growth within professional service firms.</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-widest text-center md:text-left">Our Analytical Framework</h3>
            <div className="glass p-8 rounded-2xl mb-8">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-muted-foreground text-sm font-medium">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Verified Professional Contributions
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Granular Cultural Metrics
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Cross-Industry Benchmarking
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Real-Time Sentiment Analysis
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Identity Protection Protocols
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllIndustriesClient;

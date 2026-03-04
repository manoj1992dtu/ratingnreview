'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Building2 } from 'lucide-react';
import { companyApi } from '@/services/api';
import type { CompanyPreview } from '@/types/company';
import CompanyCard from '@/components/CompanyCard';

const INDUSTRIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'E-commerce',
    'Education',
    'Manufacturing',
    'Consulting',
    'Other'
];

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<(CompanyPreview & { avgRating?: number; reviewCount?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [industry, setIndustry] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, [search, industry]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            // Using getFeaturedCompanies as it returns more metadata (ratings) than getCompanies
            // but we might need a more generic getter for the full list later.
            // For now, let's use getFeaturedCompanies with a high limit or modify getCompanies.
            const data = await companyApi.getFeaturedCompanies(50);

            let filtered = data;
            if (search) {
                filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
            }
            if (industry) {
                filtered = filtered.filter(c => c.industry === industry);
            }

            setCompanies(filtered);
        } catch (err) {
            console.error('Failed to fetch companies:', err);
            setError('Failed to load companies. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="bg-primary/5 border-b border-border py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                            Browse Companies
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Discover verified anonymous reviews and insights about the workplace culture,
                            salaries, and interview processes of top employers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters & Search */}
            <section className="sticky top-20 z-40 bg-background/80 backdrop-blur-md border-b border-border py-4 px-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search companies by name..."
                            className="w-full bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-12 pr-4 py-3 transition-all duration-200 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative min-w-[180px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                className="w-full bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-11 pr-4 py-3 appearance-none transition-all duration-200 outline-none"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                            >
                                <option value="">All Industries</option>
                                {INDUSTRIES.map(ind => (
                                    <option key={ind} value={ind}>{ind}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-muted px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {companies.length} Results
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 mt-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-muted-foreground font-medium animate-pulse">Loading companies...</p>
                    </div>
                ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-8 rounded-2xl text-center">
                        <p className="font-semibold text-lg mb-2">Oops! Something went wrong.</p>
                        <p>{error}</p>
                        <button
                            onClick={() => fetchCompanies()}
                            className="mt-4 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : companies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {companies.map((company) => (
                            <CompanyCard key={company.id} company={company} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/30 rounded-3xl border border-dashed border-border/100">
                        <Building2 className="w-16 h-16 text-muted-foreground/30 mb-6" />
                        <h3 className="text-2xl font-bold mb-3">No companies found</h3>
                        <p className="text-muted-foreground max-w-sm mb-8">
                            We couldn't find any companies matching your search filters.
                            Try adjusting your filters or search keywords.
                        </p>
                        <button
                            onClick={() => { setSearch(''); setIndustry(''); }}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

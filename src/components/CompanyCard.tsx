'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { CompanyPreview } from '../types/company';

interface CompanyCardProps {
    company: CompanyPreview & {
        avgRating?: number;
        reviewCount?: number;
        logo_url?: string;
    };
}

export default function CompanyCard({ company }: CompanyCardProps) {
    const { name, slug, industry, avgRating = 0, reviewCount = 0, logo_url } = company;

    return (
        <Link
            href={`/companies/${slug}`}
            className="group block bg-card hover:bg-accent/50 border border-border hover:border-primary/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
            <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border group-hover:border-primary/20 transition-colors">
                    {logo_url ? (
                        <Image
                            src={logo_url}
                            alt={`${name} logo`}
                            fill
                            className="object-contain p-2"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xl uppercase">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                            {name}
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 truncate">
                        {industry || 'Technology'}
                    </p>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex justify-end items-center text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
                View Reviews & Insights →
            </div>
        </Link>
    );
}

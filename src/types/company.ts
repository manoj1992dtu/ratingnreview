export interface Company {
    id: string; // UUID
    name: string;
    slug: string;
    industry?: string | null;
    headquarters?: string | null;
    employee_count?: string | null;
    website?: string | null;
    logo_url?: string | null;
    description?: string | null;
    overall_review?: string | null;
    avg_rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
}

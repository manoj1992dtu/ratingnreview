export interface Review {
    id: string; // UUID
    company_id: string; // UUID
    user_id?: string | null; // UUID
    is_anonymous: boolean;

    overall_rating: number; // 1-5
    work_life_balance?: number | null; // 1-5
    salary?: number | null; // 1-5
    promotions?: number | null; // 1-5
    job_security?: number | null; // 1-5
    skill_development?: number | null; // 1-5
    work_satisfaction?: number | null; // 1-5
    company_culture?: number | null; // 1-5

    designation?: string | null;
    department?: string | null;
    employment_type?: string | null;
    likes?: string | null;
    dislikes?: string | null;
    content?: string | null;

    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

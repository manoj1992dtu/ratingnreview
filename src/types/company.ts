
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim() // Remove leading/trailing spaces
}

export type CompanyReview = {
  id: string;
  company_id: string;
  user_id?: string;
  overall_rating: number;
  work_life_balance: number;
  salary: number;
  promotions: number;
  job_security: number;
  skill_development: number;
  work_satisfaction: number;
  company_culture: number;
  gender?: "Male" | "Female" | "Other" | string | null;
  work_policy: "Remote" | "Hybrid" | "On-site" | string;
  office_location?: string;
  currently_working: boolean;
  start_date?: { month: string; year: string };
  end_date?: { month: string; year: string } | null;
  designation?: string;
  employment_type: "Full-time" | "Part-time" | "Internship" | "Contract" | string;
  department?: string;
  likes?: string;
  dislikes?: string;
  is_anonymous: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  // companies?: Company;
};

export type Company  = {
  id?: string;
  slug: string; 
  name: string;
  industry?: string;
  headquarters?: string;
  employee_count?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  overall_review?: string;
  created_at: string;
  updated_at: string;
}

export type CompanyPreview = Pick<Company, "id" | "name" | "slug" | "industry">;


// Ratings shape
export interface CompanyRatings {
  overall: number;
  workLife: number;
  salary: number;
  promotions: number;
  jobSecurity: number;
  skillDevelopment: number;
  workSatisfaction: number;
  culture: number;
}

// Extend company with additional fields
export interface CompanyWithMeta extends Company {
  ratings: CompanyRatings;
  reviewCount: number;
}


// // Example Company type
// export type Company = {
//   id: string;
//   name: string;
//   logo_url?: string;
//   website?: string;
// };

export interface ReviewFilters {
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  filterRating: 'all' | '1' | '2' | '3' | '4' | '5';
}
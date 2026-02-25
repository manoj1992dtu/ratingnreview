import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Company {
  id?: string;
  slug: string; 
  name: string;
  industry?: string; // Keep for backward compatibility  
  headquarters?: string;
  employee_count?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  overall_review?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;  
}
export interface CompanyReview { id: string; company_id: string; user_id?: string; overall_rating: number; work_life_balance: number; salary: number; promotions: number; job_security: number; skill_development: number; work_satisfaction: number; company_culture: number; gender?: string; work_policy: string; office_location?: string; currently_working: boolean; start_date?: { month: string; year: string }; end_date?: { month: string; year: string }; designation?: string; employment_type: string; department?: string; likes?: string; dislikes?: string; is_anonymous: boolean; created_at: string; updated_at: string; companies?: Company; }
// export interface CompanyReview {
//   id: string;
//   company_id: string;
//   user_id?: string;

//   // Overall rating (required)
//   overall_rating: number; // 1-5

//   // Detailed ratings (all optional but recommended)
//   work_life_balance?: number;
//   salary?: number;
//   promotions?: number;
//   job_security?: number;
//   skill_development?: number;
//   work_satisfaction?: number;
//   company_culture?: number;
//   // management?: number; // Add this
//   // benefits?: number; // Add this
  
//   // Review content
//   // review_title?: string; // Add this
//   likes?: string; // Pros
//   dislikes?: string; // Cons
//   // advice?: string; // Advice to management
  

//   // Reviewer info
//   // gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
//   gender?:string
//   designation?: string;
//   department?: string;
//   employment_type: string
//   // employment_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  
//    // Work info
//   // work_policy: 'office' | 'remote' | 'hybrid';
//   work_policy: string;
//   office_location?: string;
//   currently_working: boolean;
//   start_date?: { month: string; year: string };
//   end_date?: { month: string; year: string };
//   tenure_months?: number; // Auto-calculated
  
//   // Metadata
//   is_anonymous: boolean;
//   // is_verified?: boolean;
//   // helpful_count?: number; // Denormalized count
//   // not_helpful_count?: number;
//   // status?: 'pending' | 'approved' | 'rejected'; // For moderation
  
//   created_at: string;
//   updated_at: string;

//   // Relationships
//   companies?: Company;
// }

export interface InterviewExperience {
  id: string;
  company_id: string;
  user_id?: string;
  overall_rating?: number;
  questions: string[];
  interview_timing?: string;
  process_duration?: string;
  difficulty?: string;
  offer_received?: string;
  advice?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  companies?: Company;
}

export interface ReviewHelpfulness {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_industry_id?: string| null;
  search_volume?: number;
  is_primary?: boolean;
  display_order?: number;
  meta_title?: string;
  meta_description?: string;
  company_count?: number;
  review_count?: number;
  avg_rating?: number;
  stats_updated_at: Date;
  created_at: string;
  updated_at: string;
}
// NEW: Junction table for many-to-many relationship
export interface CompanyIndustry {
  id: string;
  company_id: string;
  industry_id: string;
  is_primary: boolean; // Mark one industry as primary for the company
  display_order?: number; // Order of industries for this company
  created_at: string;
}

// Helper type for category page data
export interface IndustryWithStats extends Industry {
  company_count?: number;
  review_count?: number;
  avg_rating?: number;
}
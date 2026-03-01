import { generateSlug } from '../types/company';
import { supabase } from '../lib/supabase';
import type { Company, CompanyReview, InterviewExperience } from '../lib/supabase';
import type { CompanyWithMeta, CompanyPreview } from '../types/company';

// Company API
export const companyApi = {
  async isTableEmpty() {
    const { count, error } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Error checking table: ${error.message}`)
    }

    return count === 0
  },
  // Get all companies with search and filtering
  // async getCompanies(search?: string, industry?: string) {
  //   let query = supabase
  //     .from('companies')
  //     .select('*')
  //     .order('name');

  //   if (search) {
  //     query = query.ilike('name', `%${search}%`);
  //   }

  //   if (industry) {
  //     query = query.eq('industry', industry);
  //   }

  //   const { data, error } = await query;
  //   if (error) throw error;
  //   return data as Company[];
  // },
  async getCompanies(
    search?: string,
    industry?: string,
    fields: (keyof Company)[] = ["id", "name", "slug", "industry"]
  ): Promise<CompanyPreview[]> {
    try {
      let query = supabase
        .from("companies")
        .select(fields.join(","))
        .eq('status', 'published')
        .order("name");

      if (search) query = query.ilike("name", `%${search}%`);
      if (industry) query = query.eq("industry", industry);

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []) as unknown as CompanyPreview[];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  },
  async getFeaturedCompanies1() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
        id,
        name,
        slug,
        industry,
        website,
        logo_url,
        reviews:reviews(rating)
      `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      // Calculate average ratings and review counts
      return (data || []).map(company => ({
        ...company,
        avgRating: company.reviews.length > 0
          ? (company.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / company.reviews.length).toFixed(1)
          : 0,
        reviewCount: company.reviews.length
      }));
    } catch (error) {
      console.error('Error fetching featured companies:', error);
      return [];
    }
  },
  // Get company by ID with aggregated ratings
  // async getCompanyById(id: string) {
  //   const { data: company, error: companyError } = await supabase
  //     .from('companies')
  //     .select('*')
  //     .eq('id', id)
  //     .single();

  //   if (companyError) throw companyError;

  //   // Get aggregated ratings
  //   const { data: reviews, error: reviewsError } = await supabase
  //     .from('company_reviews')
  //     .select('overall_rating, work_life_balance, salary, promotions, job_security, skill_development, work_satisfaction, company_culture')
  //     .eq('company_id', id);

  //   if (reviewsError) throw reviewsError;

  //   const reviewCount = reviews.length;
  //   const avgRatings = reviews.reduce((acc, review) => {
  //     acc.overall += review.overall_rating;
  //     acc.workLife += review.work_life_balance;
  //     acc.salary += review.salary;
  //     acc.promotions += review.promotions;
  //     acc.jobSecurity += review.job_security;
  //     acc.skillDevelopment += review.skill_development;
  //     acc.workSatisfaction += review.work_satisfaction;
  //     acc.culture += review.company_culture;
  //     return acc;
  //   }, {
  //     overall: 0,
  //     workLife: 0,
  //     salary: 0,
  //     promotions: 0,
  //     jobSecurity: 0,
  //     skillDevelopment: 0,
  //     workSatisfaction: 0,
  //     culture: 0
  //   });

  //   const ratings = reviewCount > 0 ? {
  //     overall: Number((avgRatings.overall / reviewCount).toFixed(1)),
  //     workLife: Number((avgRatings.workLife / reviewCount).toFixed(1)),
  //     salary: Number((avgRatings.salary / reviewCount).toFixed(1)),
  //     promotions: Number((avgRatings.promotions / reviewCount).toFixed(1)),
  //     jobSecurity: Number((avgRatings.jobSecurity / reviewCount).toFixed(1)),
  //     skillDevelopment: Number((avgRatings.skillDevelopment / reviewCount).toFixed(1)),
  //     workSatisfaction: Number((avgRatings.workSatisfaction / reviewCount).toFixed(1)),
  //     culture: Number((avgRatings.culture / reviewCount).toFixed(1))
  //   } : {
  //     overall: 0,
  //     workLife: 0,
  //     salary: 0,
  //     promotions: 0,
  //     jobSecurity: 0,
  //     skillDevelopment: 0,
  //     workSatisfaction: 0,
  //     culture: 0
  //   };

  //   return {
  //     ...company,
  //     ratings,
  //     reviewCount
  //   };
  // },

  // async getCompanyBySlug(slug: string) {
  async getCompanyBySlug(slug: string): Promise<CompanyWithMeta> {

    const { data: company, error: companyError } = await supabase

      .from('companies')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (companyError) throw companyError;

    if (!company) throw new Error('Company not found');

    const companyId = company.id;

    // Get aggregated ratings
    const { data: reviews, error: reviewsError } = await supabase
      .from('company_reviews')
      .select('overall_rating, work_life_balance, salary, promotions, job_security, skill_development, work_satisfaction, company_culture')
      .eq('company_id', companyId)
      .eq('status', 'published');

    if (reviewsError) throw reviewsError;

    const reviewCount = reviews.length;
    const avgRatings = reviews.reduce((acc, review) => {
      acc.overall += review.overall_rating;
      acc.workLife += review.work_life_balance;
      acc.salary += review.salary;
      acc.promotions += review.promotions;
      acc.jobSecurity += review.job_security;
      acc.skillDevelopment += review.skill_development;
      acc.workSatisfaction += review.work_satisfaction;
      acc.culture += review.company_culture;
      return acc;
    }, {
      overall: 0,
      workLife: 0,
      salary: 0,
      promotions: 0,
      jobSecurity: 0,
      skillDevelopment: 0,
      workSatisfaction: 0,
      culture: 0
    });

    const ratings = reviewCount > 0 ? {
      overall: Number((avgRatings.overall / reviewCount).toFixed(1)),
      workLife: Number((avgRatings.workLife / reviewCount).toFixed(1)),
      salary: Number((avgRatings.salary / reviewCount).toFixed(1)),
      promotions: Number((avgRatings.promotions / reviewCount).toFixed(1)),
      jobSecurity: Number((avgRatings.jobSecurity / reviewCount).toFixed(1)),
      skillDevelopment: Number((avgRatings.skillDevelopment / reviewCount).toFixed(1)),
      workSatisfaction: Number((avgRatings.workSatisfaction / reviewCount).toFixed(1)),
      culture: Number((avgRatings.culture / reviewCount).toFixed(1))
    } : {
      overall: 0,
      workLife: 0,
      salary: 0,
      promotions: 0,
      jobSecurity: 0,
      skillDevelopment: 0,
      workSatisfaction: 0,
      culture: 0
    };

    return {
      ...company,
      ratings,
      reviewCount
    };
  },

  // Create or get existing company
  async createOrGetCompany(name: string, industry?: string) {
    try {
      // First try to find existing company
      const { data: existing, error: findError } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', name)
        .single();

      if (existing) {
        return existing as Company;
      }

      // Create new company if not found
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name,
          industry: industry || 'Technology'
        })
        .select()
        .single();

      if (error) throw error;
      return data as Company;
    } catch (error) {
      console.error('Error creating or getting company:', error);
      throw error; // Re-throw as this is a write-related operation
    }
  },
  async insertCompany(company: Omit<Company, 'created_at' | 'updated_at'>) {
    const companyData = {
      ...company,
      slug: company.slug || await generateSlug(company.name)
    }
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()

    if (error) {
      throw new Error(`Error inserting company: ${error.message}`)
    }

    return data[0]
  },

  // Get featured companies (most reviewed)
  async getFeaturedCompanies(limit = 8) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_reviews(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get ratings for each company
      const companiesWithRatings = await Promise.all(
        (data || []).map(async (company) => {
          try {
            const { data: reviews } = await supabase
              .from('company_reviews')
              .select('overall_rating')
              .eq('company_id', company.id)
              .eq('status', 'published');

            const reviewCount = reviews?.length || 0;
            const avgRating = reviews && reviewCount > 0
              ? Number((reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviewCount).toFixed(1))
              : 0;

            return {
              ...company,
              avgRating,
              reviewCount
            };
          } catch (e) {
            return {
              ...company,
              avgRating: 0,
              reviewCount: 0
            };
          }
        })
      );

      return companiesWithRatings;
    } catch (error) {
      console.error('Error fetching featured companies:', error);
      return [];
    }
  },

  async bulkInsertCompanies(companies: Omit<Company, 'id' | 'created_at' | 'updated_at'>[]) {
    const companiesWithSlugs = []

    for (const company of companies) {
      const companyWithSlug = {
        ...company,
        slug: company.slug || await generateSlug(company.name)
      }
      companiesWithSlugs.push(companyWithSlug)
    }
    const { data, error } = await supabase
      .from('companies')
      .insert(companiesWithSlugs)
      .select()

    if (error) {
      throw new Error(`Error bulk inserting companies: ${error.message}`)
    }

    return data
  }
};

// Reviews API
export const reviewsApi = {
  // Get reviews for a company
  // async getCompanyReviews(companyId: string, sortBy = 'newest', filterRating?: number) {
  //   let query = supabase
  //     .from('company_reviews')
  //     .select(`
  //       *,
  //       companies(name, industry)
  //     `)
  //     .eq('company_id', companyId);

  //   if (filterRating) {
  //     query = query.eq('overall_rating', filterRating);
  //   }

  //   // Apply sorting
  //   switch (sortBy) {
  //     case 'oldest':
  //       query = query.order('created_at', { ascending: true });
  //       break;
  //     case 'highest':
  //       query = query.order('overall_rating', { ascending: false });
  //       break;
  //     case 'lowest':
  //       query = query.order('overall_rating', { ascending: true });
  //       break;
  //     default:
  //       query = query.order('created_at', { ascending: false });
  //   }

  //   const { data, error } = await query;
  //   if (error) throw error;
  //   return data as CompanyReview[];
  // },

  async getCompanyReviewsBySlug(slug: string, sortBy = 'newest', filterRating?: number) {
    // Step 1: Fetch company_id using slug
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single();

    if (companyError) throw companyError;
    if (!company) throw new Error('Company not found');

    const companyId = company.id;

    // Step 2: Fetch reviews using company_id
    let query = supabase
      .from('company_reviews')
      .select(`
      *,
      companies(name, industry)
    `)
      .eq('company_id', companyId)
      .eq('status', 'published');

    if (filterRating) {
      query = query.eq('overall_rating', filterRating);
    }

    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'highest':
        query = query.order('overall_rating', { ascending: false });
        break;
      case 'lowest':
        query = query.order('overall_rating', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as CompanyReview[];
  },

  // Submit a company review
  async submitReview(reviewData: {
    companyName: string;
    overallRating: number;
    workLifeBalance: number;
    salary: number;
    promotions: number;
    jobSecurity: number;
    skillDevelopment: number;
    workSatisfaction: number;
    companyCulture: number;
    gender?: string;
    workPolicy: string;
    officeLocation?: string;
    currentlyWorking: boolean;
    startDate?: { month: string; year: string };
    endDate?: { month: string; year: string };
    designation?: string;
    employmentType: string;
    department?: string;
    likes?: string;
    dislikes?: string;
  }) {
    // First, create or get the company
    const company = await companyApi.createOrGetCompany(reviewData.companyName);

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Submit the review
    const { data, error } = await supabase
      .from('company_reviews')
      .insert({
        company_id: company.id,
        user_id: user?.id || null,
        overall_rating: reviewData.overallRating,
        work_life_balance: reviewData.workLifeBalance,
        salary: reviewData.salary,
        promotions: reviewData.promotions,
        job_security: reviewData.jobSecurity,
        skill_development: reviewData.skillDevelopment,
        work_satisfaction: reviewData.workSatisfaction,
        company_culture: reviewData.companyCulture,
        gender: reviewData.gender,
        work_policy: reviewData.workPolicy,
        office_location: reviewData.officeLocation,
        currently_working: reviewData.currentlyWorking,
        start_date: reviewData.startDate,
        end_date: reviewData.endDate,
        designation: reviewData.designation,
        employment_type: reviewData.employmentType,
        department: reviewData.department,
        likes: reviewData.likes,
        dislikes: reviewData.dislikes,
        is_anonymous: !user
      })
      .select()
      .single();

    if (error) throw error;
    return data as CompanyReview;
  },

  // Mark review as helpful
  async markReviewHelpful(reviewId: string, isHelpful: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('review_helpfulness')
      .upsert({
        review_id: reviewId,
        user_id: user.id,
        is_helpful: isHelpful
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get helpfulness count for a review
  async getReviewHelpfulness(reviewId: string) {
    const { data, error } = await supabase
      .from('review_helpfulness')
      .select('is_helpful')
      .eq('review_id', reviewId);

    if (error) throw error;

    const helpful = data.filter(h => h.is_helpful).length;
    const notHelpful = data.filter(h => !h.is_helpful).length;

    return { helpful, notHelpful, total: data.length };
  }
};

// Interview API
export const interviewApi = {
  // Get interview experiences for a company
  async getCompanyInterviews(companyId: string) {
    const { data, error } = await supabase
      .from('interview_experiences')
      .select(`
        *,
        companies(name, industry)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as InterviewExperience[];
  },

  // Submit interview experience
  async submitInterview(interviewData: {
    companyName: string;
    interviewRating?: number;
    interviewQuestions?: string[];
    interviewTiming?: string;
    processDuration?: string;
    difficulty?: string;
    offerReceived?: string;
    advice?: string;
  }) {
    // First, create or get the company
    const company = await companyApi.createOrGetCompany(interviewData.companyName);

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Submit the interview experience
    const { data, error } = await supabase
      .from('interview_experiences')
      .insert({
        company_id: company.id,
        user_id: user?.id || null,
        overall_rating: interviewData.interviewRating,
        questions: interviewData.interviewQuestions || [],
        interview_timing: interviewData.interviewTiming,
        process_duration: interviewData.processDuration,
        difficulty: interviewData.difficulty,
        offer_received: interviewData.offerReceived,
        advice: interviewData.advice,
        is_anonymous: !user
      })
      .select()
      .single();

    if (error) throw error;
    return data as InterviewExperience;
  }
};

// Authentication API
export const authApi = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign in with Google
  async signInWithGoogle(redirectTo = '/') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // redirectTo: `${window.location.origin}/auth/callback`
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`

      }
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
};
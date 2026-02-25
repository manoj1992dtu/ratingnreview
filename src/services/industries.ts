import { supabase } from '@/lib/supabase';
import type { IndustryWithStats } from '@/lib/supabase';

const INDUSTRY_SELECT_FIELDS = 'id, slug, name, is_primary, icon, description, review_count, company_count, avg_rating'
export interface IndustryGroup {
  category: string;
  isPrimary: boolean;
  industries: IndustryWithStats[];
}

export interface IndustryStats {
  totalCompanies: number;
  totalReviews: number;
  totalIndustries: number;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number; // Alternative to offset
}

export interface IndustriesResponse {
  data: IndustryWithStats[];
  total: number;
  hasMore: boolean;
  page?: number;
  limit?: number;
}

/**
 * Service: Get all industries with stats (paginated)
 * Use this for listing pages with pagination
 */
export async function getAllIndustries(
  options?: PaginationOptions & {
    primaryOnly?: boolean;
    withStats?: boolean; // Option to skip stats for better performance
  }
): Promise<IndustriesResponse> {
  try {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = options?.offset ?? (page - 1) * limit;
    const withStats = options?.withStats ?? true;

    // First, get total count
    let countQuery = supabase
      .from('industries')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (options?.primaryOnly) {
      countQuery = countQuery.eq('is_primary', true);
    }

    const { count: totalCount, error: countError } = await countQuery;
    if (countError) throw countError;

    // Then fetch paginated data
    let query = supabase
      .from('industries')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (options?.primaryOnly) {
      query = query.eq('is_primary', true);
    }

    const { data: industries, error: industriesError } = await query;
    if (industriesError) throw industriesError;

    // Optionally add stats




    return {
      data: industries,
      total: totalCount || 0,
      hasMore: offset + limit < (totalCount || 0),
      page,
      limit,
    };
  } catch (error) {
    console.error('Error fetching industries:', error);
    return {
      data: [],
      total: 0,
      hasMore: false,
      page: options?.page || 1,
      limit: options?.limit || 20,
    };
  }
}

/**
 * Service: Get a single industry with full stats by slug
 */
export async function getIndustry(slug: string): Promise<IndustryWithStats | null> {
  try {
    const { data: industry, error } = await supabase
      .from('industries')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !industry) {
      console.error('Error fetching industry:', error);
      return null;
    }
    return industry;

    // // Get company IDs for this industry
    // const { data: companyIndustries } = await supabase
    //   .from('company_industries')
    //   .select('company_id')
    //   .eq('industry_id', industry.id);

    // const companyIds = companyIndustries?.map(ci => ci.company_id) || [];
    // const companyCount = companyIds.length;

    // // Get review stats (only if there are companies)
    // let reviewCount = 0;
    // let avgRating = 0;

    // if (companyIds.length > 0) {
    //   const { data: reviewStats } = await supabase
    //     .from('company_reviews')
    //     .select('overall_rating')
    //     .in('company_id', companyIds);

    //   if (reviewStats && reviewStats.length > 0) {
    //     reviewCount = reviewStats.length;
    //     avgRating = reviewStats.reduce((sum, r) => sum + r.overall_rating, 0) / reviewStats.length;
    //   }
    // }

    // return {
    //   ...industry,
    //   company_count: companyCount,
    //   review_count: reviewCount,
    //   avg_rating: Math.round(avgRating * 10) / 10,
    // };
  } catch (error) {
    console.error('Error fetching industry by slug:', error);
    return null;
  }
}

/**
 * Service: Get companies for a specific industry (paginated)
 */
export async function getIndustryCompanies(
  industryId: string,
  options?: PaginationOptions & {
    primaryOnly?: boolean;
    orderBy?: 'name' | 'rating' | 'reviews' | 'display_order';
  }
) {
  try {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = options?.offset ?? (page - 1) * limit;

    // Get total count
    let countQuery = supabase
      .from('company_industries')
      .select('*', { count: 'exact', head: true })
      .eq('industry_id', industryId)
      .eq('is_active', true);

    if (options?.primaryOnly) {
      countQuery = countQuery.eq('is_primary', true);
    }

    const { count: totalCount } = await countQuery;

    // Get paginated companies
    let query = supabase
      .from('company_industries')
      .select(`
        company_id,
        is_primary,
        display_order,
        companies (
          id,
          slug,
          name,
          headquarters,
          employee_count,
          logo_url,
          description
        )
      `)
      .eq('industry_id', industryId)
      .eq('is_active', true)
      .range(offset, offset + limit - 1);

    if (options?.primaryOnly) {
      query = query.eq('is_primary', true);
    }

    // Only order by display_order at database level
    // We'll handle other sorting in memory
    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    let companies = (data || [])
      .map((ci: any) => ci.companies)
      .filter(Boolean);

    // If we need to sort by rating or reviews, fetch review stats
    const orderBy = options?.orderBy || 'display_order';

    if (orderBy === 'rating' || orderBy === 'reviews') {
      const companyIds = companies.map(c => c.id);

      if (companyIds.length > 0) {
        // Fetch review stats for these companies
        const { data: reviewStats } = await supabase
          .from('company_reviews')
          .select('company_id, overall_rating')
          .in('company_id', companyIds)
          .eq('is_active', true);


        // Calculate stats per company
        const statsMap = new Map<string, { count: number; avgRating: number }>();

        if (reviewStats) {
          reviewStats.forEach(review => {
            const existing = statsMap.get(review.company_id) || { count: 0, avgRating: 0 };
            existing.count += 1;
            existing.avgRating = ((existing.avgRating * (existing.count - 1)) + review.overall_rating) / existing.count;
            statsMap.set(review.company_id, existing);
          });
        }

        // Attach stats to companies
        companies = companies.map(company => ({
          ...company,
          review_count: statsMap.get(company.id)?.count || 0,
          avg_rating: statsMap.get(company.id)?.avgRating || 0,
        }));

        // Sort based on the stats
        if (orderBy === 'rating') {
          companies.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        } else if (orderBy === 'reviews') {
          companies.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        }
      }
    } else if (orderBy === 'name') {
      // Sort alphabetically by name
      companies.sort((a, b) => a.name.localeCompare(b.name));
    }
    // If orderBy === 'display_order', it's already sorted by the query

    return {
      data: companies,
      total: totalCount || 0,
      hasMore: offset + limit < (totalCount || 0),
      page,
      limit,
    };
  } catch (error) {
    console.error('Error fetching companies by industry:', error);
    return {
      data: [],
      total: 0,
      hasMore: false,
      page: options?.page || 1,
      limit: options?.limit || 20,
    };
  }
}

/**
 * Service: Group industries by primary/secondary (with limits)
 */
export async function getGroupedIndustries(options?: {
  primaryLimit?: number;
  secondaryLimit?: number;
}): Promise<IndustryGroup[]> {
  try {

    const primaryLimit = options?.primaryLimit || 10;
    const secondaryLimit = options?.secondaryLimit || 20;
    // Fetch primary industries
    const { data: primaryIndustries } = await getAllIndustries({
      limit: primaryLimit,
      primaryOnly: true,
      withStats: true,
    });

    // Fetch secondary industries
    const { data: secondaryIndustries } = await getAllIndustries({
      limit: secondaryLimit,
      primaryOnly: false,
      withStats: true,
    });

    return [
      {
        category: 'Popular Industries',
        isPrimary: true,
        industries: primaryIndustries,
      },
      {
        category: 'More Industries',
        isPrimary: false,
        industries: secondaryIndustries,
      },
    ].filter(group => group.industries.length > 0);
  } catch (error) {
    console.error('Error fetching grouped industries:', error);
    return [];
  }
}

/**
 * Service: Calculate total statistics across all industries
 * Cached for better performance
 */
export async function getIndustryStats(): Promise<IndustryStats> {
  try {
    // Run all counts in parallel for better performance
    const [companiesResult, reviewsResult, industriesResult] = await Promise.all([
      supabase
        .from('companies')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('company_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('industries')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
    ]);

    // For unique companies, we need to fetch and deduplicate   
    // const uniqueCompanyIds = [...new Set(companyIndustries?.map(ci => ci.company_id) || [])];


    return {
      totalCompanies: companiesResult.count || 0,
      totalReviews: reviewsResult.count || 0,
      totalIndustries: industriesResult.count || 0,
    };
  } catch (error) {
    console.error('Error fetching industry stats:', error);
    return {
      totalCompanies: 0,
      totalReviews: 0,
      totalIndustries: 0,
    };
  }
}

/**
 * Service: Get industries for a specific company
 */
export async function getCompanyIndustries(companyId: string) {
  try {
    const { data, error } = await supabase
      .from('company_industries')
      .select(`
        is_primary,
        display_order,
        industries (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('company_id', companyId)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true });

    if (error) throw error;

    return (data || []).map((ci: any) => ({
      ...ci.industries,
      is_primary: ci.is_primary,
    }));
  } catch (error) {
    console.error('Error fetching industries for company:', error);
    return [];
  }
}

/**
 * Service: Get primary industries for homepage (optimized, no stats)
 * This is fast because it doesn't calculate stats
 */
export async function getPrimaryIndustries(limit: number = 8) {
  try {
    const { data: industries, error } = await supabase
      .from('industries')
      .select(INDUSTRY_SELECT_FIELDS)
      .eq('is_primary', true)
      .order('display_order', { ascending: true })
      .limit(limit);

    if (error) throw error;


    return industries;
  } catch (error) {
    console.error('Error fetching primary industries:', error);
    return [];
  }
}

/**
 * Service: Get additional industries for homepage
 */
export async function getAdditionalIndustries(offset: number = 8, limit: number = 6) {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select(INDUSTRY_SELECT_FIELDS)
      .eq('is_primary', true)
      .order('display_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching additional industries:', error);
    return [];
  }
}

// export async function getSecondaryIndustries(offset: number = 0, limit: number = 6) {
//   try {
//     const { data, error } = await supabase
//       .from('industries')
//       .select('id, slug, name, is_primary, icon')
//       .eq('is_primary', false)
//       .order('display_order', { ascending: true })
//       .range(offset, offset + limit - 1);

//     if (error) throw error;
//     return data || [];
//   } catch (error) {
//     console.error('Error fetching additional industries:', error);
//     return [];
//   }
// }
/**
 * Service: Search industries by name (for autocomplete)
 */
export async function searchIndustries(query: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('id, slug, name, icon')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching industries:', error);
    return [];
  }
}

/**
 * Service: Get industries by IDs (bulk fetch)
 */
export async function getIndustriesByIds(ids: string[]) {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching industries by IDs:', error);
    return [];
  }
}

// import { 
//   getIndustriesWithStats, 
//   getGroupedIndustries as getGroupedIndustriesQuery,
//   getIndustryStats as getIndustryStatsQuery,
//   getIndustryBySlug,
//   getCompaniesByIndustry,
//   getIndustriesForCompany
// } from './industries-query';

// export type {
//   IndustryGroup,
//   IndustryStats
// } from './industries-query';

// export {
//   getIconName,
//   getIndustryColor,
//   formatSearchVolume
// } from './industries-query';

// /**
//  * Service: Get all industries with stats
//  */
// export async function getAllIndustries() {
//   return await getIndustriesWithStats();
// }

// /**
//  * Service: Get grouped industries (primary/secondary)
//  */
// export async function getGroupedIndustries() {
//   return await getGroupedIndustriesQuery();
// }

// /**
//  * Service: Get industry statistics
//  */
// export async function getIndustryStats() {
//   return await getIndustryStatsQuery();
// }

// /**
//  * Service: Get single industry by slug
//  */
// export async function getIndustry(slug: string) {
//   return await getIndustryBySlug(slug);
// }

// /**
//  * Service: Get companies for industry
//  */
// export async function getIndustryCompanies(
//   industryId: string,
//   options?: {
//     limit?: number;
//     offset?: number;
//     primaryOnly?: boolean;
//   }
// ) {
//   return await getCompaniesByIndustry(industryId, options);
// }

// /**
//  * Service: Get industries for company
//  */
// export async function getCompanyIndustries(companyId: string) {
//   return await getIndustriesForCompany(companyId);
// }

// lib/queries/industries.ts
import { supabase } from '@/lib/supabase';
import { Industry, IndustryWithStats } from '@/lib/supabase';

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

/**
 * Fetch all industries with their statistics
 */
export async function getIndustriesWithStats(): Promise<IndustryWithStats[]> {
  try {
    // Fetch industries with company count via junction table
    const { data: industries, error: industriesError } = await supabase
      .from('industries')
      .select(`
        *,
        company_industries!inner(
          company_id
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (industriesError) throw industriesError;

    // For each industry, fetch review stats
    const industriesWithStats = await Promise.all(
      (industries || []).map(async (industry) => {
        // Get unique company IDs for this industry
        const companyIds = Array.isArray(industry.company_industries)
          ? [...new Set(industry.company_industries.map((ci: any) => ci.company_id))]
          : [];

        const companyCount = companyIds.length;

        // Get review count and average rating for companies in this industry
        let reviewCount = 0;
        let avgRating = 0;

        if (companyIds.length > 0) {
          const { data: reviewStats, error: reviewError } = await supabase
            .from('company_reviews')
            .select('overall_rating')
            .in('company_id', companyIds)
            .eq('is_active', true);

          if (reviewError) {
            console.error('Error fetching reviews:', reviewError);
          } else if (reviewStats && reviewStats.length > 0) {
            reviewCount = reviewStats.length;
            avgRating = reviewStats.reduce((sum, r) => sum + r.overall_rating, 0) / reviewStats.length;
          }
        }

        // Remove the junction table data from the response
        const { company_industries, ...industryData } = industry;

        return {
          ...industryData,
          company_count: companyCount,
          review_count: reviewCount,
          avg_rating: Math.round(avgRating * 10) / 10,
        };
      })
    );

    return industriesWithStats;
  } catch (error) {
    console.error('Error fetching industries with stats:', error);
    return [];
  }
}

/**
 * Get a single industry with its stats by slug
 */
export async function getIndustryBySlug(slug: string): Promise<IndustryWithStats | null> {
  try {
    const { data: industry, error } = await supabase
      .from('industries')
      .select(`
        *,
        company_industries!inner(
          company_id
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !industry) {
      console.error('Error fetching industry:', error);
      return null;
    }

    // Get unique company IDs for this industry
    const companyIds = Array.isArray(industry.company_industries)
      ? [...new Set(industry.company_industries.map((ci: any) => ci.company_id))]
      : [];

    const companyCount = companyIds.length;

    // Get review stats
    let reviewCount = 0;
    let avgRating = 0;

    if (companyIds.length > 0) {
      const { data: reviewStats } = await supabase
        .from('company_reviews')
        .select('overall_rating')
        .in('company_id', companyIds)
        .eq('is_active', true);

      if (reviewStats && reviewStats.length > 0) {
        reviewCount = reviewStats.length;
        avgRating = reviewStats.reduce((sum, r) => sum + r.overall_rating, 0) / reviewStats.length;
      }
    }

    const { company_industries, ...industryData } = industry;

    return {
      ...industryData,
      company_count: companyCount,
      review_count: reviewCount,
      avg_rating: Math.round(avgRating * 10) / 10,
    };
  } catch (error) {
    console.error('Error fetching industry by slug:', error);
    return null;
  }
}

/**
 * Get companies for a specific industry
 */
export async function getCompaniesByIndustry(
  industryId: string,
  options?: {
    limit?: number;
    offset?: number;
    primaryOnly?: boolean;
  }
) {
  try {
    let query = supabase
      .from('company_industries')
      .select(`
        company_id,
        is_primary,
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
      .order('display_order', { ascending: true });

    if (options?.primaryOnly) {
      query = query.eq('is_primary', true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Extract companies from the junction table results
    return (data || [])
      .map((ci: any) => ci.companies)
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching companies by industry:', error);
    return [];
  }
}

/**
 * Group industries by primary/secondary
 */
export async function getGroupedIndustries(): Promise<IndustryGroup[]> {
  const industries = await getIndustriesWithStats();

  const primaryIndustries = industries.filter(ind => ind.is_primary);
  const secondaryIndustries = industries.filter(ind => !ind.is_primary);

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
}

/**
 * Calculate total statistics across all industries
 */
export async function getIndustryStats(): Promise<IndustryStats> {
  try {
    // Get total unique companies across all industries
    const { data: companyIndustries, error: ciError } = await supabase
      .from('company_industries')
      .select('company_id');

    if (ciError) throw ciError;

    const uniqueCompanyIds = [...new Set(companyIndustries?.map(ci => ci.company_id) || [])];
    const totalCompanies = uniqueCompanyIds.length;

    // Get total reviews
    const { count: totalReviews, error: reviewError } = await supabase
      .from('company_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (reviewError) throw reviewError;

    // Get total industries
    const { count: totalIndustries, error: industryError } = await supabase
      .from('industries')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (industryError) throw industryError;

    return {
      totalCompanies,
      totalReviews: totalReviews || 0,
      totalIndustries: totalIndustries || 0,
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
 * Get industries for a specific company
 */
export async function getIndustriesForCompany(companyId: string) {
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
 * Map icon names from database to actual icon components
 */
export function getIconName(iconString?: string): string {
  const iconMap: Record<string, string> = {
    'code': 'Code',
    'building-2': 'Building2',
    'dollar-sign': 'DollarSign',
    'shopping-bag': 'ShoppingBag',
    'graduation-cap': 'GraduationCap',
    'briefcase': 'Briefcase',
    'megaphone': 'Megaphone',
    'factory': 'Factory',
    'hammer': 'Hammer',
    'film': 'Film',
    'truck': 'Truck',
    'coffee': 'Coffee',
    'box': 'Box',
    'zap': 'Zap',
    'home': 'Home',
    'wifi': 'Wifi',
    'phone': 'Phone',
    'plane': 'Plane',
    'cpu': 'Cpu',
    'lock': 'Lock',
    'cloud': 'Cloud',
    'monitor': 'Monitor',
    'globe': 'Globe',
    'pill': 'Pill',
    'dna': 'Dna',
    'stethoscope': 'Stethoscope',
    'smartphone': 'Smartphone',
    'building': 'Building',
    'credit-card': 'CreditCard',
    'shield': 'Shield',
    'wheat': 'Wheat',
    'bar-chart-2': 'BarChart2',
    'calculator': 'Calculator',
    'recycle': 'Recycle',
    'flame': 'Flame',
    'battery': 'Battery',
    'wrench': 'Wrench',
    'rocket': 'Rocket',
    'star': 'Star',
    'refresh-ccw': 'RefreshCcw',
    'user': 'User',
    'rainbow': 'Rainbow',
    'users': 'Users',
    'paw-print': 'PawPrint',
    'leaf': 'Leaf',
    'handshake': 'Handshake',
    'beaker': 'Beaker',
    'package': 'Package',
    'plug': 'Plug',
    'gamepad': 'Gamepad',
    'scale': 'Scale',
    'landmark': 'Landmark',
    'thread': 'Thread',
    'microscope': 'Microscope',
    'broom': 'Broom',
    'heart': 'Heart',
    'dumbbell': 'Dumbbell',
    'brush': 'Brush',
    'bitcoin': 'Bitcoin',
    'sun': 'Sun',
    'tooth': 'Tooth',
    'party-popper': 'PartyPopper',
    'sofa': 'Sofa',
    'camera': 'Camera',
    'baby': 'Baby',
    'trophy': 'Trophy',
    'music': 'Music',
    'droplets': 'Droplets',
    'feather': 'Feather',
    'gem': 'Gem',
    'link': 'Link',
    'umbrella': 'Umbrella',
    'calendar': 'Calendar',
    'gift': 'Gift',
    'trending-up': 'TrendingUp',
    'target': 'Target',
    'file-text': 'FileText',
    'clock': 'Clock',
    'school': 'School',
    'store': 'Store',
    'mountain': 'Mountain',
    'smile': 'Smile',
    'bridge': 'Bridge',
    'medal': 'Medal',
    'accessibility': 'Accessibility',
    'settings': 'Settings',
    'test-tube': 'TestTube'
  };

  return iconMap[iconString || ''] || 'Briefcase';
}

/**
 * Get color classes based on industry name or a hash
 */
export function getIndustryColor(industryName: string): string {
  const colors = [
    'bg-indigo-100 text-primary',
    'bg-green-100 text-green-600',
    'bg-red-100 text-red-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-gray-100 text-gray-600',
    'bg-yellow-100 text-yellow-600',
    'bg-indigo-100 text-indigo-600',
    'bg-orange-100 text-orange-600',
    'bg-rose-100 text-rose-600',
    'bg-cyan-100 text-cyan-600',
    'bg-teal-100 text-teal-600',
    'bg-amber-100 text-amber-600',
    'bg-lime-100 text-lime-600',
    'bg-emerald-100 text-emerald-600',
    'bg-slate-100 text-slate-600',
    'bg-sky-100 text-sky-600',
    'bg-violet-100 text-violet-600',
    'bg-fuchsia-100 text-fuchsia-600',
  ];

  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < industryName.length; i++) {
    hash = industryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Format search volume for display
 */
export function formatSearchVolume(volume?: number): string | null {
  if (!volume) return null;

  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K/mo`;
  }

  return `${volume}/mo`;
}
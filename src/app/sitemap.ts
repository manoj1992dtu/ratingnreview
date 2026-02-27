import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'
import { generateSlug } from '../types/company'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const revalidate = 3600; // 1 hour in seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extend timeout to 60 seconds

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratingnreviews.com'

  try {
    const chunkSize = 1000
    let allCompanies: any[] = []
    let allIndustries: any[] = []

    // Fetch all companies in chunks using stable pagination
    let hasMore = true
    let offset = 0

    while (hasMore) {
      const { data, error } = await supabase
        .from('companies')
        .select('slug, updated_at')
        .eq('status', 'published') // ✅ filter active companies
        .order('id', { ascending: true }) // Use primary key for stable ordering
        .range(offset, offset + chunkSize - 1)

      if (error) {
        console.error('Error fetching companies:', error)
        break; // Don't throw, just stop fetching
      }

      if (!data || data.length === 0) break

      allCompanies = allCompanies.concat(data)
      offset += chunkSize
      hasMore = data.length === chunkSize

      // Safety limit to prevent infinite loops
      if (allCompanies.length > 50000) {
        console.warn('Reached 50k company limit for sitemap')
        break;
      }
    }

    // Fetch all industries
    const { data: industries, error: industryError } = await supabase
      .from('industries')
      .select('slug, updated_at')
      .eq('is_active', true) // ✅ filter active companies
      .order('id', { ascending: true })

    if (industryError) {
      console.error('Error fetching industries:', industryError)
    } else if (industries) {
      allIndustries = industries
    }

    console.log(`Sitemap generated: ${allCompanies.length} companies, ${allIndustries.length} industries`)

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/industries`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
    ]

    // Company routes
    const companyRoutes: MetadataRoute.Sitemap = allCompanies.map((company) => ({
      url: `${baseUrl}/companies/${generateSlug(company.slug)}`,
      lastModified: new Date(company.updated_at || new Date()),
      changeFrequency: 'daily',
      priority: 0.8,
    }))

    // Industry routes
    const industryRoutes: MetadataRoute.Sitemap = allIndustries.map((industry) => ({
      url: `${baseUrl}/industries/${generateSlug(industry.slug)}`,
      lastModified: new Date(industry.updated_at || new Date()),
      changeFrequency: 'daily',
      priority: 0.7,
    }))

    return [...staticRoutes, ...companyRoutes, ...industryRoutes]

  } catch (error) {
    console.error('Sitemap generation failed:', error)

    // Return minimal sitemap on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ]
  }
}
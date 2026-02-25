import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '../../types/company'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Enable ISR caching
export const revalidate = 43200 // 12 hours

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratingnreview.com'
  const chunkSize = 1000
  let from = 0
  let allCompanies: any[] = []

  while (true) {
    const { data, error } = await supabase
      .from('companies')
      .select('slug, updated_at')
      .order('updated_at', { ascending: true })
      .range(from, from + chunkSize - 1)

    if (error) throw error
    if (!data || data.length === 0) break
    allCompanies = allCompanies.concat(data)
    if (data.length < chunkSize) break
    from += chunkSize
  }

  // 📌 Control how many companies to show
  const releaseCount = 1623
  const releaseStart = new Date('2025-09-16')
  const daysPassed = Math.floor(
    (Date.now() - releaseStart.getTime()) / (1000 * 60 * 60 * 24)
  )
  const maxCompaniesToShow = Math.max(releaseCount + daysPassed * 20,2124);
  const limitedCompanies = allCompanies.slice(0, maxCompaniesToShow)

  // Build XML
  const urls = [
    {
      loc: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0',
    },
    ...limitedCompanies.map((company) => ({
      loc: `${baseUrl}/employers/${generateSlug(company.slug)}-reviews`,
      lastmod: new Date(company.updated_at).toISOString(),
      changefreq: 'weekly',
      priority: '0.6',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `<url>
  <loc>${u.loc}</loc>
  <lastmod>${u.lastmod}</lastmod>
  <changefreq>${u.changefreq}</changefreq>
  <priority>${u.priority}</priority>
</url>`
  )
  .join('\n')}
</urlset>`
  console.log(`sitemap.xml/route.ts ${limitedCompanies.length}`)
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=43200', // 12h edge cache
    },
  })
}

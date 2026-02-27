import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratingnreviews.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/auth/', '/api/', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}

import { supabaseAdmin } from './supabaseAdmin';

export async function scrapeCompany(companyName: string) {
    console.log(`Starting scrape for company: ${companyName}`);

    // 1. Google Places Integration (Mocked or actual depending on API key)
    const placesData = await fetchGooglePlacesData(companyName);

    // 2. Crunchbase Integration (Mocked or actual depending on API key)
    const crunchbaseData = await fetchCrunchbaseData(companyName);

    const mergedData = {
        name: placesData.name || companyName,
        slug: generateSlug(placesData.name || companyName),
        headquarters: placesData.address || crunchbaseData.location,
        website: placesData.website || crunchbaseData.website,
        employee_count: crunchbaseData.employeeCount,
        avg_rating: placesData.rating || 0,
        review_count: placesData.userRatingsTotal || 0,
    };

    console.log(`Merged data for ${companyName}:`, mergedData);

    // 3. Upsert to Supabase
    const { data, error } = await supabaseAdmin
        .from('companies')
        .upsert(mergedData, { onConflict: 'slug' })
        .select()
        .single();

    if (error) {
        console.error('Error upserting company:', error);
        throw error;
    }

    console.log('Successfully saved company to database:', data.id);
    return data;
}

// Helper: Generate a URL-friendly slug
function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Helper: Google Places (Placeholder)
async function fetchGooglePlacesData(query: string) {
    const USE_MOCK = process.env.NODE_ENV === 'development';
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (USE_MOCK || !apiKey || apiKey === 'your-google-places-key') {
        console.warn('Google Places API key missing. Returning mocked data.');
        return {
            name: query,
            address: '123 Fake Street, Tech City',
            website: `https://www.${generateSlug(query)}.com`,
            rating: +(Math.random() * (5 - 3) + 3).toFixed(1), // Random rating between 3 and 5
            userRatingsTotal: Math.floor(Math.random() * 500) + 10,
        };
    }

    // TODO: Actual implementation using fetch() to Google Places API
    console.warn('Real Google Places fetching not yet implemented');
    return {};
}

// Helper: Crunchbase (Placeholder)
async function fetchCrunchbaseData(query: string) {
    const USE_MOCK = process.env.NODE_ENV === 'development';
    const apiKey = process.env.CRUNCHBASE_API_KEY;
    if (USE_MOCK || !apiKey || apiKey === 'your-crunchbase-key') {
        console.warn('Crunchbase API key missing. Returning mocked data.');
        const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '10000+'];
        return {
            location: 'San Francisco, CA',
            website: `https://www.${generateSlug(query)}.com`,
            employeeCount: sizes[Math.floor(Math.random() * sizes.length)],
        };
    }

    // TODO: Actual implementation using fetch() to Crunchbase API
    console.warn('Real Crunchbase fetching not yet implemented');
    return {};
}

// If run directly via CLI
if (require.main === module) {
    const companyToScrape = process.argv[2];
    if (!companyToScrape) {
        console.error('Please provide a company name as an argument. Example: npx tsx scripts/engine/scraper.ts "Google"');
        process.exit(1);
    }

    scrapeCompany(companyToScrape)
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}

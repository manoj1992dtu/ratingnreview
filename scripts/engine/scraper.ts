import { GoogleGenerativeAI } from '@google/generative-ai';
import slugify from 'slugify';
import { supabaseAdmin } from './supabaseAdmin';
import { logger } from './logger';

// 1. Setup Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    logger.error("GEMINI_API_KEY is missing from environment variables.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
// Need to use gemini-pro instead of the new flash model which gives 404 in this SDK version
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// 2. Define the exact structure we expect from Gemini
interface ScrapedCompanyData {
    name: string;
    industry: string;
    headquarters: string;
    india_headquarters: string | null;
    india_presence: 'indian_company' | 'india_office' | 'no_india_presence';
    city: string | null;
    state: string | null;
    country: string;
    employee_count: string;
    india_employee_count: string | null;
    website: string;
    description: string;
    ceo_name: string | null;
    founded_year: number | null;
    company_type: string;
    revenue: string | null;
    competitors: string[];
}

// We now use `scrape_queue` table instead of a hardcoded initial seed array
// See supabase/migrations/0007_create_scrape_queue.sql

// Helper: Pause execution to prevent Rate Limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function validateScrapedData(data: Partial<ScrapedCompanyData>): boolean {
    if (!data.name) return false;
    if (!data.industry) return false;
    if (!data.headquarters) return false;
    if (!data.description) return false;
    return true;
}

// Helper: Check if URL returns valid image
async function urlExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok && !!response.headers.get('content-type')?.includes('image');
    } catch {
        return false;
    }
}

// Helper: Check if a company's website actually resolves
async function checkWebsiteValid(url: string): Promise<boolean> {
    try {
        // Use a generic User-Agent since many firewalls block default fetch user-agents
        const response = await fetch(url, {
            method: 'HEAD',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        // Consider it "valid" if the server responds at all (even a 403 Forbidden means the site exists)
        return response.status < 500;
    } catch {
        return false; // DNS failure, connection refused, etc.
    }
}

async function getCompanyLogo(company: {
    domain: string;
    name: string;
    slug: string;
}): Promise<string | null> {
    // Priority 1: Clearbit (primary)
    const clearbitUrl = `https://logo.clearbit.com/${company.domain}`;
    if (await urlExists(clearbitUrl)) {
        return clearbitUrl;
    }

    // Priority 2: Google S2 Favicon Service (fallback)
    const googleUrl = `https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`;
    if (await urlExists(googleUrl)) {
        return googleUrl;
    }

    // Priority 3: Company website directly
    const directUrl = `https://${company.domain}/favicon.ico`;
    if (await urlExists(directUrl)) {
        return directUrl;
    }

    // Return null to let the frontend handle the placeholder
    return null;
}

async function fetchCompanyMetadata(companyName: string, knownWebsite: string | null): Promise<ScrapedCompanyData | null> {
    const prompt = `
Return factual metadata for the company: "${companyName}".
${knownWebsite ? `Use this as the official known website context: ${knownWebsite}` : ''}
This is for a company review platform focused on the Indian job market.

Respond ONLY in raw JSON with no markdown formatting.
No backticks. No explanation. JSON only.

Required fields:
{
  "name": "official company name",
  "industry": "primary industry sector",
  "headquarters": "global headquarters full address",
  "india_headquarters": "India HQ address if india_presence is india_office, main HQ if indian_company, null if no_india_presence",
  "city": "primary city (India city if has India office, else global HQ city)",
  "state": "state name (Indian state if applicable, else null)",
  "country": "India for Indian companies, actual country for foreign MNCs",
  "india_presence": "one of: indian_company, india_office, no_india_presence",
  "employee_count": "global employee count range like 10,000-50,000",
  "india_employee_count": "India-specific employee count or null",
  "website": "official website URL",
  "description": "Generate a 2-paragraph company overview for Indian professionals:\n\nParagraph 1: Company background (founding, mission, core products/services, market position, company size, notable achievements)\n\nParagraph 2: Indian professional perspective - Adapt based on company presence: (a) India operations: office locations, team size, work culture, employee benefits, career growth; (b) Remote/global: remote opportunities, virtual culture, compensation approach; (c) India-based: market leadership, work environment, competitive edge. Always conclude with why Indian professionals join/consider this company."

  "ceo_name": "India MD or Country Head name (global CEO if no India head)",
  "founded_year": 2000,
  "company_type": "one of: Indian Private, Indian Public Listed, PSU, MNC, Startup, Unicorn",
  "revenue": "India revenue if available, else global approximate revenue",
  "competitors": ["top 3 direct competitors in Indian market specifically"]
}

Rules:
- Return null for any field you are not confident about
- Never hallucinate or invent data
- Prioritize Indian market context over global
- For MNCs always focus on India operations
- For Indian IT companies use Indian headquarters
- competitors must be relevant to Indian market
- description must mention Indian work culture context
- founded_year must be integer not string
    `;

    try {
        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();

        // Safety net: in case Gemini ignores instructions and applies markdown anyway
        if (rawText.startsWith('```json')) {
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (rawText.startsWith('```')) {
            rawText = rawText.replace(/```/g, '').trim();
        }

        const data: Partial<ScrapedCompanyData> = JSON.parse(rawText);

        if (!validateScrapedData(data)) {
            logger.error(`[Validation Failed for ${companyName}]: Incomplete profile.`);
            return null;
        }

        return data as ScrapedCompanyData;

    } catch (error) {
        logger.error(`[AI Error for ${companyName}]: Failed to generate or parse JSON.`);
        console.error(error);
        return null;
    }
}

async function scrapeMetadata() {
    logger.info(`Starting Scraper Pipeline connected to scrape_queue...`);

    // Verify database connection before starting the pipeline
    const { error: pingError } = await supabaseAdmin.from('companies').select('id').limit(1);
    if (pingError) {
        logger.error(`Database connection failed: ${pingError.message || JSON.stringify(pingError)}`);
        logger.error(`Aborting scraper to avoid unused Gemini API calls. Please ensure the Supabase instance is running.`);
        process.exit(1);
    }
    // AUTO-THROTTLE CHECK
    // If we already have 10+ companies in "draft" status, we don't need to scrape more right now.
    // This keeps the pipeline lean and avoids building a massive un-processed backlog.
    const { count, error: countError } = await supabaseAdmin
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

    if (countError) {
        logger.error(`Failed to check existing draft count: ${countError.message}`);
    } else if (count !== null && count >= 10) {
        logger.info(`Auto-Throttle: Already have ${count} companies in 'draft' status. Skipping scrape run.`);
        return;
    }

    // IMPLEMENTING SEO BARBELL STRATEGY
    // We want 2 Giants (Priority 8-10) and 5 Niche companies (Priority 1-2)

    // 1. Fetch 2 Giants
    const { data: giants, error: giantsError } = await supabaseAdmin
        .from('scrape_queue')
        .select('id, company_name, slug, priority, website')
        .eq('status', 'pending')
        .gte('priority', 8)
        .order('priority', { ascending: false })
        .limit(2);

    // 2. Fetch 5 Niche
    const { data: niche, error: nicheError } = await supabaseAdmin
        .from('scrape_queue')
        .select('id, company_name, slug, priority, website')
        .eq('status', 'pending')
        .lte('priority', 2)
        .order('priority', { ascending: true })
        .limit(5);

    if (giantsError || nicheError) {
        logger.error(`Failed to fetch pending companies: ${giantsError?.message || nicheError?.message}`);
        process.exit(1);
    }

    const queueItems = [...(giants || []), ...(niche || [])];

    if (queueItems.length === 0) {
        logger.info(`scrape_queue has no pending companies matching the strategy. Nothing to process.`);
        return;
    }

    // Mark these as 'in_progress' so they aren't double-processed if multiple scrapers run
    const idsToMark = queueItems.map(q => q.id);
    await supabaseAdmin
        .from('scrape_queue')
        .update({ status: 'in_progress' })
        .in('id', idsToMark);

    logger.info(`Strategy check: Fetched ${giants?.length || 0} Giants and ${niche?.length || 0} Niche companies.`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const item of queueItems) {
        const company = item.company_name;
        // The slug was generated during seeding to guarantee exact duplicate catching
        const tempSlug = item.slug;

        const { data: existing, error: selectError } = await supabaseAdmin
            .from('companies')
            .select('id')
            .eq('slug', tempSlug)
            .single();

        // PGRST116 means zero rows found, which is expected for new companies.
        if (selectError && selectError.code !== 'PGRST116') {
            logger.error(`Database Error for ${company} during existence check: ${selectError.message || JSON.stringify(selectError)}`);
            process.exit(1);
        }

        if (existing) {
            logger.warn(`Skipping "${company}" - Already exists in database so marking queue as completed.`);
            await supabaseAdmin.from('scrape_queue').update({ status: 'completed' }).eq('id', item.id);
            skippedCount++;
            continue;
        }

        // --- NEW LOGIC: Pre-validation of Seed Website ---
        if (item.website) {
            const siteUrl = item.website.startsWith('http') ? item.website : `https://${item.website}`;
            logger.info(`Pinging seeded website for ${company}: ${siteUrl}...`);
            const isValid = await checkWebsiteValid(siteUrl);

            if (!isValid) {
                logger.warn(`Skipping "${company}" - Website (${siteUrl}) is dead/inactive. Deactivating in queue.`);
                await supabaseAdmin.from('scrape_queue').update({
                    status: 'website_inactive',
                    notes: 'Website appears inactive or dead during pre-scrape check'
                }).eq('id', item.id);
                skippedCount++;
                continue;
            }
        }
        // ------------------------------------------------

        logger.info(`Fetching AI metadata for: ${company}...`);
        const extractedData = await fetchCompanyMetadata(company, item.website || null);

        if (!extractedData) {
            await supabaseAdmin.from('scrape_queue').update({ status: 'failed' }).eq('id', item.id);
            errorCount++;
            continue;
        }

        const finalSlug = tempSlug;

        let finalWebsite = extractedData.website;
        let siteUrlForLogo = null;
        let logoUrl = null;

        if (finalWebsite) {
            try {
                const siteUrl = finalWebsite.startsWith('http') ? finalWebsite : `https://${finalWebsite}`;
                const isValid = await checkWebsiteValid(siteUrl);

                if (isValid) {
                    finalWebsite = siteUrl; // Save the verified, fully-qualified URL
                    siteUrlForLogo = siteUrl;
                } else {
                    logger.warn(`Website ${siteUrl} appears dead or invalid. Scrubbing URL to protect user experience.`);
                    finalWebsite = ""; // Still list the company, just don't link to a dead site
                }
            } catch (e) {
                finalWebsite = "";
            }
        }

        if (siteUrlForLogo) {
            try {
                const hostname = new URL(siteUrlForLogo).hostname.replace('www.', '');
                logoUrl = await getCompanyLogo({
                    domain: hostname,
                    name: extractedData.name,
                    slug: finalSlug
                });
            } catch (e) {
                // Ignore URL parsing errors
            }
        }

        const payload = {
            name: extractedData.name,
            slug: finalSlug,
            industry: extractedData.industry,
            headquarters: extractedData.headquarters,
            india_presence: extractedData.india_presence || 'indian_company',
            india_headquarters: extractedData.india_headquarters,
            india_employee_count: extractedData.india_employee_count,
            city: extractedData.city,
            state: extractedData.state,
            country: extractedData.country,
            employee_count: extractedData.employee_count,
            website: finalWebsite,
            logo_url: logoUrl,
            description: extractedData.description,
            ceo_name: extractedData.ceo_name,
            founded_year: extractedData.founded_year,
            company_type: extractedData.company_type,
            revenue: extractedData.revenue,
            competitors: extractedData.competitors || [],
            status: 'draft',
        };

        const { error: insertError, data: insertedCompany } = await supabaseAdmin
            .from('companies')
            .insert(payload)
            .select('id')
            .single();

        if (insertError) {
            if (insertError.code === '23505') {
                logger.warn(`Skipping "${extractedData.name}" - Data conflict (slug ${finalSlug} already exists).`);
                await supabaseAdmin.from('scrape_queue').update({ status: 'completed' }).eq('id', item.id);
                skippedCount++;
            } else {
                logger.error(`Database Error inserting ${company}: ${insertError.message}`);
                await supabaseAdmin.from('scrape_queue').update({ status: 'failed' }).eq('id', item.id);
                errorCount++;
            }
        } else {
            logger.success(`Successfully saved metadata for ${extractedData.name}!`);
            await supabaseAdmin.from('scrape_queue').update({ status: 'completed' }).eq('id', item.id);

            // --- Map Industry Data ---
            if (extractedData.industry && insertedCompany) {
                const industrySlug = slugify(extractedData.industry, { lower: true, strict: true });

                const { data: industryData, error: indError } = await supabaseAdmin
                    .from('industries')
                    .upsert({
                        name: extractedData.industry,
                        slug: industrySlug,
                        is_active: true
                    }, { onConflict: 'slug' })
                    .select('id')
                    .single();

                if (!indError && industryData) {
                    const { error: mappingErr } = await supabaseAdmin
                        .from('company_industries')
                        .insert({
                            company_id: insertedCompany.id,
                            industry_id: industryData.id,
                            is_active: true
                        });

                    if (mappingErr) {
                        logger.error(`Failed to map ${extractedData.name} to industry ${extractedData.industry}: ${mappingErr.message}`);
                    }
                } else if (indError) {
                    logger.error(`Failed to upsert industry ${extractedData.industry}: ${indError.message}`);
                }
            }

            successCount++;
        }

        // Wait strictly 1.5 seconds between Gemini calls to evade 429 Quota Exceeded limits
        await sleep(1500);
    }

    logger.info(`\nScraper Queue Run Complete!`);
    logger.info(`✅ Inserted: ${successCount}`);
    logger.info(`⏭️  Skipped/Existing: ${skippedCount}`);
    logger.info(`❌ Errors:   ${errorCount}`);
}

// Execute Script
scrapeMetadata().catch((e) => {
    logger.error("Fatal exception in Scraper Runner.");
    console.error(e);
    process.exit(1);
});

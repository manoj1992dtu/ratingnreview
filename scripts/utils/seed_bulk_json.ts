import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials in environment variables.");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

function calculatePriority(employeeCount?: string): number {
    if (!employeeCount) return 5;
    const str = employeeCount.toLowerCase();

    // SEO Barbell Strategy priorities:
    // 10: Absolute giants (Anchor SEO content)
    // 1: Undiscovered niche startups (Long-tail SEO content)

    // Giants
    if (str.includes('100,001') || str.includes('100,000') || str.includes('50,000')) return 10;
    if (str.includes('10,000') || str.includes('10,001')) return 9;
    if (str.includes('5,000') || str.includes('5,001')) return 8;

    // Mid-tier
    if (str.includes('1,000') || str.includes('1,001')) return 5;

    // Niche low sizes - these are your high-volume long-tail SEO targets
    if (str.includes('1-10') || str.includes('11-50') || str.includes('51-100')) return 1;
    if (str.includes('101-250') || str.includes('251-500')) return 2;
    if (str.includes('501-1,000')) return 3;

    return 5;
}

async function main() {
    const seedFilePath = path.join(process.cwd(), 'data', 'seed_data.json');

    if (!fs.existsSync(seedFilePath)) {
        console.warn(`File ${seedFilePath} not found. Please provide seed_data.json.`);
        return;
    }

    console.log(`\nProcessing file: seed_data.json...`);
    const data = fs.readFileSync(seedFilePath, 'utf-8');

    let companies: any[];
    try {
        companies = JSON.parse(data);
    } catch (e) {
        console.error(`Failed to parse JSON in seed_data.json`);
        return;
    }

    console.log(`Found ${companies.length} rows in seed_data.json. WIPING PREVIOUS QUEUE...`);

    // Wipe queue
    const { error: deleteError } = await supabaseAdmin.from('scrape_queue').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error(`Failed to wipe scrape_queue: ${deleteError.message}`);
        return;
    }

    console.log(`Pushing to database prioritizing SEO Barbell strategy...`);

    let totalSuccess = 0;

    // We insert in batches of 100 so Supabase doesn't get overwhelmed
    const batchSize = 100;
    for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);

        const payload = batch.map(c => ({
            company_name: c.name,
            slug: c.slug,
            status: 'pending',
            employee_count: c.employee_count,
            priority: calculatePriority(c.employee_count)
        }));

        // Use upsert to insert and UPDATE if slug match, ensuring employee_count is refreshed
        const { error } = await supabaseAdmin
            .from('scrape_queue')
            .upsert(payload, {
                onConflict: 'slug',
                // Explicitly tell Supabase to update these fields if the row already exists
                ignoreDuplicates: false
            });

        if (error) {
            console.error(`Batch insert failed: ${error.message}`);
        } else {
            totalSuccess += batch.length;
        }
    }

    console.log(`\n================================`);
    console.log(`✅ Bulk Seeding Complete!`);
    console.log(`Total Attempted Inserts: ${totalSuccess}`);
    console.log(`(Exact duplicates were cleanly ignored by the Supabase unique slug constraint)`);
    console.log(`=================================\n`);
}

main();

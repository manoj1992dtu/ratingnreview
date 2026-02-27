import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials in environment variables.");
    process.exit(1);
}

// Instantiate Supabase Admin
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function main() {
    const jsonPath = path.join(process.cwd(), 'data', 'unique_companies.json');
    if (!fs.existsSync(jsonPath)) {
        console.error("Missing unique_companies.json. Please run deduplicate_csv.ts first.");
        return;
    }

    console.log("Reading unique_companies.json...");
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const companies: string[] = JSON.parse(data);

    let success = 0;
    let skipped = 0;

    console.log(`Attempting to seed ${companies.length} companies into scrape_queue table...`);

    for (const company of companies) {
        const payload = {
            company_name: company,
            slug: slugify(company, { lower: true, strict: true }),
            status: 'pending'
        };

        const { error } = await supabaseAdmin.from('scrape_queue').insert(payload);

        if (error) {
            if (error.code === '23505') { // Postgres unique constraint payload
                skipped++;
            } else {
                console.error(`Failed to seed ${company}: ${error.message}`);
            }
        } else {
            success++;
        }
    }

    console.log(`\n============================`);
    console.log(`✅ Queue Seeding Complete!`);
    console.log(`Total Successfully Inserted: ${success}`);
    console.log(`Total Skipped (Already existed): ${skipped}`);
    console.log(`============================\n`);
}

main();

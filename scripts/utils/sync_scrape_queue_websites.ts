import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Prioritize specific PROD keys if you define them, otherwise fall back to exactly what is in .env 
const supabaseUrl = process.env.PROD_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials in environment variables.");
    process.exit(1);
}

// Instantiate Supabase Admin
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function main() {
    const jsonPath = path.join(process.cwd(), 'data', 'seed_data.json');
    if (!fs.existsSync(jsonPath)) {
        console.error("Missing seed_data.json. Please make sure data/seed_data.json exists.");
        return;
    }

    console.log("Reading data/seed_data.json...");
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    let updatedCount = 0;
    let ignoredCount = 0;
    let errorCount = 0;

    console.log(`Attempting to sync websites for ${data.length} companies into the scrape_queue table...`);

    // Using a regular loop to avoid overwhelming the database with concurrent requests
    for (const company of data) {
        if (!company.website) {
            ignoredCount++;
            continue;
        }

        const { error } = await supabaseAdmin
            .from('scrape_queue')
            .update({ website: company.website })
            .eq('slug', company.slug);

        if (error) {
            console.error(`Failed to update ${company.slug}: ${error.message}`);
            errorCount++;
        } else {
            updatedCount++;
            // Optional: Print progress every 100 updates
            if (updatedCount % 100 === 0) {
                console.log(`   ...updated ${updatedCount} rows`);
            }
        }
    }

    console.log(`\n============================`);
    console.log(`✅ Sync Complete!`);
    console.log(`Total Websites Updated: ${updatedCount}`);
    console.log(`Total Ignored (No website in JSON): ${ignoredCount}`);
    console.log(`Total Errors: ${errorCount}`);
    console.log(`============================\n`);
}

main();

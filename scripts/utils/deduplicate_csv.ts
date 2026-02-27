import * as fs from 'fs';
import * as path from 'path';

function main() {
    const csvPath = path.join(process.cwd(), 'data', 'Companies_Information.csv');
    const outPath = path.join(process.cwd(), 'data', 'unique_companies.json');

    if (!fs.existsSync(csvPath)) {
        console.error(`Missing file: ${csvPath}`);
        return;
    }

    console.log('Reading CSV...');
    const rawData = fs.readFileSync(csvPath, 'utf-8');
    const lines = rawData.split('\n');

    // We use a Set because it mathematically rejects duplicate values instantly
    const uniqueCompanies = new Set<string>();

    for (let i = 1; i < lines.length; i++) { // Start at 1 to skip header row
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma
        const cols = line.split(',');
        if (cols.length >= 2) {
            const companyName = cols[1].trim();
            // Basic cleanup filter
            if (companyName && companyName !== 'company_name') {
                uniqueCompanies.add(companyName);
            }
        }
    }

    const uniqueArray = Array.from(uniqueCompanies);

    fs.writeFileSync(outPath, JSON.stringify(uniqueArray, null, 2));

    console.log(`\n============================`);
    console.log(`✅ Deduplication Complete!`);
    console.log(`Total Original Rows: ${lines.length}`);
    console.log(`Total UNIQUE Companies: ${uniqueArray.length}`);
    console.log(`Saved JSON directly to: ${outPath}`);
    console.log(`============================\n`);
}

main();

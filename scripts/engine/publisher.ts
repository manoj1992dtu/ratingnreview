import { supabaseAdmin } from './supabaseAdmin';
import { logger } from './logger';

// --- CLI Config ---
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    batchSize: parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '5'),
    companies: args.find(a => a.startsWith('--companies='))?.split('=')[1]?.split(',') || []
};

if (isNaN(options.batchSize) || options.batchSize <= 0) {
    logger.error("Invalid --batch-size provided. Must be a positive integer.");
    process.exit(1);
}

// --- Telemetry Objects ---
let reviewsFlippedToPublished = 0;
let reviewsNewlyScheduled = 0;
let companiesFlippedToPublished = 0;
let companiesNewlyScheduled = 0;
let lastScheduledDate: Date | null = null;
let wouldFlipToPublished: string[] = [];
let wouldSchedule: { id: string, plannedTimestamp: string, type: 'review' | 'company' }[] = [];

// --- Configurable Time Settings ---
const REVIEW_MIN_HOURS = 12;
const REVIEW_MAX_HOURS = 36;
const COMPANY_MIN_HOURS = 18;
const COMPANY_MAX_HOURS = 30;

/**
 * PHASE A: Flip "Due" logic for Reviews.
 */
async function processDueReviews() {
    logger.info(`Phase A: Scanning for "Due" reviews to flip to 'published'...`);

    const now = new Date().toISOString();

    const { data: dueReviews, error } = await supabaseAdmin
        .from('company_reviews')
        .select('id, company_id')
        .eq('status', 'approved')
        .lte('published_at', now)
        .limit(options.batchSize);

    if (error) {
        logger.error(`Failed to fetch due reviews: ${error.message}`);
        return;
    }

    if (!dueReviews || dueReviews.length === 0) {
        if (options.verbose) logger.info(`  No past-due reviews found.`);
        return;
    }

    const idsToFlip = dueReviews.map(r => r.id);

    if (options.dryRun) {
        idsToFlip.forEach(id => wouldFlipToPublished.push(`review:${id}`));
        if (options.verbose) logger.info(`  [DRY RUN] Would flip ${idsToFlip.length} reviews to 'published'.`);
    } else {
        for (const review of dueReviews) {
            // Flip the Review
            const { error: reviewError } = await supabaseAdmin
                .from('company_reviews')
                .update({ status: 'published' })
                .eq('id', review.id);

            if (reviewError) {
                logger.error(`  [DB Error] Failed to flip review ${review.id}: ${reviewError.message}`);
                continue;
            }

            reviewsFlippedToPublished++;

            /**
             * SYNC LOGIC: If parent company is not published, force it now.
             * This handles cases where a review is due BEFORE the company's scheduled date.
             */
            const { error: companyError } = await supabaseAdmin
                .from('companies')
                .update({
                    status: 'published',
                    published_at: now
                })
                .eq('id', review.company_id)
                .neq('status', 'published'); // Catch draft or future-scheduled

            if (!companyError && options.verbose) {
                logger.info(`  Verified/Published parent company for review ${review.id}`);
            }
        }

        if (options.verbose) logger.success(`  Successfully flipped ${reviewsFlippedToPublished} reviews to 'published'.`);
    }
}

/**
 * PHASE B: Flip "Due" logic for Companies.
 */
async function processDueCompanies() {
    logger.info(`Phase B: Scanning for "Due" companies to flip to 'published'...`);

    const now = new Date().toISOString();

    const { data: dueCompanies, error } = await supabaseAdmin
        .from('companies')
        .select('id, slug')
        .eq('status', 'draft')
        .lte('published_at', now)
        .limit(options.batchSize);

    if (error) {
        logger.error(`Failed to fetch due companies: ${error.message}`);
        return;
    }

    if (!dueCompanies || dueCompanies.length === 0) {
        if (options.verbose) logger.info(`  No past-due companies found.`);
        return;
    }

    const idsToFlip = dueCompanies.map(c => c.id);

    if (options.dryRun) {
        idsToFlip.forEach(id => wouldFlipToPublished.push(`company:${id}`));
        if (options.verbose) logger.info(`  [DRY RUN] Would flip ${idsToFlip.length} companies to 'published'.`);
    } else {
        const { error: updateError } = await supabaseAdmin
            .from('companies')
            .update({ status: 'published' })
            .in('id', idsToFlip);

        if (updateError) {
            logger.error(`Failed to flip companies: ${updateError.message}`);
        } else {
            companiesFlippedToPublished += idsToFlip.length;
            if (options.verbose) logger.success(`  Successfully flipped ${idsToFlip.length} companies to 'published'.`);
        }
    }
}

/**
 * Helper to fetch the absolute latest published_at time for Reviews.
 */
async function getBaseTimeForReviews(): Promise<Date> {
    const { data, error } = await supabaseAdmin
        .from('company_reviews')
        .select('published_at')
        .in('status', ['approved', 'published'])
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1);

    const now = new Date();
    if (error || !data || data.length === 0 || !data[0].published_at) return now;
    const maxPublishedAt = new Date(data[0].published_at);
    return maxPublishedAt > now ? maxPublishedAt : now;
}

/**
 * Helper to fetch the absolute latest published_at time for Companies.
 */
async function getBaseTimeForCompanies(): Promise<Date> {
    const { data, error } = await supabaseAdmin
        .from('companies')
        .select('published_at')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1);

    const now = new Date();
    if (error || !data || data.length === 0 || !data[0].published_at) return now;
    const maxPublishedAt = new Date(data[0].published_at);
    return maxPublishedAt > now ? maxPublishedAt : now;
}

function getRandomDelayMs(minHours: number, maxHours: number): number {
    const hours = Math.random() * (maxHours - minHours) + minHours;
    return hours * 60 * 60 * 1000;
}

/**
 * PHASE C: Scheduling Future Reviews.
 */
async function scheduleFutureReviews() {
    logger.info(`Phase C: Scheduling future reviews...`);

    const now = new Date().toISOString();
    const { count: scheduledCount } = await supabaseAdmin
        .from('company_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gt('published_at', now);

    if (scheduledCount !== null && scheduledCount >= 7) {
        logger.info(`  Auto-Throttle: Already have ${scheduledCount} reviews scheduled. Skipping.`);
        return;
    }

    const { data: unscheduledReviews, error } = await supabaseAdmin
        .from('company_reviews')
        .select('id, company_id')
        .eq('status', 'approved')
        .is('published_at', null)
        .limit(200);

    if (error || !unscheduledReviews || unscheduledReviews.length === 0) return;

    // Grouping for round-robin
    const reviewsByCompany: Record<string, typeof unscheduledReviews> = {};
    for (const review of unscheduledReviews) {
        if (!reviewsByCompany[review.company_id]) reviewsByCompany[review.company_id] = [];
        reviewsByCompany[review.company_id].push(review);
    }

    const selectedReviews: typeof unscheduledReviews = [];
    let companyKeys = Object.keys(reviewsByCompany);
    let i = 0;
    while (selectedReviews.length < options.batchSize && companyKeys.length > 0) {
        const key = companyKeys[i % companyKeys.length];
        const arr = reviewsByCompany[key];
        if (arr.length > 0) {
            selectedReviews.push(arr.shift()!);
        }
        if (arr.length === 0) {
            companyKeys.splice(i % companyKeys.length, 1);
        } else {
            i++;
        }
    }

    let runningBaseTimeMs = (await getBaseTimeForReviews()).getTime();

    for (const review of selectedReviews) {
        runningBaseTimeMs += getRandomDelayMs(REVIEW_MIN_HOURS, REVIEW_MAX_HOURS);
        const isoDate = new Date(runningBaseTimeMs).toISOString();

        if (options.dryRun) {
            wouldSchedule.push({ id: review.id, plannedTimestamp: isoDate, type: 'review' });
        } else {
            await supabaseAdmin.from('company_reviews').update({ published_at: isoDate }).eq('id', review.id);
            reviewsNewlyScheduled++;
        }
    }
}

/**
 * PHASE D: Scheduling Future Companies (1 per day).
 */
async function scheduleFutureCompanies() {
    logger.info(`Phase D: Scheduling future companies...`);

    const now = new Date().toISOString();
    const { count: scheduledCount } = await supabaseAdmin
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')
        .gt('published_at', now);

    if (scheduledCount !== null && scheduledCount >= 5) {
        logger.info(`  Auto-Throttle: Already have ${scheduledCount} companies scheduled. Skipping.`);
        return;
    }

    const { data: unscheduledCompanies, error } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('status', 'draft')
        .is('published_at', null)
        .limit(options.batchSize);

    if (error || !unscheduledCompanies || unscheduledCompanies.length === 0) return;

    let runningBaseTimeMs = (await getBaseTimeForCompanies()).getTime();

    for (const company of unscheduledCompanies) {
        runningBaseTimeMs += getRandomDelayMs(COMPANY_MIN_HOURS, COMPANY_MAX_HOURS);
        const isoDate = new Date(runningBaseTimeMs).toISOString();

        if (options.dryRun) {
            wouldSchedule.push({ id: company.id, plannedTimestamp: isoDate, type: 'company' });
        } else {
            await supabaseAdmin.from('companies').update({ published_at: isoDate }).eq('id', company.id);
            companiesNewlyScheduled++;
        }
    }
}

async function startPublisher() {
    logger.info("Initializing Decoupled Publisher Engine...");

    await processDueReviews();
    await processDueCompanies();
    await scheduleFutureReviews();
    await scheduleFutureCompanies();

    logger.info("\n=== Publisher Complete ===");

    const summary = {
        mode: options.dryRun ? 'DRY-RUN' : 'LIVE',
        reviews: { flipped: reviewsFlippedToPublished, scheduled: reviewsNewlyScheduled },
        companies: { flipped: companiesFlippedToPublished, scheduled: companiesNewlyScheduled },
        dryRunDetails: options.dryRun ? { wouldFlipToPublished, wouldSchedule } : undefined
    };

    console.log(JSON.stringify(summary, null, 2));
}

startPublisher().catch(e => {
    logger.error("Fatal unhandled exception in Publisher process.");
    console.error(e);
    process.exit(1);
});

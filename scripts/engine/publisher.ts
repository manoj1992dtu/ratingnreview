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
let lastScheduledDate: Date | null = null;
let wouldFlipToPublished: string[] = [];
let wouldSchedule: { id: string, plannedTimestamp: string, company_id: string }[] = [];

// --- Configurable Time Settings ---
// Interval to stagger new reviews by (12 to 36 hours randomly)
const MIN_HOURS_DELAY = 12;
const MAX_HOURS_DELAY = 36;

/**
 * PHASE A: Flip "Due" logic.
 * Finds all reviews where status = 'approved' AND published_at <= NOW()
 * Caps at batchSize.
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
        wouldFlipToPublished = idsToFlip;
        if (options.verbose) logger.info(`  [DRY RUN] Would flip ${idsToFlip.length} reviews to 'published'.`);
    } else {
        // We do this in a loop so we can also check and flip the parent company if needed
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

            // Flip the Parent Company
            const { error: companyError } = await supabaseAdmin
                .from('companies')
                .update({
                    status: 'published',
                    published_at: now
                })
                .eq('id', review.company_id)
                .eq('status', 'draft'); // Only update if it's still in draft mode

            if (companyError) {
                logger.error(`  [DB Error] Failed to publish parent company ${review.company_id}: ${companyError.message}`);
            }
        }

        if (options.verbose) logger.success(`  Successfully flipped ${reviewsFlippedToPublished} reviews to 'published'.`);
    }
}

/**
 * Helper to fetch the absolute latest published_at time in the DB, 
 * regardless of whether it's 'approved' (future) or 'published' (past).
 */
async function getBaseTime(): Promise<Date> {
    const { data, error } = await supabaseAdmin
        .from('company_reviews')
        .select('published_at')
        .in('status', ['approved', 'published'])
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1);

    const now = new Date();

    if (error || !data || data.length === 0 || !data[0].published_at) {
        return now;
    }

    const maxPublishedAt = new Date(data[0].published_at);

    // If we have a future date in the DB, append to it. Otherwise, start from NOW().
    return maxPublishedAt > now ? maxPublishedAt : now;
}

function getRandomDelayMs(): number {
    const hours = Math.random() * (MAX_HOURS_DELAY - MIN_HOURS_DELAY) + MIN_HOURS_DELAY;
    return hours * 60 * 60 * 1000;
}

/**
 * PHASE B: Scheduling Future Reviews
 * Allocates fresh future `published_at` timestamps using a round-robin company distribution.
 */
async function scheduleFutureReviews() {
    logger.info(`Phase B: Scheduling future reviews...`);

    // AUTO-THROTTLE CHECK
    // If we already have 7+ reviews scheduled for the future, we don't need to add more.
    // This maintains a healthy 1-week "runway" while keeping the rest of our backlog flexible.
    const now = new Date().toISOString();
    const { count: scheduledCount, error: countError } = await supabaseAdmin
        .from('company_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gt('published_at', now);

    if (countError) {
        logger.error(`Failed to check scheduled runway: ${countError.message}`);
    } else if (scheduledCount !== null && scheduledCount >= 7) {
        logger.info(`Auto-Throttle: Already have ${scheduledCount} reviews scheduled (1 week+ runway). Skipping scheduling.`);
        return;
    }

    let query = supabaseAdmin
        .from('company_reviews')
        .select('id, company_id')
        .eq('status', 'approved')
        .is('published_at', null)
        // High limit to ensure we have enough diversity to round-robin from
        .limit(200);

    // Apply specific companies filter if provided
    if (options.companies.length > 0 && !options.companies.includes('all')) {
        const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
        const uuids = options.companies.filter(isUUID);
        const slugs = options.companies.filter(c => !isUUID(c));

        const validIds = new Set<string>(uuids);

        if (slugs.length > 0) {
            const { data: slugData } = await supabaseAdmin
                .from('companies')
                .select('id')
                .in('slug', slugs);
            if (slugData) slugData.forEach(c => validIds.add(c.id));
        }

        if (validIds.size === 0) {
            if (options.verbose) logger.info(`  No valid companies resolved from provided --companies argument.`);
            return;
        }

        query = query.in('company_id', Array.from(validIds));
    }

    const { data: unscheduledReviews, error } = await query;

    if (error) {
        logger.error(`Failed to fetch unscheduled reviews: ${error.message}`);
        return;
    }

    if (!unscheduledReviews || unscheduledReviews.length === 0) {
        if (options.verbose) logger.info(`  No unscheduled reviews requiring attention.`);
        return;
    }

    // -- Group by Company for Round Robin --
    const reviewsByCompany: Record<string, typeof unscheduledReviews> = {};
    for (const review of unscheduledReviews) {
        if (!reviewsByCompany[review.company_id]) {
            reviewsByCompany[review.company_id] = [];
        }
        reviewsByCompany[review.company_id].push(review);
    }

    const selectedReviews: typeof unscheduledReviews = [];

    // Cycle through companies picking one review at a time
    let companyIdx = 0;
    let companyKeys = Object.keys(reviewsByCompany);
    while (selectedReviews.length < Math.min(options.batchSize, unscheduledReviews.length) && companyKeys.length > 0) {
        const currentKeyIdx = companyIdx % companyKeys.length;
        const key = companyKeys[currentKeyIdx];
        const reviewArray = reviewsByCompany[key];

        selectedReviews.push(reviewArray.shift()!);

        if (reviewArray.length === 0) {
            // Clean up empty arrays to avoid O(N) checking and endless empty looping
            companyKeys.splice(currentKeyIdx, 1);
        } else {
            companyIdx++;
        }
    }

    if (options.verbose) {
        logger.info(`  Selected ${selectedReviews.length} reviews across ${new Set(selectedReviews.map(r => r.company_id)).size} distinct companies.`);
    }

    // -- Calculate Temporal Staggering --
    let runningBaseTimeMs = (await getBaseTime()).getTime();

    for (const review of selectedReviews) {
        // Increment the timeline by 12..36 hours
        runningBaseTimeMs += getRandomDelayMs();
        const plannedDate = new Date(runningBaseTimeMs);
        const isoDate = plannedDate.toISOString();

        if (options.dryRun) {
            wouldSchedule.push({ id: review.id, plannedTimestamp: isoDate, company_id: review.company_id });
        } else {
            const { error: updateError } = await supabaseAdmin
                .from('company_reviews')
                .update({ published_at: isoDate })
                .eq('id', review.id);

            if (updateError) {
                logger.error(`  [DB Error] Failed to schedule Review ${review.id}: ${updateError.message}`);
                continue;
            }
            reviewsNewlyScheduled++;
            lastScheduledDate = plannedDate;
        }
    }
}

async function startPublisher() {
    logger.info("Initializing Publisher Engine...");

    await processDueReviews();
    await scheduleFutureReviews();

    logger.info("\n=== Publisher Complete ===");

    if (options.dryRun) {
        console.log(JSON.stringify({
            mode: 'DRY-RUN',
            wouldFlipToPublished,
            wouldSchedule,
            batchSizeUsed: options.batchSize
        }, null, 2));
    } else {
        console.log(JSON.stringify({
            mode: 'LIVE',
            reviewsFlippedToPublished,
            reviewsNewlyScheduled,
            lastScheduledDate: lastScheduledDate ? lastScheduledDate.toISOString() : null
        }, null, 2));
    }
}

startPublisher().catch(e => {
    logger.error("Fatal unhandled exception in Publisher process.");
    console.error(e);
    process.exit(1);
});

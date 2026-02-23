import { supabaseAdmin } from './supabaseAdmin';

export async function slowDripPublish() {
    console.log('Running Publisher: Slow-Drip Scheduling...');

    const batchSize = parseInt(process.env.PUBLISHER_BATCH_SIZE || '5', 10);

    // 1. Find approved reviews that have no published_at date
    const { data: approvedReviews, error: fetchError } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('status', 'approved')
        .is('published_at', null)
        .limit(batchSize); // Schedule up to batchSize at a time

    if (fetchError) {
        throw new Error(`Failed to fetch approved reviews: ${fetchError.message}`);
    }

    if (!approvedReviews || approvedReviews.length === 0) {
        console.log('No approved (unpublished) reviews found. Exiting.');
        return;
    }

    console.log(`Scheduling ${approvedReviews.length} reviews for publication...`);

    // 2. Set published_at slightly staggered to simulate natural drip
    for (let i = 0; i < approvedReviews.length; i++) {
        const review = approvedReviews[i];

        // Stagger publishing times by 10 minutes from now
        const publishDate = new Date(Date.now() + i * 10 * 60 * 1000);

        const { error: updateError } = await supabaseAdmin
            .from('reviews')
            .update({ published_at: publishDate.toISOString() })
            .eq('id', review.id);

        if (updateError) {
            console.error(`Failed to publish review ${review.id}:`, updateError);
        } else {
            console.log(`Review ${review.id} scheduled for publication at ${publishDate.toISOString()}`);
        }
    }

    console.log('Publishing sequence complete.');
}

if (require.main === module) {
    slowDripPublish()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}

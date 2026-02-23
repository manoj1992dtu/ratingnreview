import { supabaseAdmin } from './supabaseAdmin';

export async function validatePendingReviews() {
    console.log('Running Validator: Quality Gate for Pending Reviews...');

    const { data: pendingReviews, error: fetchError } = await supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('status', 'pending');

    if (fetchError) {
        throw new Error(`Failed to fetch pending reviews: ${fetchError.message}`);
    }

    if (!pendingReviews || pendingReviews.length === 0) {
        console.log('No pending reviews found. Exiting.');
        return;
    }

    console.log(`Found ${pendingReviews.length} pending reviews. Starting validation...`);

    for (const review of pendingReviews) {
        // Quality Gate Rules
        const wordCount = (review.content || '').split(/\s+/).filter((w: string) => w.length > 0).length;

        // Simplified rule for the prototype: min 10 words, must have designate, likes, dislikes
        const hasValidContent = wordCount >= 10;
        const hasRequiredFields = !!review.designation && !!review.likes && !!review.dislikes;
        const hasValidRatings = review.overall_rating >= 1 && review.overall_rating <= 5;

        const isValid = hasValidContent && hasRequiredFields && hasValidRatings;

        const newStatus = isValid ? 'approved' : 'rejected';

        const { error: updateError } = await supabaseAdmin
            .from('reviews')
            .update({ status: newStatus })
            .eq('id', review.id);

        if (updateError) {
            console.error(`Failed to update status for review ${review.id}:`, updateError);
        } else {
            console.log(`Review ${review.id} updated. New status: [${newStatus}]`);
            if (!isValid) {
                console.log(`  -> Fails due to: content_words=${wordCount}, required_fields=${hasRequiredFields}, valid_ratings=${hasValidRatings}`);
            }
        }
    }

    console.log('Validation complete.');
}

if (require.main === module) {
    validatePendingReviews()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}

import { supabaseAdmin } from './supabaseAdmin';
import { logger } from './logger';

// CLI Config
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    showRejected: args.includes('--show-rejected'),
    limit: parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0')
};

const AI_RED_FLAGS = {
    phrases: [
        'in summary', 'in conclusion', 'to summarize', 'to conclude',
        'delve', 'leverage', 'synergy', 'paradigm shift', 'game changer',
        'testament to', 'beacon of', 'look no further', 'the fact that',
        'furthermore', 'moreover', 'nonetheless', 'notwithstanding',
        'it is worth noting', 'it should be noted', 'one must consider'
    ],
    patterns: [
        /\.\s*In\s+(addition|summary|conclusion|contrast)/gi,
        /(very very|really really|quite quite)/gi,
        /\b(utilize|utilization|utilizes|utilized)\b/gi,
        /as\s+an\s+ai/gi,
        /language\s+model/gi
    ]
};

const SIMILARITY_THRESHOLDS = {
    CRITICAL: 0.90,  // Definitely reject (>90% similar)
    WARNING: 0.70,   // Log warning but approve (70-90%)
    ACCEPTABLE: 0.40 // Natural overlap (<70%)
};

function calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    if (words1.size === 0 && words2.size === 0) return 1;
    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

function isReviewValid(review: any): { valid: boolean; reason?: string } {
    // 1. Content Presence & Length Validation
    if (!review.likes || typeof review.likes !== 'string' || review.likes.length < 50 || review.likes.length > 2000) {
        return { valid: false, reason: 'Invalid or missing likes length' };
    }
    if (!review.dislikes || typeof review.dislikes !== 'string' || review.dislikes.length < 50 || review.dislikes.length > 2000) {
        return { valid: false, reason: 'Invalid or missing dislikes length' };
    }
    if (!review.content || typeof review.content !== 'string' || review.content.length < 50 || review.content.length > 1500) {
        return { valid: false, reason: 'Invalid or missing content length' };
    }

    // 2. Rating Validity & Coherence Check
    const ensure1To5 = (v: any) => typeof v === 'number' && v >= 1 && v <= 5;
    if (!ensure1To5(review.overall_rating)) return { valid: false, reason: 'overall_rating out of range' };

    const granularRatings = [
        review.work_life_balance, review.salary, review.promotions,
        review.job_security, review.skill_development, review.work_satisfaction, review.company_culture
    ].filter(v => typeof v === 'number');

    if (granularRatings.length > 0) {
        const avg = granularRatings.reduce((a, b) => a + b, 0) / granularRatings.length;
        const diff = Math.abs(review.overall_rating - avg);
        if (diff > 1.5) {
            return { valid: false, reason: `Rating incoherent. Overall: ${review.overall_rating}, Avg: ${avg.toFixed(2)}` };
        }
    }

    // 3. Similarity Check
    const similarity = calculateSimilarity(review.likes, review.dislikes);
    if (similarity > SIMILARITY_THRESHOLDS.CRITICAL) {
        return { valid: false, reason: 'likes and dislikes are too similar' };
    }
    if (similarity > SIMILARITY_THRESHOLDS.WARNING) {
        if (options.verbose) logger.warn(`High similarity detected (${(similarity * 100).toFixed(0)}%) in Review ${review.id}`);
    }

    // 4. AI-Hallucination & Tell Checks
    const combinedContent = `${review.likes} ${review.dislikes} ${review.content}`.toLowerCase();
    const foundFlags = AI_RED_FLAGS.phrases.filter(phrase => combinedContent.includes(phrase));
    let patternMatched = false;
    AI_RED_FLAGS.patterns.forEach(r => { if (r.test(combinedContent)) patternMatched = true; });

    if (foundFlags.length > 0) {
        return { valid: false, reason: `AI phrase detected: '${foundFlags[0]}'` };
    }
    if (patternMatched) {
        return { valid: false, reason: 'AI patterns detected' };
    }

    // 5. Markdown/JSON Bleed Checks
    if (combinedContent.includes('{"') || combinedContent.includes('}') || combinedContent.includes('```')) {
        return { valid: false, reason: 'JSON or Markdown artifacts detected matching LLM extraction bleed' };
    }

    return { valid: true };
}

async function startValidator() {
    logger.info("Initializing Validator Engine...");

    let offset = 0;
    let keepProcessing = true;
    let totalProcessedLimit = 0;

    // Telemetry Objects
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalEvaluated = 0;
    const rejectionReasons: Record<string, number> = {};

    while (keepProcessing) {
        let query = supabaseAdmin
            .from('company_reviews')
            .select('*')
            .eq('status', 'pending_validation')
            .range(offset, offset + 99);

        const { data: reviews, error } = await query;

        if (error) {
            logger.error(`Failed to fetch pending reviews at offset ${offset}: ${error.message}`);
            process.exit(1);
        }

        if (!reviews || reviews.length === 0) {
            keepProcessing = false;
            break;
        }

        for (const review of reviews) {
            // Check hard limit option if specified
            if (options.limit > 0 && totalProcessedLimit >= options.limit) {
                keepProcessing = false;
                break;
            }

            totalProcessedLimit++;
            totalEvaluated++;

            const validation = isReviewValid(review);

            const newStatus = validation.valid ? 'approved' : 'rejected';

            if (!options.dryRun) {
                const { error: updateError } = await supabaseAdmin
                    .from('company_reviews')
                    .update({ status: newStatus })
                    .eq('id', review.id);

                if (updateError) {
                    logger.error(`  [DB Error] Failed to update review ${review.id}: ${updateError.message}`);
                    continue;
                }
            }

            if (validation.valid) {
                approvedCount++;
                if (options.verbose) logger.success(`  [Approved] Review ${review.id}`);
            } else {
                rejectedCount++;
                const rzn = validation.reason || 'Unknown reason';
                rejectionReasons[rzn] = (rejectionReasons[rzn] || 0) + 1;
                if (options.showRejected || options.verbose) {
                    logger.warn(`  [Rejected] Review ${review.id} | Reason: ${validation.reason}`);
                }
            }
        }

        offset += 100;
    }

    logger.info("\n=== Validation Complete ===");
    console.log(JSON.stringify({
        mode: options.dryRun ? 'DRY-RUN' : 'LIVE',
        totalEvaluated: totalEvaluated,
        totalApproved: approvedCount,
        totalRejected: rejectedCount,
        rejectionReasons: rejectionReasons
    }, null, 2));
}

startValidator().catch(e => {
    logger.error("Fatal unhandled exception in Validator process.");
    console.error(e);
    process.exit(1);
});

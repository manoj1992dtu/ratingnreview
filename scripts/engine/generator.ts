import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from './supabaseAdmin';
import { logger } from './logger';

// ------------------------------------------------------------------------
// CLI Args & Setup
// ------------------------------------------------------------------------
const args = process.argv.slice(2);
const options = {
    companies: 'all',
    count: 1,
    dryRun: false,
    force: false,
    verbose: false,
};

args.forEach((arg) => {
    if (arg.startsWith('--companies=')) options.companies = arg.split('=')[1];
    if (arg.startsWith('--count=')) options.count = parseInt(arg.split('=')[1] || '1', 10);
    if (arg === '--dry-run') options.dryRun = true;
    if (arg === '--force') options.force = true;
    if (arg === '--verbose') options.verbose = true;
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const startTime = Date.now();
const progress = {
    totalTargeted: 0,
    completed: 0,
    failed: 0,
};

const totalTokens = { input: 0, output: 0 };
const analytics = {
    ratingDistribution: {} as Record<number, number>,
    sentimentDistribution: {} as Record<string, number>,
    departmentDistribution: {} as Record<string, number>,
};

// ------------------------------------------------------------------------
// Types & Personas
// ------------------------------------------------------------------------
interface Persona {
    role: string;
    tenure: string;
    sentiment: 'positive' | 'mixed' | 'frustrated' | 'neutral' | 'enthusiastic';
    traits: string;
    department: string;
    reviewLength: 'short' | 'medium' | 'long';
}

const PERSONAS: Persona[] = [
    // Technical
    { role: 'Software Engineer', tenure: '2 years', sentiment: 'mixed', traits: 'technical, detail-oriented', department: 'Engineering', reviewLength: 'short' },
    { role: 'Senior Software Engineer', tenure: '4 years', sentiment: 'frustrated', traits: 'experienced, critical of process', department: 'Engineering', reviewLength: 'medium' },
    { role: 'QA Engineer', tenure: '1.5 years', sentiment: 'neutral', traits: 'methodical, quality-focused', department: 'Engineering', reviewLength: 'short' },
    { role: 'DevOps Engineer', tenure: '3 years', sentiment: 'positive', traits: 'automation-focused, pragmatic', department: 'Engineering', reviewLength: 'short' },
    // Management
    { role: 'Senior Manager', tenure: '5 years', sentiment: 'positive', traits: 'diplomatic, strategic', department: 'Management', reviewLength: 'long' },
    { role: 'Team Lead', tenure: '3 years', sentiment: 'frustrated', traits: 'burned out, critical', department: 'Management', reviewLength: 'medium' },
    // Junior
    { role: 'Associate', tenure: '6 months', sentiment: 'enthusiastic', traits: 'eager, learning-focused', department: 'Operations', reviewLength: 'short' },
    { role: 'Intern', tenure: '1 year', sentiment: 'positive', traits: 'grateful, energetic', department: 'Engineering', reviewLength: 'short' },
    // Business
    { role: 'Business Analyst', tenure: '2.5 years', sentiment: 'mixed', traits: 'analytical, process-oriented', department: 'Operations', reviewLength: 'short' },
    { role: 'Sales Executive', tenure: '1 year', sentiment: 'positive', traits: 'target-driven, outgoing', department: 'Sales', reviewLength: 'short' },
    { role: 'HR Coordinator', tenure: '2 years', sentiment: 'neutral', traits: 'people-focused, organized', department: 'HR', reviewLength: 'medium' },
    { role: 'Marketing Manager', tenure: '3 years', sentiment: 'frustrated', traits: 'creative, budget-conscious', department: 'Marketing', reviewLength: 'short' },
    // Specialized
    { role: 'Principal Engineer', tenure: '7 years', sentiment: 'mixed', traits: 'architectural thinker', department: 'Engineering', reviewLength: 'long' },
    { role: 'Data Scientist', tenure: '2.5 years', sentiment: 'positive', traits: 'research-oriented, experimental', department: 'Engineering', reviewLength: 'short' },
    { role: 'Product Manager', tenure: '4 years', sentiment: 'neutral', traits: 'user-focused, cross-functional', department: 'Product', reviewLength: 'short' }
];

function getRandomPersona(): Persona {
    return PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
}

function getRatingRangeInstructions(sentiment: string): string {
    switch (sentiment) {
        case 'positive': return 'integer between 4 and 5';
        case 'enthusiastic': return 'integer between 4 and 5';
        case 'mixed': return 'integer between 3 and 4';
        case 'neutral': return 'integer between 3 and 4';
        case 'frustrated': return 'integer between 1 and 3';
        default: return 'integer between 1 and 5';
    }
}

function getLengthInstructions(length: string): string {
    switch (length) {
        case 'short':
            return `"likes": "50-100 words: Brief and conversational. List 2-3 key positives.",
  "dislikes": "50-100 words: Brief and honest. List 2-3 key issues.",
  "content": "50-100 words: Quick balanced summary. Would you recommend?"`;

        case 'medium':
            return `"likes": "100-150 words: Moderate detail. Explain 3-4 positive aspects with some context.",
  "dislikes": "100-150 words: Moderate detail. Explain 3-4 negative aspects with some context.",
  "content": "80-120 words: Balanced summary covering both sides. Include recommendation."`;

        case 'long':
            return `"likes": "150-200 words: Detailed and thoughtful. Discuss 4-5 positives with specific examples.",
  "dislikes": "150-200 words: Detailed and thoughtful. Discuss 4-5 negatives with specific examples.",
  "content": "100-150 words: Comprehensive balanced summary. Personal perspective and recommendation."`;

        default:
            return `"likes": "50-100 words: Brief and clear.",
  "dislikes": "50-100 words: Brief and clear.",
  "content": "50-100 words: Quick summary."`;
    }
}

function sanitizeString(str: string): string {
    return str.replace(/[^\w\s-]/g, '').substring(0, 100);
}

// ------------------------------------------------------------------------
// Dynamic Limits
// ------------------------------------------------------------------------
function extractMaxEmployeesFromRange(rangeStr: string): number {
    if (!rangeStr) return 0;
    const match = rangeStr.replace(/,/g, '').match(/\d+/g);
    if (!match) return 0;
    // Get the highest number found in the string (e.g. "10,000-50,000" -> 50000)
    const numbers = match.map(n => parseInt(n, 10));
    return Math.max(...numbers);
}

function getDynamicReviewCap(employeeCountStr: string | null): number {
    if (!employeeCountStr) return 15;

    const str = employeeCountStr.toLowerCase();

    // Handle categorical strings
    if (str.includes('startup') && !str.includes('unicorn')) return 10;
    if (str.includes('unicorn')) return 200;
    if (str.includes('mnc') || str.includes('fortune')) return 500;

    const maxEmployees = extractMaxEmployeesFromRange(employeeCountStr);

    if (maxEmployees === 0) return 15;
    if (maxEmployees <= 10) return 2;
    if (maxEmployees <= 25) return 5;
    if (maxEmployees <= 50) return 10;
    if (maxEmployees <= 100) return 15;
    if (maxEmployees <= 200) return 25;
    if (maxEmployees <= 500) return 50;
    if (maxEmployees <= 1000) return 100;
    if (maxEmployees <= 2500) return 200;
    if (maxEmployees <= 5000) return 350;
    if (maxEmployees <= 10000) return 600;

    // Enterprise cap
    return Math.min(Math.ceil(maxEmployees * 0.06), 2000);
}

// ------------------------------------------------------------------------
// Extraction & Parsing
// ------------------------------------------------------------------------
function extractAndParseJSON(text: string): any {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error(`[Parse Error] No JSON object found in response: ${text.substring(0, 100)}...`);
    }
    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        throw new Error(`[Parse Error] Invalid JSON internal structure.`);
    }
}

// ------------------------------------------------------------------------
// Validation & Coherence
// ------------------------------------------------------------------------
const AI_RED_FLAGS = {
    phrases: [
        'in conclusion', 'furthermore', 'delve', 'leverage', 'moreover',
        'it is important to note', 'touch base', 'circle back',
        'synergy', 'paradigm shift', 'game changer', 'at the end of the day',
        'moving forward', 'deep dive', 'low-hanging fruit'
    ],
    patterns: [
        /\b(very very|really really)\b/gi,
        /\.\s*In\s+(addition|summary|conclusion)/gi,
        /\b(utilize|utilization)\b/gi
    ]
};

function enforceRatingCoherence(data: any) {
    const granularRatings = [
        data.work_life_balance, data.salary, data.promotions,
        data.job_security, data.skill_development, data.work_satisfaction, data.company_culture
    ].filter(v => typeof v === 'number');

    if (granularRatings.length > 0) {
        const avg = granularRatings.reduce((a, b) => a + b, 0) / granularRatings.length;
        const diff = Math.abs(data.overall_rating - avg);
        if (diff > 1.5) {
            // Apply logarithmic smoothing towards the average to keep it believable 
            data.overall_rating = Math.max(1, Math.min(5, Math.round(avg)));
            if (options.verbose) logger.warn(`  [Coherence] Coerced overall_rating to ${data.overall_rating}`);
        }
    }
}

function validateReviewData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const ensure1To5 = (v: any) => typeof v === 'number' && v >= 1 && v <= 5;

    if (!ensure1To5(data.overall_rating)) errors.push('overall_rating out of range');
    if (!ensure1To5(data.work_life_balance)) errors.push('work_life_balance out of range');
    if (!data.designation) errors.push('designation missing');
    if (!data.likes) errors.push('likes missing');
    if (!data.dislikes) errors.push('dislikes missing');
    if (!data.content) errors.push('content missing');

    if (data.likes && (data.likes.length < 50 || data.likes.length > 2000)) {
        errors.push(`likes length ${data.likes.length} out of bounds (50-2000)`);
    }

    if (data.dislikes && (data.dislikes.length < 50 || data.dislikes.length > 2000)) {
        errors.push(`dislikes length ${data.dislikes.length} out of bounds (50-2000)`);
    }

    if (data.content && (data.content.length < 50 || data.content.length > 1500)) {
        errors.push(`content length ${data.content.length} out of bounds (50-1500)`);
    }

    const combinedContent = `${data.likes} ${data.dislikes} ${data.content}`.toLowerCase();
    const foundFlags = AI_RED_FLAGS.phrases.filter(phrase => combinedContent.includes(phrase));
    let patternMatched = false;
    AI_RED_FLAGS.patterns.forEach(r => { if (r.test(combinedContent)) patternMatched = true; });

    if (foundFlags.length > 0 || patternMatched) {
        if (options.verbose) logger.warn(`  [Validation Warning] AI-isms detected: ${foundFlags.join(',')}`);
    }

    return { valid: errors.length === 0, errors };
}

// ------------------------------------------------------------------------
// API Wrappers
// ------------------------------------------------------------------------
async function generateWithRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            if (attempt === maxRetries) throw error;
            const msg = error?.message || '';
            const isTransient = msg.includes('429') || msg.includes('timeout') || msg.includes('ECONNRESET') || msg.includes('fetch failed');
            if (!isTransient && !msg.includes('Parse Error')) throw error;

            if (options.verbose) logger.warn(`  [-] API failure, retrying (${attempt}/${maxRetries}) in ${2000 * attempt}ms...`);
            await sleep(2000 * attempt);
        }
    }
    throw new Error('Max retries exceeded');
}

// ------------------------------------------------------------------------
// Processing Loop
// ------------------------------------------------------------------------
async function processCompany(company: any) {
    const sanitizedName = sanitizeString(company.name);
    logger.info(`[${progress.completed + progress.failed}/${progress.totalTargeted || '?'}] Processing: ${sanitizedName}`);

    const dynamicCap = getDynamicReviewCap(company.employee_count);
    let generatedReviews: any[] = [];

    // Check pending count
    const { count: pendingCount, error: countErr } = await supabaseAdmin
        .from('company_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'pending');

    if (countErr) {
        logger.error(`  [DB Error] Could not fetch pending count: ${countErr.message}`);
        return;
    }

    const currentCount = pendingCount || 0;
    if (!options.force && currentCount >= dynamicCap) {
        logger.info(`  [Skip] Company has ${currentCount} pending reviews (Cap: ${dynamicCap}). Doing nothing.`);
        return;
    }

    // Determine how many reviews to actually generate this run
    let targetRunCount = options.count;
    if (!options.force && (currentCount + targetRunCount > dynamicCap)) {
        targetRunCount = Math.max(0, dynamicCap - currentCount);
    }

    if (targetRunCount <= 0) return;
    logger.info(`  Targeting ${targetRunCount} new review(s)...`);
    progress.totalTargeted += targetRunCount;

    // Fetch Layer 1 once.
    let layer1Output = "";
    try {
        const prompt1 = `Act as an HR analyst specializing in the Indian job market. Provide 3 realistic "Pros" and 3 realistic "Cons" for working at ${sanitizedName} (Industry: ${company.industry || 'Business'}). Keep them specific to Indian work culture (transport, shifts, appraisals). Output only raw text bullet points.`;

        layer1Output = await generateWithRetry(async () => {
            const res = await model.generateContent(prompt1);
            if (res.response.usageMetadata) {
                totalTokens.input += res.response.usageMetadata.promptTokenCount || 0;
                totalTokens.output += res.response.usageMetadata.candidatesTokenCount || 0;
            }
            return res.response.text();
        });
        await sleep(2000); // Rate limit buffer
    } catch (e: any) {
        logger.error(`  [Layer 1 Failed] Skipping company. ${e.message}`);
        progress.failed += targetRunCount;
        return;
    }

    // Generate Layer 2 Reviews
    for (let i = 0; i < targetRunCount; i++) {
        const persona = getRandomPersona();
        try {
            const prompt2 = `
You are writing a REAL employee review for ${sanitizedName} as a ${persona.role} with ${persona.tenure} experience.
Context from HR analysis: ${layer1Output.substring(0, 1500)}

CRITICAL INSTRUCTIONS:
1. Write like a real person - use "I", "we", "honestly", "tbh", "kinda", etc.
2. Include 1-2 minor typos or grammar mistakes.
3. NEVER use formal AI transitioning phrases (e.g., in conclusion, furthermore, delve, leverage, synergy).
4. Sound ${persona.sentiment}: ${persona.traits}.

RATING COHERENCE RULE:
The overall_rating MUST be logical and within ±1 of the average of the other 7 ratings. 

OUTPUT REQUIREMENTS:
Return ONLY a raw JSON object (no markdown).
{
  "overall_rating": ${getRatingRangeInstructions(persona.sentiment)},
  "work_life_balance": integer 1-5,
  "salary": integer 1-5,
  "promotions": integer 1-5,
  "job_security": integer 1-5,
  "skill_development": integer 1-5,
  "work_satisfaction": integer 1-5,
  "company_culture": integer 1-5,
  "designation": "${persona.role}",
  "department": "${persona.department}",
  "employment_type": "Full-time",
  ${getLengthInstructions(persona.reviewLength)}
}`;

            const reviewJSONText = await generateWithRetry(async () => {
                const res = await model.generateContent(prompt2);
                if (res.response.usageMetadata) {
                    totalTokens.input += res.response.usageMetadata.promptTokenCount || 0;
                    totalTokens.output += res.response.usageMetadata.candidatesTokenCount || 0;
                }
                return res.response.text();
            });

            const rawData = extractAndParseJSON(reviewJSONText);

            // Fix incoherent ratings
            enforceRatingCoherence(rawData);

            // Validate strict rules
            const validation = validateReviewData(rawData);
            if (!validation.valid) {
                throw new Error(`Data discarded during QA validation: ${validation.errors.join('; ')}`);
            }

            // DB Payload construction
            const dbPayload = {
                company_id: company.id,
                status: 'pending_validation', // FIXED: Mismatch with schema
                is_anonymous: true,
                overall_rating: rawData.overall_rating,
                work_life_balance: rawData.work_life_balance || 3,
                salary: rawData.salary || 3,
                promotions: rawData.promotions || 3,
                job_security: rawData.job_security || 3,
                skill_development: rawData.skill_development || 3,
                work_satisfaction: rawData.work_satisfaction || 3,
                company_culture: rawData.company_culture || 3,
                designation: rawData.designation,
                department: rawData.department,
                employment_type: rawData.employment_type || 'Full-time',
                likes: rawData.likes,
                dislikes: rawData.dislikes,
                content: rawData.content
            };

            if (options.dryRun) {
                logger.info(`  [Dry-Run] Generated: ${rawData.overall_rating}⭐ review from a ${persona.role}`);
                console.log(dbPayload);
                progress.completed++;
            } else {
                // Pre-insert verification
                const { data: verifyCompany } = await supabaseAdmin.from('companies').select('id').eq('id', company.id).single();
                if (!verifyCompany) {
                    throw new Error("Company was deleted prior to insert block.");
                }

                const { error: insertErr } = await supabaseAdmin.from('company_reviews').insert(dbPayload);
                if (insertErr) {
                    throw new Error(`DB Insert Error: ${insertErr.message}`);
                }

                logger.success(`  [Inserted] ${rawData.overall_rating}⭐ review from a ${persona.role}`);
                progress.completed++;
            }

            // Metrics 
            analytics.ratingDistribution[rawData.overall_rating] = (analytics.ratingDistribution[rawData.overall_rating] || 0) + 1;
            analytics.sentimentDistribution[persona.sentiment] = (analytics.sentimentDistribution[persona.sentiment] || 0) + 1;
            analytics.departmentDistribution[persona.department] = (analytics.departmentDistribution[persona.department] || 0) + 1;

            generatedReviews.push(rawData);

        } catch (e: any) {
            if (options.verbose) logger.error(`  [Layer 2 Failed] ${e.message}`);
            progress.failed++;
        }

        // Let pipeline breathe to avoid rate-limits
        await sleep(2500);
    }

    if (generatedReviews.length > 1) {
        for (let i = 0; i < generatedReviews.length - 1; i++) {
            for (let j = i + 1; j < generatedReviews.length; j++) {
                const similarity = calculateSimilarity(
                    generatedReviews[i].content,
                    generatedReviews[j].content
                );
                if (similarity > 0.85) {
                    logger.warn(`  ⚠️ High similarity (${(similarity * 100).toFixed(0)}%) between reviews for ${sanitizedName}`);
                }
            }
        }
    }
}

function calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

// ------------------------------------------------------------------------
// Main Execution
// ------------------------------------------------------------------------
async function healthCheck(): Promise<void> {
    logger.info("Running health checks...");

    // 1. Database check
    const { error: dbError } = await supabaseAdmin
        .from('companies')
        .select('id')
        .limit(1);

    if (dbError) {
        throw new Error(`❌ Database unreachable: ${dbError.message}`);
    }

    // 2. Gemini API check
    try {
        await model.generateContent("test");
    } catch (e: any) {
        throw new Error(`❌ Gemini API failed: ${e.message}`);
    }

    // 3. Environment variables check
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("❌ GEMINI_API_KEY not set in .env.local");
    }
    if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error("❌ SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL not set");
    }

    logger.success("✅ All health checks passed");
}

async function startGenerator() {
    logger.info("Initializing Generator Engine...");

    try {
        await healthCheck();

        // AUTO-THROTTLE CHECK
        // If we already have 15+ reviews in "pending_validation" or "approved" status, 
        // we don't need to generate more right now (2 weeks of runway).
        const { count, error: countError } = await supabaseAdmin
            .from('company_reviews')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending_validation', 'approved']);

        if (countError) {
            logger.error(`Failed to check existing review backlog: ${countError.message}`);
        } else if (count !== null && count >= 15) {
            logger.info(`Auto-Throttle: Already have ${count} reviews in backlog. Skipping generation.`);
            return;
        }

    } catch (e: any) {
        logger.error(e.message);
        process.exit(1);
    }

    // Initialize query focusing on Draft companies
    let query = supabaseAdmin.from('companies').select('*').eq('status', 'draft');

    // CLI targeting
    if (options.companies !== 'all') {
        const targeting = options.companies.split(',').map(s => s.trim());

        // Handle target by slug or UUID
        if (targeting[0].length === 36 && targeting[0].includes('-')) {
            query = query.in('id', targeting);
        } else {
            query = query.in('slug', targeting);
        }
    } else {
        // If not targeting specific companies, limit the pool entirely so we aren't iterating 1000s of rows in dev
        query = query.limit(5); // Smaller batch since we only need to top up the queue
    }

    const { data: companies, error } = await query;

    if (error || !companies || companies.length === 0) {
        logger.info("No companies found matching criteria to generate reviews for.");
        process.exit(0);
    }

    // Concurrency control limit 3 at a time 
    for (let i = 0; i < companies.length; i += 3) {
        const batch = companies.slice(i, i + 3);
        await Promise.all(batch.map(processCompany));
        await sleep(2000);
    }

    const actualCost = (
        (totalTokens.input * 0.000075) +
        (totalTokens.output * 0.0003)
    ) / 1000;

    // Telemetry Dumping
    logger.info("\n=== Generation Complete ===");
    console.log(JSON.stringify({
        mode: options.dryRun ? 'DRY-RUN' : 'LIVE',
        totalTargeted: progress.totalTargeted,
        totalGenerated: progress.completed,
        totalFailed: progress.failed,
        durationSeconds: ((Date.now() - startTime) / 1000).toFixed(1),
        estCostUSD: '$' + actualCost.toFixed(5),
        avgTokensPerReview: progress.completed > 0 ? Math.round((totalTokens.input + totalTokens.output) / progress.completed) : 0,
        successRate: progress.totalTargeted > 0
            ? (progress.completed / progress.totalTargeted * 100).toFixed(2) + '%'
            : '0%',
        analytics: analytics
    }, null, 2));

}

// Start
startGenerator().catch(e => {
    logger.error("Fatal unhandled exception in Generator process.");
    console.error(e);
    process.exit(1);
});

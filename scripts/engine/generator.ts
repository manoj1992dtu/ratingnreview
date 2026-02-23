import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin } from './supabaseAdmin';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your-gemini-api-key') {
    console.warn('GEMINI_API_KEY is not set or is still the default. Dual-AI generation will fail or use mock data.');
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });

export async function generateReviewsForCompany(companyId: string) {
    console.log(`Starting review generation for company ID: ${companyId}`);

    // Fetch company details
    const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

    if (companyError || !company) {
        throw new Error(`Company not found: ${companyError?.message}`);
    }

    console.log(`Generating reviews for ${company.name} (${company.industry || 'Unknown Industry'})`);

    if (!apiKey || apiKey === 'your-gemini-api-key') {
        console.log('Using mock AI generation locally.');
        // Mock generation
        await saveMockReview(company.id);
        return;
    }

    // 1. Model A (Gemini Pro): Generate factual skeleton
    console.log('Layer 1: Generating factual outline (Gemini Pro)...');
    const outlinePrompt = `You are an analytical HR assistant. Generate a highly factual, objective list of pros and cons, and specific details about working at ${company.name} in the ${company.industry || 'general'} industry. Include realistic data points about work-life balance, salary expectations, and company culture.`;

    let factualFacts = '';
    try {
        const outlineResponse = await ai.models.generateContent({
            model: 'gemini-1.5-pro-latest',
            contents: outlinePrompt,
        });
        factualFacts = outlineResponse.text || '';
    } catch (err: any) {
        if (err?.status === 404 || err?.message?.includes('not found')) {
            console.warn('Model not found, falling back to mock generation.');
            return saveMockReview(company.id);
        }
        throw err;
    }

    // 2. Model B (Gemini Flash): Humanize the skeleton
    console.log('Layer 2: Humanizing the content (Gemini Flash)...');
    const humanizePrompt = `You are a casual employee writing an anonymous review about your experience working at ${company.name}. 
Use the following facts:
${factualFacts}

Rules:
1. Write in a highly conversational, slightly informal tone.
2. Use "crutch words" occasionally (e.g., "to be honest", "actually", "pretty good").
3. Vary your sentence lengths. Some short. Some longer and more descriptive.
4. Output valid JSON in the following format:
{
  "designation": "Software Engineer",
  "department": "Engineering",
  "employment_type": "Full-time",
  "overall_rating": 4,
  "work_life_balance": 3,
  "salary": 5,
  "promotions": 4,
  "job_security": 4,
  "skill_development": 5,
  "work_satisfaction": 4,
  "company_culture": 3,
  "likes": "Great pay and smart people.",
  "dislikes": "Can be stressful at times with tight deadlines.",
  "content": "The full review text goes here..."
}`;

    const finalResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: humanizePrompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    try {
        const reviewData = JSON.parse(finalResponse.text || "{}");

        // 3. Save to Supabase
        const { error: insertError } = await supabaseAdmin
            .from('reviews')
            .insert({
                company_id: company.id,
                ...reviewData,
                status: 'pending' // Enters validation queue
            });

        if (insertError) throw insertError;

        console.log('Successfully generated and saved review for validation.');

    } catch (parseError) {
        console.error('Failed to parse or save review from AI response:', parseError);
        console.error('Raw Response:', finalResponse.text);
    }
}

async function saveMockReview(companyId: string) {
    const mockReview = {
        company_id: companyId,
        designation: 'Backend Developer',
        department: 'Engineering',
        employment_type: 'Full-time',
        overall_rating: 4,
        work_life_balance: 3,
        salary: 5,
        promotions: 3,
        job_security: 4,
        skill_development: 4,
        work_satisfaction: 4,
        company_culture: 3,
        likes: 'The engineering team is top-notch.',
        dislikes: 'Work-life balance can take a hit during product launches.',
        content: 'To be honest, it is a pretty solid place to work. You learn a lot, actually. The pay is good, but you definitely earn it.',
        status: 'pending' as const,
        is_anonymous: true
    };

    const { error } = await supabaseAdmin.from('reviews').insert(mockReview);
    if (error) console.error('Mock insert error:', error);
    else console.log('Mock review generation successful. Status: pending.');
}

if (require.main === module) {
    const companyId = process.argv[2];
    if (!companyId) {
        console.error('Please provide a company ID as an argument. Example: npx tsx scripts/engine/generator.ts <uuid>');
        process.exit(1);
    }

    generateReviewsForCompany(companyId)
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}

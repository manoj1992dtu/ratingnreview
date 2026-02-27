# Script Engine Detailed Implementation Plan: Phase 4 (The Generator)

## Objective
Implement `scripts/engine/generator.ts`. This script serves as the second phase of the content automation pipeline. It reads companies recently inserted by the scraper, and utilizes a "Dual-AI Persona" architecture to generate hyper-realistic, highly-nuanced employee reviews. These reviews are then securely inserted into the `public.reviews` table as `pending`.

## Setup Requirements

1. **Environment Variables**
   The script relies on the `.env.local` file:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`

2. **Supabase Schema (Target: `public.company_reviews`)**
   The database expects the following constraints for reviews:
   - `company_id` (UUID references companies)
   - Multidimensional Ratings (1-5): `overall_rating`, `work_life_balance`, `salary`, `promotions`, `job_security`, `skill_development`, `work_satisfaction`, `company_culture`
   - Text fields: `designation`, `department`, `employment_type`, `likes`, `dislikes`, `content`
   - System fields: `status` ('pending'), `is_anonymous` (true)

3. **Security Constraints Checked**
   - [x] Prompt injection prevention via sanitization
   - [x] SQL injection safely handled by Supabase client parameterized queries
   - [x] Input validation (ratings 1-5 enforce boundaries)
   - [x] Foreign key constraint checks before insertions

---

## Implementation Steps

### 4.1 Structure, Imports, & CLI
- Import `supabaseAdmin` from `./supabaseAdmin.ts`.
- Import `logger` from `./logger.ts`.
- Import `GoogleGenerativeAI`.
- Implement CLI parsing for the follow arguments:
  - `--companies`: Comma-separated DB slugs/IDs or "all"
  - `--count`: Number of reviews per company (default: 1)
  - `--dry-run`: Generate but don't insert; output to console/file.
  - `--force`: Bypass deduplication checks
  - `--verbose`: Detailed logging

**Example CLI Usage:**
```bash
# Generate 5 reviews for specific companies
npx tsx scripts/engine/generator.ts --companies=uuid1,uuid2 --count=5

# Dry-run mode (no database writes, using default count of 1)
npx tsx scripts/engine/generator.ts --companies=all --dry-run
```

**Dry-Run Mode Requirements:**
When `--dry-run` is invoked, do not run `supabaseAdmin.insert()`. Simply log the output explicitly to the console. Example:
```json
{
  "company": "Google India",
  "generated_reviews": [ ... ],
  "would_insert": false,
  "validation_passed": true
}
```

### 4.2 State Management & Dynamic Target Caps
Before generating reviews for a company:
1. **Dynamic Cap Calculation:** Determine a sensible maximum allowed review count based on the company's `employee_count`. This scales to match real-world 8-12% penetration on platforms like Glassdoor/AmbitionBox:
   - Categorical tagging: `startup` (~10), `unicorn` (~200), `mnc`/`fortune` (~500).
   - Micro (<50): 5 to 10
   - Small/Mid (<1000): 15 to 100
   - Enterprise (1000+): Scales linearly at 6% of max employees (Hard cap: 2000 maximum reviews)
2. **Deduplication Check:** Check the database for existing reviews. Only generate if the count of `status = 'pending'` (and published) for this `company_id` is less than the dynamic cap. If it has room, generate either the configured `--count` parameter or the remaining gap to the cap (whichever is smaller).
3. Allow bypassing these cap checks if the `--force` flag is provided.

### 4.3 Safe Fetching & Prompt Injection Safety
1. **Company Fetching:** Fetch target companies from `public.companies`.
2. **Sanitization:** Prevent prompt injection disguising instructions as company names:
   ```typescript
   function sanitizeString(name: string): string {
     return name.replace(/[^\w\s-]/g, '').substring(0, 100);
   }
   ```

### 4.4 The Dual-AI Architecture Concept & Persona Variety
We use two LLM passes with dynamic personas strictly mapped to logical departments.

**Expanded Personas Catalog:**
```typescript
const PERSONAS = [
  // Technical Roles
  { role: 'Software Engineer', tenure: '2 years', sentiment: 'mixed', traits: 'technical, detail-oriented', department: 'Engineering', reviewLength: 'short' },
  { role: 'Senior Software Engineer', tenure: '4 years', sentiment: 'frustrated', traits: 'experienced, critical of process', department: 'Engineering', reviewLength: 'medium' },
  { role: 'QA Engineer', tenure: '1.5 years', sentiment: 'neutral', traits: 'methodical, quality-focused', department: 'Engineering', reviewLength: 'short' },
  // Management
  { role: 'Senior Manager', tenure: '5 years', sentiment: 'positive', traits: 'diplomatic, strategic', department: 'Management', reviewLength: 'long' },
  { role: 'Team Lead', tenure: '3 years', sentiment: 'frustrated', traits: 'burned out, critical', department: 'Management', reviewLength: 'medium' },
  // Business Roles
  { role: 'Business Analyst', tenure: '2.5 years', sentiment: 'mixed', traits: 'analytical, process-oriented', department: 'Operations', reviewLength: 'short' },
  { role: 'Sales Executive', tenure: '1 year', sentiment: 'positive', traits: 'target-driven, outgoing', department: 'Sales', reviewLength: 'short' },
  { role: 'HR Coordinator', tenure: '2 years', sentiment: 'neutral', traits: 'people-focused, organized', department: 'HR', reviewLength: 'medium' }
];
```

**Prompt 1 (Layer 1 - Context Gathering):**
```text
Act as an HR analyst specializing in the Indian job market. Provide 3 realistic "Pros" and 3 realistic "Cons" for working at {sanitized_company_name} (Industry: {industry}). 
Keep them specific to Indian work culture (transport, shifts, appraisals).
Output only raw text bullet points.
```
*(Note: To save API limits/costs, execute Prompt 1 only once per company, caching the context for all `N` reviews generated for that company.)*

**Prompt 2 (Layer 2 - JSON Generation with Constraints):**
```text
You are writing a REAL employee review for {companyName} as a {persona.role} with {persona.tenure} experience.
Context from HR analysis: {layer_1_output}

CRITICAL INSTRUCTIONS:
1. Write like a real person - use "I", "we", "honestly", "tbh", "kinda", etc.
2. Include 1-2 minor typos or grammar mistakes.
3. NEVER use formal AI transitioning phrases (e.g., in conclusion, furthermore, delve, leverage).
4. Sound {persona.sentiment}: {persona.traits}.

RATING COHERENCE RULE:
The overall_rating MUST be logical and within ±1 of the average of the other 7 ratings. 

OUTPUT REQUIREMENTS:
Return ONLY a raw JSON object (no markdown).
{
  "overall_rating": {getRealisticRatingRange(persona.sentiment)},
  "work_life_balance": integer 1-5,
  "salary": integer 1-5,
  "promotions": integer 1-5,
  "job_security": integer 1-5,
  "skill_development": integer 1-5,
  "work_satisfaction": integer 1-5,
  "company_culture": integer 1-5,
  "designation": "{persona.role}",
  "department": "{persona.department}",
  "employment_type": "Full-time",
  {getLengthInstructions(persona.reviewLength)}
}
```

### 4.5 Resilient Executions (Retries & Extraction)
1. **Exponential Backoff:** Set up an async wrapper `generateWithRetry` limiting at 3 attempts for `429`, `timeout`, and `ECONNRESET` exceptions.
2. **Regex JSON Extractor:**
   ```typescript
   function extractAndParseJSON(text: string): any {
     const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
     const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
     if (!jsonMatch) throw new Error('No JSON object found');
     return JSON.parse(jsonMatch[0]);
   }
   ```

### 4.6 Strict Validation & QA Constraints
1. **Length Validation**: `likes` & `dislikes` must be between `50` and `2000` characters. `content` must be between `50` and `1500` characters. Uses an explicit `errors: string[]` reporting array instead of generic fail booleans.
2. **Rating Coherence**: Calculate the average of the 7 granular sub-ratings. If `overall_rating` deviates from this average by `> 1.5`, logarithmically correct the `overall_rating` to match the average, or `Math.round(average)`.
3. **Advanced AI Detection List**:
   - Phrases: `['in conclusion', 'furthermore', 'delve', 'leverage', 'synergy', 'deep dive', 'game changer']`
   - Patterns: `/\.\s*In\s+(addition|summary|conclusion)/gi`
   If red flags are found, strip them out or throw a warning in the console.
4. **Jaccard Similarity Check**: Runs a nested loop analyzing all explicitly generated reviews per batch; if the textual overlap > 85%, it flags a warning immediately to prevent duplicating talking points.

### 4.7 DB Transactions, Concurrency, & Safety
1. **Health Checks:** A rigorous upfront `.healthCheck()` verifies DB connections, the Gemini endpoint, and environment setups to fail fast if disconnected.
2. **Concurrency Control**: Use a batch promise executor so you can run generations concurrently without destroying memory.
3. **Pre-Insert Fetch:** Always re-select `id` from the company right before insertion to ensure Foreign Key integrity (`23503` codes) into the `company_reviews` table. 

### 4.8 Telemetry & Cost Logging
Print a final JSON object summary to the terminal.
**Cost Logic:**
- Exact Gemini computations tracking `usageMetadata` (prompt vs candidate tokens). Includes generation demographic analytics.
```typescript
{
  mode: "LIVE",
  totalTargeted: 7,
  totalGenerated: 7,
  totalFailed: 0,
  durationSeconds: "97.3",
  estCostUSD: "$0.00266",  // Actual mapped cost via utilized tokens
  avgTokensPerReview: 1115,
  successRate: "100.00%",
  analytics: {
    ratingDistribution: { "2": 4, "3": 1, "4": 2 },
    sentimentDistribution: { "frustrated": 4, "mixed": 1, "neutral": 2 },
    departmentDistribution: { "Marketing": 1, "Engineering": 3, "Management": 2, "Operations": 1 }
  }
}
```

---

## Acceptance Criteria (Enhanced)
- [ ] Script heavily relies on CLI arguments (`--companies`, `--count`, `--dry-run`, `--force`).
- [ ] Generation deduplicates against `# pending` per company and enforces idempotency.
- [ ] Safe Input Sanitizing to inherently block prompt injection.
- [ ] Contextual Layer 1 prompt executes once, then explicitly cached across loops.
- [ ] Dynamic, Department-anchored Personas prevent role/department hallucinations.
- [ ] Exponential Backoff resilient retry logic handles network faults.
- [ ] Robust Regex extraction unwraps unexpected Gemini markdown blocks.
- [ ] Post-Validation strictly ensures logical `overall_rating` coherence vs granular ratings.
- [ ] AI-isms detected and heavily warned during length constraint evaluations.
- [ ] Pre-Insertion transaction confirmation protects foreign keys.
- [ ] Concurrency (`Promise.all`) utilized inside a limiting loop batch to boost generation speed.
- [ ] A final telemetry string spits out Cost/Success/Speed summaries natively.

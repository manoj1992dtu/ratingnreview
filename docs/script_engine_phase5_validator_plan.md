# Script Engine Detailed Implementation Plan: Phase 5 (The Validator)

## Objective
Implement `scripts/engine/validator.ts`. This is the third step of the content automation pipeline. It acts as an automated "Quality Assurance" gate. It scans all generated reviews sitting in the database with `status = 'pending'`, applies strict programmatic checks for AI-hallucinations, length, and rating validity. 
- Reviews that pass are updated to `status = 'approved'`.
- Reviews that fail are updated to `status = 'rejected'`.

*(Note: We do not need Gemini for this step. This is purely programmatic.)*

## Setup Requirements

1. **Environment Variables**
   The script relies on the `.env.local` file:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Supabase Schema Target**
   We are querying and modifying the `public.company_reviews` table.

## Implementation Steps

### 5.1 Structure & Imports
- Import `supabaseAdmin` from `./supabaseAdmin.ts`.
- Import `logger` from `./logger.ts`.

### 5.2 Fetching Pending Reviews
1. **CLI Arguments:**
   - `--dry-run`: Evaluate reviews but do not run `update` queries on the database.
   - `--verbose`: Print individual success/warn log lines for each evaluation.
   - `--show-rejected`: Only print warnings for rejected reviews.
   - `--limit=N`: Stop processing after evaluating `N` reviews for quick sanity typing.
2. **Batch Processing Strategy:**
   - Instead of fetching all at once, safely fetch from `public.company_reviews` in chunks of 100 via `.range(offset, offset + 99)`.
   - Process batch incrementally until no more pending rows are returned.

### 5.3 Programmatic Validation Checks
Create a robust validation function `isReviewValid(review: any): boolean` that enforces the following checks:

**1. Content Presence & Length Validation:**
   - Both `likes`, `dislikes`, and `content` must exist and be strictly strings.
   - `likes` length must be >= 50 characters and <= 2000 characters.
   - `dislikes` length must be >= 50 characters and <= 2000 characters.
   - `content` length must be >= 50 characters and <= 1500 characters.

**2. Rating Validity & Coherence Check:**
   - Ensure `overall_rating` is an integer strictly between `1` and `5`.
   - Ensure the required inner ratings (`work_life_balance`, `salary`, `company_culture`, etc.) are also integers.
   - Verify rating coherence: `overall_rating` must be within 1.5 points of the average of the granular ratings. If it deviates too much, it fails.

**3. Similarity Check:**
   - Calculate Jaccard similarity between `likes` and `dislikes`. 
   - Strict Reject (`CRITICAL > 0.90`): The LLM hallucinated entirely parallel fields.
   - Warn Only (`WARNING > 0.70`): Approve the review, but emit a soft warning log to trace if our generator prompts are degrading.

**4. AI-Hallucination & Tell Checks:**
   - Create an expanded exact-match and regex array:
     - Phrases: `in summary`, `in conclusion`, `furthermore`, `moreover`, `to summarize`, `delve`, `leverage`, `synergy`, `paradigm shift`, `testament to`, `beacon of`, `look no further`, `game changer`.
     - Patterns: `/\.\s*In\s+(addition|summary|conclusion)/gi`, `/(very very|really really)/gi`, `/\b(utilize|utilization)\b/gi`.
   - If the combined strings (`likes + dislikes + content`) contain these flags, reject.

**5. Markdown/JSON Bleed Checks:**
   - Validate that the text doesn't accidentally contain residual JSON brackets wrapper artifacts from a missed extraction (e.g., `{"overall_rating":` printed inside the text field).

### 5.4 Database Updation
Loop through the fetched pending reviews:
1. If `isReviewValid(review)` returns `true`:
   - Update `status` to `'approved'`.
2. If `isReviewValid(review)` returns `false`:
   - Update `status` to `'rejected'`. (We keep rejected reviews in the DB for auditing purposes rather than deleting them).

### 5.5 Logging & Telemetry
Print a final telemetry output containing detailed reasoning blocks.

```json
{
  "mode": "LIVE",
  "totalEvaluated": 1000,
  "totalApproved": 980,
  "totalRejected": 20,
  "rejectionReasons": {
    "AI phrase detected: 'in conclusion'": 12,
    "likes and dislikes are too similar": 5,
    "Rating incoherent. Overall: 1, Avg: 4.2": 3
  }
}
```

---

## Acceptance Criteria
- [ ] Running `npx tsx scripts/engine/validator.ts` successfully fetches only `'pending'` reviews.
- [ ] Programmatic checks (no Gemini tokens used) accurately filter out short/bad reviews.
- [ ] Regex correctly identifies and rejects AI sounding phrases ("In conclusion", etc.)
- [ ] The `status` column in `public.company_reviews` is updated to `'approved'` or `'rejected'` correctly.
- [ ] A final terminal log displays exactly how many were approved vs rejected.

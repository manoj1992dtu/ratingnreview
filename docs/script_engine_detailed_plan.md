# Script Engine Detailed Implementation Plan (Phase 2)

## 1. Overview
The Script Engine is an autonomous set of Node.js scripts designed to safely and securely populate the platform with high-quality, human-like company reviews and accurate company metadata. All scripts will live inside `scripts/engine/` and be executed via `npm run` commands or cron jobs.

The engine follows a 4-step execution pipeline orchestrated by a central `runner.ts`:
1. **Scraper (`scraper.ts`)** -> Fetches raw data
2. **Generator (`generator.ts`)** -> Generates AI reviews (Dual-AI setup)
3. **Validator (`validator.ts`)** -> Validates and approves drafts
4. **Publisher (`publisher.ts`)** -> Drip-publishes approved content

---

## 2. Infrastructure Setup
### Environment Variables Required
The engine runs locally (or on a cloud VM) and directly interfaces with the Supabase database using the Service Role Key to bypass RLS.
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PUBLISHER_BATCH_SIZE=5 (Optional, sets max reviews published per run)
```

### Shared Utilities
- `supabaseAdmin.ts`: Initializes the `@supabase/supabase-js` client using the `SUPABASE_SERVICE_ROLE_KEY`.
- `logger.ts`: A simple logging utility to color-code success/errors in the console.

---

## 3. The Scripts

### 3.1. The Runner (`scripts/engine/runner.ts`)
**Purpose:** Central orchestrator to run the full pipeline sequentially.
**Process:**
```typescript
async function runPipeline() {
  await scraper();    // Step 1
  await generator();  // Step 2
  await validator();  // Step 3
  await publisher();  // Step 4
}
```

### 3.2. The Scraper (`scripts/engine/scraper.ts`)
**Purpose:** Fetch and normalize raw company metadata and insert it into Supabase.

**Input:** A JSON array of company names or domain names (e.g., `['Apple', 'Google', 'Microsoft']`).
**Process:**
1. Check if the company already exists in `public.companies`. If yes, skip to save API calls.
2. Formulate a prompt for **Gemini Pro** asking it to return reliable, factual metadata about the company as a JSON payload (e.g., Industry, Headquarters location, Approximate Employee Count, official Website URL).
3. **CRITICAL:** Implement a 200ms delay between fetches to prevent rate limits from Gemini API (HTTP 429).
4. Parse the Gemini JSON output and generate a safe URL slug (e.g., `Apple Inc.` -> `apple-inc`).
5. Insert the combined data into `public.companies`.

### 3.3. The Generator (`scripts/engine/generator.ts`)
**Purpose:** Use a Dual-AI architecture to write hyper-realistic reviews grouped by industry.

**Architecture:**
- **Layer 1 (The Analyst - Gemini Pro):** Extracts parameters based on the company's specific **industry**. Generates raw data points objective company pros and cons.
- **Layer 2 (The Employee - Gemini Flash):** Takes Layer 1 data and rewrites it adopting a specific persona. It is instructed to use conversational filler and keep the tone casual to bypass AI detection.

**Process:**
1. Fetch companies from Supabase that have fewer than *X* reviews, **grouped by industry**. This allows the AI to use an industry-specific prompt context.
2. For each company, run the Dual-AI sequence to generate 1-3 new reviews.
   - **Error Handling:** Wrap API calls in a `try/catch` block so if Gemini fails or rate-limits on a specific company, the script skips it and continues running rather than crashing the whole batch.
3. **Duplicate Prevention:** Query the database for existing reviews for this `company_id`. Hash or compare the generated content to ensure similarity isn't too high (>80%) before saving.
4. Map the generated data to the multidimensional rating fields.
5. Insert into `public.reviews` with `status = 'pending'`.

### 3.4. The Validator (`scripts/engine/validator.ts`)
**Purpose:** A strict quality gate to ensure AI didn't hallucinate bad data.

**Process:**
1. Query Supabase for all reviews where `status = 'pending'`.
2. Apply programmatic checks:
   - Does `likes` and `dislikes` contain text?
   - **Word Count Check:** Is the review word count >= 300 words? If not, it fails and goes to `rejected`.
   - Are all rating integers exactly between 1 and 5?
   - Ensure there are no AI-tells (Regex check for phrases like "As an AI language model..." or "In conclusion,").
3. If it passes: Update row to `status = 'approved'`.
4. If it fails: Update row to `status = 'rejected'`.

### 3.5. The Publisher (`scripts/engine/publisher.ts`)
**Purpose:** Drip-feed content into the live database to build natural SEO growth without triggering spam penalties.

**Process:**
1. Query Supabase for a limited batch (e.g., config via `PUBLISHER_BATCH_SIZE`, default 5) of reviews where `status = 'approved'` and `published_at IS NULL`.
2. Loop through the batch and assign **scheduled, forward staggered timestamps** to `published_at` (e.g., Review 1 gets `NOW()`, Review 2 gets `NOW() + 36 hours`, Review 3 gets `NOW() + 72 hours`). This schedules them into the future logically instead of back-dating them which would scramble chronological sorts.
3. *Note: We will rely on establishing a Database Trigger on `reviews` to automatically recalculate `avg_rating` and `review_count` for the parent company row, preventing race conditions. The manual update step here is removed.*

---

## 4. Scheduling & Cron Jobs
We recommend the following logical isolation for deploying cron jobs on your Linux VM/Instance.

### Setting up the Crontab
To edit your cron jobs, ssh into your server and run:
```bash
crontab -e
```

Add the following commands, ensuring you replace `/path/to/project` with your actual project directory. Using `npm run` ensures `tsx` and the local `.env.local` resolve correctly.

```bash
# ==========================================
# RATING & REVIEW - AI SCRIPT ENGINE CRONS
# ==========================================

# 1. Scraper & Generator: Run every Mon, Wed, Fri at 2:00 AM
0 2 * * 1,3,5 cd /path/to/project && npm run engine:scrape >> /var/log/engine_scrape.log 2>&1
30 2 * * 1,3,5 cd /path/to/project && npm run engine:generate >> /var/log/engine_generate.log 2>&1

# 2. Validator: Run Daily at 4:00 AM (Cleans up drafts generated overnight)
0 4 * * * cd /path/to/project && npm run engine:validate >> /var/log/engine_validate.log 2>&1

# 3. Publisher: Run Daily at 9:15 AM (Simulates organic morning publication)
15 9 * * * cd /path/to/project && npm run engine:publish -- --batch-size=5 >> /var/log/engine_publish.log 2>&1
```

**Understanding the deployment strategy:**
- **Scraper & Generator:** Heavy-lifting LLM hits should happen spaced out (MWF) at night to avoid rate limits or disrupting normal workflows.
- **Validator:** Cleans up and approves pending reviews nightly so they are ready for the publisher.
- **Publisher:** Can safely be run *every single day*. Because of its dual-phase architecture, running it daily simply flips anything that hits its dynamically delayed `published_at` timestamp without accidentally flooding the site.

---

## 5. Next Steps for Implementation
1. Scaffold the `scripts/engine/` directory structure.
2. Create `supabaseAdmin.ts` so scripts can talk to the local DB.
3. Develop `scraper.ts` with API rate-limit delays.
4. Develop `generator.ts` with industry-aware prompts and fail-safe `try/catch` blocks.

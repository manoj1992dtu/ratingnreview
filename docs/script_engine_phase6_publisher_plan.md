# Script Engine Detailed Implementation Plan: Phase 6 (The Publisher)

## Objective
Implement `scripts/engine/publisher.ts`. This is the final step of the content automation pipeline. It takes reviews that the Validator has moved to `status = 'approved'` and publishes them by assigning forward-staggered `published_at` timestamps. This creates a natural, slow drip of content for SEO purposes.

## Setup Requirements

1. **Environment Variables**
   The script relies on the `.env.local` file:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Supabase Schema Target**
   We are querying and modifying the `public.company_reviews` table.
   *(Note: The `published_at` column is correctly indexed in the database migrations. This is vital since Phase A continually queries `where published_at <= NOW()`.)*

## Implementation Steps

### 6.1 Structure & Imports
- Import `supabaseAdmin` from `./supabaseAdmin.ts`.
- Import `logger` from `./logger.ts`.
- Set up CLI arguments:
  - `--companies`: Comma-separated DB slugs/IDs or "all".
  - `--dry-run`: Evaluate and plan publication dates without updating the DB.
  - `--batch-size=N`: Set the number of reviews to schedule/publish per run (default: 5).
  - `--verbose`: Print detailed logs.

### 6.2 Dual Operation Mode
To avoid frontend leaks where reviews go live before their time, the Publisher has two responsibilities inside the same script:

**Phase A: Flipping "Due" Reviews to Published**
1. Fetch reviews where `status = 'approved'` AND `published_at <= NOW()`.
2. *Important:* Cap this fetch to `--batch-size`! If the script hasn't run in a while and 100s of reviews are past due, dumping them all to "published" at once defeats the slow-drip purpose. Capping it ensures they still drip out incrementally in realistic batches.
3. Update them to `status = 'published'`.

**Phase B: Scheduling Future Reviews**
1. Fetch `public.company_reviews` where `status = 'approved'` AND `published_at IS NULL`.
2. Apply `--companies` filtering if provided. *(Note: The `--companies` argument intentionally only applies to scheduling (Phase B), not pulling past-due flips (Phase A). You want any past-due review to go live regardless of your targeted manual scheduling).*
3. **Company Diversity Logic (Round-Robin):** Group the fetched reviews by `company_id`. Pick one review from company A, one from company B, etc., cycling repeatedly until the scheduling queue hits the `--batch-size`. This prevents accidentally scheduling 5 reviews for the same company consecutively. *(Note: If `--companies=A` is passed, or only company A has pending reviews, the round-robin gracefully degrades into picking sequentially from company A. Do not over-engineer this edge case.)*
4. Keep the total scheduling queue limited to `--batch-size`.

### 6.3 Temporal Staggering Logic (Conflict Aware)
To simulate organic user activity without overlapping multiple script runs, we calculate safe forward-staggered timestamps:

1. **Base Time Check:** Query the database for the *latest* `published_at` among ALL approved/published reviews.
2. If `MAX(published_at) > NOW()`, use that as the starting baseline. Otherwise, use `NOW()`.
3. **Interval Calculation:** For each review in our pending-schedule batch:
   - Add a random delay (e.g. 12 to 36 hours) to the running base time.
   - Assign this as the `published_at` timestamp.
   - *Status remains `approved`.* (It will be flipped by Phase A on a future run once that time passes).

### 6.4 Database Update & Dry-Run Behavior
Perform database mutations using explicitly structured Supabase `.update()` calls:
1. **Phase A Update:** For each flipped review, `UPDATE company_reviews SET status = 'published' WHERE id IN (...)`
2. **Phase B Update:** For each precisely scheduled review, `UPDATE company_reviews SET published_at = [FUTURE_DATE] WHERE id = ...`

**Dry-Run Expected Output:**
If `--dry-run` is invoked, **skip all update queries**. Instead, explicitly print the planned actions to the terminal so developers can preview timestamps securely before committing:
```json
{
  "dryRun": true,
  "wouldFlipToPublished": ["uuid_here_1", "uuid_here_2"],
  "wouldSchedule": [
    { "id": "uuid_here_3", "plannedTimestamp": "2026-03-05T14:30:00Z" }
  ]
}
```

### 6.5 Logging & Telemetry
Print a final summary cleanly to the terminal when the script finishes.

```json
{
  "mode": "LIVE",
  "reviewsFlippedToPublished": 2,
  "reviewsNewlyScheduled": 5,
  "lastScheduledDate": "2026-03-05T14:30:00Z"
}
```

---

## Acceptance Criteria
- [ ] Safe `status` design: Reviews remain `approved` when scheduled into the future, guaranteeing no premature frontend leaks.
- [ ] Script successfully fetches 'due' reviews (`published_at <= NOW()`) and sets `status = 'published'`.
- [ ] Script successfully fetches unscheduled reviews (`published_at IS NULL`), dynamically distributes by company, and sets realistic staggered `published_at` offsets.
- [ ] The base time dynamically pulls from `MAX(published_at)` rather than hardcoded `NOW()` to avoid stacking issues.
- [ ] Supports robust CLI args: `--companies`, `--batch-size`, and `--dry-run`.

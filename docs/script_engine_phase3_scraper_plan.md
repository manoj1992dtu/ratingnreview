# Script Engine Detailed Implementation Plan: Phase 3 (The Scraper)

## Objective
Implement `scripts/engine/scraper.ts`. This script acts as the first phase of the content automation pipeline. It reads a list of company names, queries Gemini to fetch factual metadata (industry, headquarters, employee count, website URL, etc.), and securely inserts these records as `draft` in the `public.companies` table within Supabase.

## Setup Requirements

1. **Install Dependencies**
   Ensure the following npm packages are installed to handle the Generative AI abstraction, environment parsing, and slug generation:
   - `@google/generative-ai`
   - `slugify` (for turning "Apple Inc." into `apple-inc`)
   - `dotenv` (already used in `supabaseAdmin.ts`)

2. **Environment Variables**
   The script relies on the `.env.local` file containing:
   - `SUPABASE_URL` (Server-only URL, NO `NEXT_PUBLIC_` prefix)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`

## Implementation Steps

### 3.1 Structure & Imports
- Import the initialized `supabaseAdmin` client from `./supabaseAdmin.ts`.
- Import the configured `logger` from `./logger.ts` for clean terminal output.
- Import the `GoogleGenerativeAI` client and `slugify`.
- Load environment variables securely.

### 3.2 Define the Seed Data Interface
Create a static list or external JSON import of company names to iterate over.
Example:
```typescript
const companiesToScrape = [
    "TCS",
    "Infosys",
    "Wipro",
    "Google",
    "Microsoft"
];
```

### 3.3 Deduplication Logic
Before hitting the Gemini API, create a helper to query Supabase to see if the company already exists via its slug to conserve API credits.

### 3.4 The Gemini Prompt Mechanism
The script must prompt **Gemini-1.5-Flash** (fastest/cheapest for data fetching).
The prompt must be highly specific about missing values, India context, and strict JSON format, without requesting images/logos natively.

**Prompt Template:**
```text
Return factual metadata for the company: "{companyName}".
This is for a company review platform focused on 
the Indian job market.

Respond ONLY in raw JSON with no markdown formatting.
No backticks. No explanation. JSON only.

{
  "name": "official company name",
  "industry": "primary industry sector",
  "headquarters": "global headquarters full address",
  "india_headquarters": "India HQ address if 
                       india_presence is india_office,
                       main HQ if indian_company,
                       null if no_india_presence",
  "city": "primary city (India city if has India office,
           else global HQ city)",
  "state": "state name (Indian state if applicable, 
            else null)",
  "country": "India for Indian companies, 
              actual country for foreign MNCs",
  "india_presence": "one of: indian_company 
                   (if headquartered in India), 
                   india_office 
                   (if MNC with India operations),
                   no_india_presence 
                   (if purely global no India office)",
  "employee_count": "global employee count range 
                     like 10,000-50,000",
  "india_employee_count": "India-specific employee 
                           count or null",
  "website": "official website URL",
  "description": "2 paragraph overview. Paragraph 1: 
                  company overview globally. 
                  Paragraph 2: India operations, 
                  India work culture, and why Indian 
                  professionals consider this company.",
  "ceo_name": "India MD or Country Head name 
               (global CEO if no India head)",
  "founded_year": integer year only,
  "company_type": "one of: Indian Private, 
                   Indian Public Listed, PSU, 
                   MNC, Startup, Unicorn",
  "revenue": "India revenue if available, 
              else global approximate revenue",
  "competitors": ["top 3 direct competitors 
                  in Indian market specifically"]
}

Rules:
- Return null for any field you are not confident about
- Never hallucinate or invent data
- Prioritize Indian market context over global
- For MNCs always focus on India operations
- For Indian IT companies use Indian headquarters
- competitors must be relevant to Indian market
- description must mention Indian work culture context
- founded_year must be integer not string
```

### 3.5 Type Definitions
Create a TypeScript Interface mapping the exact output requested from the Gemini prompt to ensure safe parsing before database insertion. Note that `logo_url` is intentionally omitted from scraper automation.
```typescript
interface ScrapedCompanyData {
  name: string
  industry: string
  headquarters: string
  india_headquarters: string | null
  india_presence: 'indian_company' | 
                  'india_office' | 
                  'no_india_presence'
  city: string | null
  state: string | null
  country: string
  employee_count: string
  india_employee_count: string | null
  website: string
  description: string
  ceo_name: string | null
  founded_year: number | null
  company_type: string
  revenue: string | null
  competitors: string[]
}
```

### 3.6 Parse and Validate
Create a `try/catch` block within the scraping loop:
1. Fetch the raw text from Gemini.
2. Clean the text (strip `\```json` markdown wrappers).
3. `JSON.parse()` the output.
4. **Validation Check:** Do not blindly insert. Must check base required fields minimum.
```typescript
function validateScrapedData(data: any): boolean {
  if (!data.name) return false;
  if (!data.industry) return false;
  if (!data.headquarters) return false;
  if (!data.description) return false;
  return true;
}
```
If validation fails, log an error and skip the company. 

### 3.7 Database Modifications & Insertion
1. **Competitors Schema Mod:** Ensure the `companies` table holds the competitors strictly via an Array:
   ```sql
   ALTER TABLE companies ADD COLUMN competitors text[] DEFAULT '{}';
   ```
2. Using `supabaseAdmin`, insert the cleanly mapped object into the `public.companies` table. 
3. Ensure `status` explicitly maps to `draft`. (Publisher promotes to published).
4. Do not submit a `published_at` timestamp here. 
5. Use `slugify(data.name, { lower: true, strict: true })` to generate the `slug`.

### 3.8 Delay & Rate Limit Safety
Implement a standard `sleep()` promise function to pause for **minimally 1000ms - 1500ms** between successful API calls to prevent the `429 Too Many Requests` status.

### 3.9 Error Handling
- If Gemini hallucinates bad JSON, log a distinct warning and `continue` to the next company in the loop rather than crashing the script.
- Log failures directly to the terminal using `logger.error()`.

## Acceptance Criteria
- [ ] Running `npx tsx scripts/engine/scraper.ts` parses a list of 5 companies.
- [ ] Duplicates are skipped correctly.
- [ ] JSON is parsed successfully from Gemini.
- [ ] Inserted into companies table securely.
- [ ] `status = 'draft'` on all inserts (not published).
- [ ] `logo_url` NOT requested from Gemini.
- [ ] `city` and `state` populated separately in schema payload.
- [ ] `competitors` stored as array in Supabase.
- [ ] Validation prevents missing/incomplete profiles from being inserted.
- [ ] `SUPABASE_URL` utilized without `NEXT_PUBLIC_` prefix (pure backend interaction).

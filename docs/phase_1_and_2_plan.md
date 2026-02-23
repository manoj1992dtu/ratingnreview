# Implementation Plan: Phase 1 & 2 Reflected

## Phase 1: Foundation (Database, Auth, & App Setup)
**Status:** Completed ✅

**Objective:** Establish the foundational infrastructure, including the database schema, core application structure, and environment variables.

*   **Database Schema & Migrations (Supabase):**
    *   Created `0001_initial_schema.sql` to define core tables: `industries`, `companies`, `reviews`, `company_salaries`, `company_industries`, and `submission_rate_limit`.
    *   Created `0002_rls_policies.sql` to implement Row Level Security (RLS) policies for data protection.
    *   Created `0003_add_published_at.sql` to add the `published_at` timestamp to the `reviews` table, supporting our slow-drip publishing strategy.
    *   Verified all migrations ran successfully against the local Supabase container.
*   **Next.js Application Structure:**
    *   Bootstrapped standard Next.js (App Router) project with Tailwind CSS.
    *   Implemented Route Groups to cleanly separate public and admin interfaces:
        *   `src/app/(public)/` for the landing page (`page.tsx`) and future public-facing routes.
        *   `src/app/(admin)/` designed for protected moderation dashboards.
*   **TypeScript Definitions:**
    *   Scaffolded core interfaces mapping to the Supabase schema in `src/types/`:
        *   `company.ts`
        *   `industry.ts`
        *   `review.ts`
*   **Environment Configuration:**
    *   Started local Supabase Docker containers.
    *   Configured `.env.local` to point to the local Supabase URLs and API keys for local development.

---

## Phase 2: The Core Engine (Automation Scripts)
**Status:** Completed ✅

**Objective:** Build the autonomous backend engine that scrapes raw company data, uses AI to generate highly humanized reviews, and manages the quality and publishing cadence.

All scripts reside in `scripts/engine/` and communicate with local Supabase via a dedicated `supabaseAdmin.ts` client.

*   **1. The Scraper (`scraper.ts`)**
    *   **Goal:** Fetch and normalize raw company data.
    *   **Implementation:** Takes a company name query and fetches data from simulated APIs (Google Places for ratings/locations, Crunchbase for employee count/funding).
    *   **Output:** Generates a URL-friendly slug and upserts the formatted data into the Supabase `companies` table.
*   **2. The Generator (`generator.ts`)**
    *   **Goal:** The Dual-AI review drafting pipeline to bypass AI detection.
    *   **Implementation (Layer 1 - Gemini Pro):** Generates factual, objective data points (pros, cons, role details) based on the scraped company context.
    *   **Implementation (Layer 2 - Gemini Flash):** Adopts a "casual employee writing anonymously" persona. Rewrites the Layer 1 facts using conversational filler words ("to be honest"), varied sentence lengths, and natural phrasing. Includes robust fallbacks to local mock data if API limits are hit during local development.
    *   **Output:** Inserts the highly humanized review draft into the Supabase `reviews` table with `status = 'pending'`.
*   **3. The Validator (`validator.ts`)**
    *   **Goal:** A rigorous quality gate for AI-generated content.
    *   **Implementation:** Queries Supabase for all `pending` reviews. Runs them through rules: validates required fields (`designation`, `likes`, `dislikes`), enforces a minimum word count, and ensures numerical ratings fall properly within the 1-5 scale.
    *   **Output:** Upgrades passing reviews to `status = 'approved'` and fails others to `status = 'rejected'`.
*   **4. The Publisher (`publisher.ts`)**
    *   **Goal:** Prevent SEO sandboxing via "slow-drip" scheduling.
    *   **Implementation:** Queries Supabase for `approved` reviews where `published_at` is null. Selects a small batch (e.g., 5 at a time).
    *   **Output:** Assigns incrementally staggered `published_at` timestamps to each review in the batch, creating a natural, human-like publishing timeline.

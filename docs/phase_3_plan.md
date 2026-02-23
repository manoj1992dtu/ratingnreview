# Implementation Plan: Phase 3 (The Frontend)

**Objective:** Build the public-facing user interface that surfaces the AI-generated (and eventually user-generated) companies and reviews. 

The focus is on "Premium Aesthetics"—a design that feels strictly modern, leveraging Tailwind CSS and shadcn/ui. 

## Requirements & Scope

### 1. UI/UX Design System (Clean & Crisp Light Theme)
- **Framework:** Next.js App Router (`src/app/(public)`).
- **Core Package Utilities:** `clsx`, `tailwind-merge`, and `lucide-react` (already installed).
- **Color Palette:** Light `#f8fafc` background, Navy `#0a1628` text, Blue `#3b82f6` accents.
- **Typography:** Modern sans-serif (Inter/Geist), minimum 15px body, 1.7 line height for review text to maximize readability.
- **Components:** Clean elevated cards with shadows, subtle borders, blue accent buttons. *No glassmorphism* (replace with clean elevations).
- **Streaming UI:** Must implement `loading.tsx` (skeleton screens using light gray `#e2e8f0` for skeleton blocks) and `error.tsx` in `src/app/(public)` and related nested routes to prevent blank screens during databse queries.

### 2. Core Pages

#### A. The Landing Page (`/`)
- **Location:** `src/app/(public)/page.tsx`
- **Hero Section:** A powerful value proposition ("Real insights, unvarnished truth").
- **Search Bar:** Prominent search bar.
  - **Implementation:** Client-side component that routes to `/companies?q=[query]`. 
  - **Backend:** The search results page will execute a Supabase full-text search (`.textSearch('name', query)`) against the `companies` table.
- **Featured Section:** A horizontal scroll or grid of "Trending Companies" fetching actively published data from Supabase.

#### B. The Company Profile Page (`/companies/[slug]`)
- **Location:** `src/app/(public)/companies/[slug]/page.tsx`
- **Header:** Company Logo, Name, Headquarters, and a visual summary of the `avg_rating` (stars/number).
  - *Data Strategy:* Rely on the `avg_rating` column on the `companies` table. We will create a Supabase Database Trigger to automatically recalculate this column whenever a `review` is inserted/updated with `status = 'approved'`.
- **Ratings Breakdown:** A visual component breaks down the multidimensional ratings (Work-Life Balance, Salary, Culture, etc.).
- **Review Feed:** A strictly **Paginated** list of individual reviews.
  - Pagination is explicitly chosen over infinite scroll to ensure deterministic routing (`?page=2`) for superior Google indexing of individual review content.
  - Show the `designation`, `likes`, `dislikes`, and the natural `published_at` date.

#### C. The Review Submission Flow (Modal/Page)
- **Objective:** Allow real users to submit reviews.
- **Implementation:** A multi-step form utilizing Server Actions to insert into the `reviews` table with `status = 'pending'`.
- **Fields:** Rating (1-5), Core dimensions (Salary, Culture), Designation, Likes, Dislikes, and full Text Content.
- **Security:** Implement a simple hidden "honeypot" field immediately. If the honeypot field is filled out by a bot, the Server Action silently drops the submission to prevent baseline spam. (Cloudflare Turnstile to follow later).

### 3. State Management & Data Fetching
- **Server Components:** Prioritize React Server Components for fetching lists of companies and reviews directly via `@supabase/supabase-js`, yielding exceptional initial load performance and SEO.
- **Client Components:** Use `zustand` strictly for localized client state (e.g., managing the multi-step review submission form).

### 4. Comprehensive SEO Pass
- **Dynamic Metadata:** Explicitly implement `generateMetadata({ params })` in `/companies/[slug]/page.tsx` to dynamically construct the page `<title>`, `<meta name="description">`, and Open Graph tags specific to the company being viewed.
- **JSON-LD Schema Markup:** Implement `lib/schema-markup.ts` and inject specialized JSON-LD snippets into the return block of the company page.
  - Requires `Organization` schema.
  - Requires `AggregateRating` schema (crucial for star ratings in Google search results).
  - Requires individual `Review` schema objects.

## Proposed Implementation Steps

1. **Setup Shared UI:** Initialize Layout, Navbar, Footer, and `loading.tsx`/`error.tsx` states. Build reusable Shadcn components.
2. **Database Trigger:** Create and run a SQL migration for the `avg_rating` compute function.
3. **Build Landing Page:** Implement the Hero, active company feeds, and the foundational routing for the Search mechanism.
4. **Build Company Dynamic Route:** Implement data fetching for `/companies/[slug]`, including Pagination logic for the reviews feed.
5. **SEO & Metadata:** Implement `generateMetadata` and inject JSON-LD schema into the company template.
6. **Build Submission Form:** Create the client-side form logic, honeypot security, and Server Action for database insertion.

## Verification Plan
*   **Visual:** Verify the "Premium" feel against standard UI heuristics. Ensure Skeleton loaders appear during simulated network latency.
*   **Data Integrity:** Verify the Database Trigger accurately updates `companies.avg_rating` when a new review is added manually via Supabase Studio.
*   **SEO:** Inspect the DOM of a rendered company page to confirm the presence of valid JSON-LD tags (`AggregateRating`) and specific `<title>` tags.
*   **Security:** Attempt to submit the form with a filled honeypot field via an automated script and ensure it is rejected.

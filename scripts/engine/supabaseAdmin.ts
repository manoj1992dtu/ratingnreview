import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the root `.env` or `.env.local`
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ CRITICAL ERROR: Database credentials (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY) are missing from environment variables.");
    process.exit(1);
}

// Instantiate the Supabase client using the Service Role Key.
// WARNING: This bypasses all Row Level Security (RLS) policies.
// Use this ONLY for backend automation scripts, NEVER in frontend code.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

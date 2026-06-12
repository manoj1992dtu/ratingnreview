// app/api/cron/update-industry-stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get Supabase client safely with service role key if available
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Key is missing');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  
  // 1. VERIFY AUTHORIZATION
  const authHeader = request.headers.get('authorization');

  // Vercel Cron sends this header
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON] Starting industry stats update...');
  const startTime = Date.now();

  try {
    // 2. FETCH ALL ACTIVE INDUSTRIES (both primary and secondary)
    const { data: industries, error: fetchError } = await supabase
      .from('industries')
      .select('id, name')
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    console.log(`[CRON] Processing ${industries?.length} industries`);

    // 3. CALCULATE AND UPDATE STATS FOR EACH INDUSTRY
    let updated = 0;
    let failed = 0;

    for (const industry of industries || []) {
      try {
        // Fetch all active company associations for this industry
        const { data: associations, error: assocError } = await supabase
          .from('company_industries')
          .select(`
            company_id,
            companies!inner(
              id,
              status
            )
          `)
          .eq('industry_id', industry.id)
          .eq('is_active', true);

        if (assocError) throw assocError;

        // Filter for published companies
        const companyIds = (associations || [])
          .filter((assoc: any) => assoc.companies?.status === 'published')
          .map((assoc: any) => assoc.company_id);

        const companyCount = companyIds.length;

        let reviewCount = 0;
        let avgRating = 0;

        if (companyCount > 0) {
          // Get all published and active reviews for these companies
          const { data: reviews, error: reviewError } = await supabase
            .from('company_reviews')
            .select('overall_rating')
            .in('company_id', companyIds)
            .eq('status', 'published')
            .eq('is_active', true);

          if (reviewError) {
            console.error(`[CRON] Error fetching reviews for ${industry.name}:`, reviewError);
          } else if (reviews && reviews.length > 0) {
            reviewCount = reviews.length;
            const sum = reviews.reduce((acc, r) => acc + r.overall_rating, 0);
            avgRating = Number((sum / reviews.length).toFixed(2));
          }
        }

        // Update the industry with the new stats
        const { error: updateError } = await supabase
          .from('industries')
          .update({
            company_count: companyCount,
            review_count: reviewCount,
            avg_rating: avgRating,
            stats_updated_at: new Date().toISOString()
          })
          .eq('id', industry.id);

        if (updateError) throw updateError;

        updated++;
        console.log(`[CRON] Updated ${industry.name}: Companies=${companyCount}, Reviews=${reviewCount}, Rating=${avgRating}`);

      } catch (error) {
        console.error(`[CRON] Failed to update ${industry.name}:`, error);
        failed++;
      }
    }

    const duration = Date.now() - startTime;
    const result = {
      success: true,
      updated,
      failed,
      total: industries?.length || 0,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    };

    console.log('[CRON] Complete:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[CRON] Fatal error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
// app/api/cron/update-industry-stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for cron jobs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define types for the nested query response
type ReviewData = {
  companies: {
    reviews: Array<{ rating: number }>;
  } | null;
}[];

export async function POST(request: NextRequest) {
  // 1. VERIFY AUTHORIZATION
  const authHeader = request.headers.get('authorization');
  
  // Vercel Cron sends this header
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON] Starting industry stats update...');
  const startTime = Date.now();

  try {
    // 2. FETCH ALL INDUSTRIES
    const { data: industries, error: fetchError } = await supabase
      .from('industries')
      .select('id, name')
      .eq('is_primary', true);

    if (fetchError) throw fetchError;

    console.log(`[CRON] Processing ${industries?.length} industries`);

    // 3. CALCULATE COMPLEX STATS (avg_rating)
    let updated = 0;
    let failed = 0;

    for (const industry of industries || []) {
      try {
        // Calculate average rating (complex query)
        const { data: reviewData } = await supabase
          .from('company_industries')
          .select(`
            companies:company_id (
              reviews:reviews (rating)
            )
          `)
          .eq('industry_id', industry.id)
          .eq('is_active', true);

        // Type assertion and safe data extraction
        const typedData = (reviewData as unknown as ReviewData) || [];
        
        const allReviews = typedData
          .filter(d => d.companies !== null)
          .flatMap(d => d.companies!.reviews || [])
          .map(r => r.rating);

        const avgRating = allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r, 0) / allReviews.length
          : 0;

        // Update the industry
        const { error: updateError } = await supabase
          .from('industries')
          .update({
            avg_rating: Number(avgRating.toFixed(2)),
            stats_updated_at: new Date().toISOString()
          })
          .eq('id', industry.id)
          .eq('is_active', true);

        if (updateError) throw updateError;

        updated++;
        console.log(`[CRON] Updated ${industry.name}: ${avgRating.toFixed(2)}`);

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
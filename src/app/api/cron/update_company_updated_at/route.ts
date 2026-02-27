
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Types
interface Company {
  id: string;
  slug: string;
  updated_at: string;
}

interface UpdateResponse {
  success: boolean;
  updated?: boolean;
  company?: {
    id: string;
    slug: string;
    previousTimestamp: string;
    newTimestamp: string;
  };
  message?: string;
  timestamp?: string;
  error?: string;
}

// Helper to get Supabase client safely
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Key is missing');
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest): Promise<NextResponse<UpdateResponse>> {
  try {
    const supabase = getSupabase();
    // Security: Verify authorization
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[UpdateTimestamp] CRON_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    const isAuthorized = authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 [UpdateTimestamp] Starting timestamp update...');
    const now = new Date().toISOString();

    // Fetch one company with future timestamp
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('id, slug, updated_at')
      .eq('is_active', false)
      .order('updated_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('✅ [UpdateTimestamp] No companies with future timestamps found');
        return NextResponse.json({
          success: true,
          updated: false,
          message: 'No companies with future timestamps found',
          timestamp: now
        });
      }
      throw fetchError;
    }

    if (!company) {
      console.log('✅ [UpdateTimestamp] No companies with future timestamps found');
      return NextResponse.json({
        success: true,
        updated: false,
        message: 'No companies with future timestamps found',
        timestamp: now
      });
    }

    console.log(`📝 [UpdateTimestamp] Found company: ${company.slug} (was: ${company.updated_at})`);

    // 1. Update the company's timestamp and is_active
    const { error: updateCompanyError } = await supabase
      .from('companies')
      .update({ updated_at: now, is_active: true })
      .eq('id', company.id);

    if (updateCompanyError) {
      console.error('❌ [UpdateTimestamp] Company update error:', updateCompanyError);
      throw updateCompanyError;
    }

    // 2. Activate related company_industries
    const { error: updateIndustriesError } = await supabase
      .from('company_industries')
      .update({ is_active: true })
      .eq('company_id', company.id);

    if (updateIndustriesError) {
      console.error('❌ [UpdateTimestamp] Industries update error:', updateIndustriesError);
      throw updateIndustriesError;
    }

    console.log(`✅ [UpdateTimestamp] Activated industries for ${company.slug}`);

    return NextResponse.json({
      success: true,
      updated: true,
      company: {
        id: company.id,
        slug: company.slug,
        previousTimestamp: company.updated_at,
        newTimestamp: now
      },
      timestamp: now
    });

  } catch (error) {
    console.error('❌ [UpdateTimestamp] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



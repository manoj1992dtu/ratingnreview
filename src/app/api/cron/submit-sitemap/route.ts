// ============================================
// FILE: app/api/cron/submit-sitemap/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';

interface SubmissionResult {
  service: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}

interface ApiResponse {
  success: boolean;
  timestamp: string;
  results: SubmissionResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  error?: string;
}

// Helper function to make HTTP requests
async function makeRequest(url: string, method: string = 'GET', body?: string): Promise<{ statusCode: number; body: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapSubmitter/1.0)',
        'Content-Type': 'application/json',
      },
      body: body ? body : undefined,
    });

    const responseBody = await response.text();

    return {
      statusCode: response.status,
      body: responseBody,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}

// Submit to Google via Indexing API (requires service account)
async function submitToGoogle(sitemapUrl: string): Promise<SubmissionResult> {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.log('[SubmitSitemap] ⏭️ Skipping Google (no service account configured)');
    return {
      service: 'Google',
      success: false,
      error: 'Google Service Account not configured. Submit manually via Search Console.',
    };
  }

  try {
    console.log('[SubmitSitemap] Submitting to Google Indexing API...');

    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountJson);

    // Get OAuth token
    const jwtToken = await getGoogleAccessToken(credentials);

    // Submit URL for indexing
    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        url: sitemapUrl,
        type: 'URL_UPDATED',
      }),
    });

    if (response.ok) {
      console.log('[SubmitSitemap] ✅ Google: Success');
      return {
        service: 'Google',
        success: true,
        statusCode: response.status,
      };
    } else {
      const errorText = await response.text();
      console.log(`[SubmitSitemap] ⚠️ Google: Failed with status ${response.status}`, errorText);
      return {
        service: 'Google',
        success: false,
        statusCode: response.status,
        error: errorText,
      };
    }
  } catch (error) {
    console.error('[SubmitSitemap] ❌ Google error:', error);
    return {
      service: 'Google',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get Google OAuth access token
async function getGoogleAccessToken(credentials: any): Promise<string> {
  const jwt = require('jsonwebtoken');

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const token = jwt.sign(claim, credentials.private_key, { algorithm: 'RS256' });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
  });

  const data = await response.json();
  return data.access_token;
}

// Submit to Bing via Webmaster API
async function submitToBing(sitemapUrl: string): Promise<SubmissionResult> {
  const bingApiKey = process.env.BING_WEBMASTER_API_KEY;

  if (!bingApiKey) {
    console.log('[SubmitSitemap] ⏭️ Skipping Bing API (no API key configured)');
    return {
      service: 'Bing',
      success: false,
      error: 'Bing API key not configured. Using IndexNow instead.',
    };
  }

  try {
    console.log('[SubmitSitemap] Submitting to Bing Webmaster API...');

    // Extract domain from sitemap URL
    const siteUrl = new URL(sitemapUrl).origin;

    const response = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${bingApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteUrl: siteUrl,
        urlList: [sitemapUrl],
      }),
    });

    if (response.ok) {
      console.log('[SubmitSitemap] ✅ Bing: Success');
      return {
        service: 'Bing',
        success: true,
        statusCode: response.status,
      };
    } else {
      console.log(`[SubmitSitemap] ⚠️ Bing: Failed with status ${response.status}`);
      return {
        service: 'Bing',
        success: false,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error('[SubmitSitemap] ❌ Bing error:', error);
    return {
      service: 'Bing',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Submit to IndexNow (Bing, Yandex, and more)
async function submitToIndexNow(sitemapUrl: string, apiKey: string): Promise<SubmissionResult> {
  if (!apiKey) {
    console.log('[SubmitSitemap] ⏭️ Skipping IndexNow (no API key)');
    return {
      service: 'IndexNow',
      success: false,
      error: 'No API key provided',
    };
  }

  try {
    console.log('[SubmitSitemap] Submitting to IndexNow...');

    // Extract host from sitemap URL
    const urlObj = new URL(sitemapUrl);
    const host = urlObj.hostname;

    // IndexNow expects POST with JSON body
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: host,
        key: apiKey,
        keyLocation: `https://${host}/${apiKey}.txt`,
        urlList: [sitemapUrl],
      }),
    });

    if (response.status === 200 || response.status === 202) {
      console.log('[SubmitSitemap] ✅ IndexNow: Success');
      return {
        service: 'IndexNow',
        success: true,
        statusCode: response.status,
      };
    } else {
      const errorText = await response.text();
      console.log(`[SubmitSitemap] ⚠️ IndexNow: Failed with status ${response.status}`, errorText);
      return {
        service: 'IndexNow',
        success: false,
        statusCode: response.status,
        error: errorText,
      };
    }
  } catch (error) {
    console.error('[SubmitSitemap] ❌ IndexNow error:', error);
    return {
      service: 'IndexNow',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Validate sitemap
async function validateSitemap(sitemapUrl: string): Promise<{ valid: boolean; urlCount?: number; sizeMB?: number; error?: string }> {
  try {
    console.log('[SubmitSitemap] 🔍 Validating sitemap...');

    const response = await makeRequest(sitemapUrl, 'GET');

    if (response.statusCode !== 200) {
      return {
        valid: false,
        error: `Sitemap not accessible (HTTP ${response.statusCode})`,
      };
    }

    const body = response.body;

    // Check if it's valid XML
    if (!body.includes('<?xml') || !body.includes('<urlset')) {
      return {
        valid: false,
        error: 'Sitemap is not valid XML',
      };
    }

    // Count URLs
    const urlCount = (body.match(/<loc>/g) || []).length;
    console.log(`[SubmitSitemap] 📊 Found ${urlCount} URLs in sitemap`);

    if (urlCount === 0) {
      return {
        valid: false,
        error: 'Sitemap contains no URLs',
      };
    }

    // Check size (max 50MB)
    const sizeInMB = Buffer.byteLength(body, 'utf8') / (1024 * 1024);
    console.log(`[SubmitSitemap] 📦 Sitemap size: ${sizeInMB.toFixed(2)} MB`);

    if (sizeInMB > 50) {
      return {
        valid: false,
        error: 'Sitemap exceeds 50MB limit',
      };
    }

    console.log('[SubmitSitemap] ✅ Sitemap validation passed');
    return {
      valid: true,
      urlCount,
      sizeMB: parseFloat(sizeInMB.toFixed(2)),
    };
  } catch (error) {
    console.error('[SubmitSitemap] ❌ Validation error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send notification (optional)
async function sendNotification(success: boolean, failures: string[]): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  try {
    const message = success
      ? '✅ Sitemap submitted successfully to all search engines'
      : `⚠️ Sitemap submission failed: ${failures.join(', ')}`;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        username: 'Sitemap Bot',
      }),
    });

    console.log('[SubmitSitemap] 📢 Notification sent');
  } catch (error) {
    console.log('[SubmitSitemap] ⚠️ Failed to send notification:', error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const startTime = Date.now();

  try {
    // Security: Verify authorization
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[SubmitSitemap] CRON_SECRET not configured');
      return NextResponse.json(
        {
          success: false,
          timestamp: new Date().toISOString(),
          results: [],
          summary: { total: 0, successful: 0, failed: 0 },
          error: 'Server misconfiguration',
        },
        { status: 500 }
      );
    }

    const isAuthorized = authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          timestamp: new Date().toISOString(),
          results: [],
          summary: { total: 0, successful: 0, failed: 0 },
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const sitemapUrl = process.env.SITEMAP_URL || 'https://ratingnreviews.com/sitemap.xml';
    const indexNowKey = process.env.INDEXNOW_KEY || '';

    console.log('[SubmitSitemap] 🗺️ Starting sitemap submission...');
    console.log(`[SubmitSitemap] 📅 Time: ${new Date().toISOString()}`);
    console.log(`[SubmitSitemap] 🌐 Sitemap: ${sitemapUrl}`);

    // Validate sitemap first
    const validation = await validateSitemap(sitemapUrl);

    if (!validation.valid) {
      console.log('[SubmitSitemap] ❌ Sitemap validation failed:', validation.error);
      return NextResponse.json(
        {
          success: false,
          timestamp: new Date().toISOString(),
          results: [],
          summary: { total: 0, successful: 0, failed: 0 },
          error: `Sitemap validation failed: ${validation.error}`,
        },
        { status: 400 }
      );
    }

    // Submit to all search engines
    const results = await Promise.all([
      submitToIndexNow(sitemapUrl, indexNowKey),
      submitToBing(sitemapUrl),
      submitToGoogle(sitemapUrl),
    ]);

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    const totalCount = results.length;

    // Send notification
    const failures = results.filter(r => !r.success).map(r => r.service);
    await sendNotification(failures.length === 0, failures);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[SubmitSitemap] ⏱️ Duration: ${duration}s`);
    console.log(`[SubmitSitemap] ✅ Success: ${successCount}/${totalCount}`);

    return NextResponse.json({
      success: successCount > 0,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error('[SubmitSitemap] ❌ Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        results: [],
        summary: { total: 0, successful: 0, failed: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: GET method for health check
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'healthy',
    endpoint: 'submit-sitemap',
    timestamp: new Date().toISOString(),
  });
}
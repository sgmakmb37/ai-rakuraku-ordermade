import { NextRequest, NextResponse } from 'next/server';
import type { WebVitalMetric } from '@/lib/web-vitals';

/**
 * Web Vitals metrics collection endpoint
 *
 * Receives Core Web Vitals data from client-side and stores/forwards to analytics
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Basic validation
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Log metric (in production, send to analytics service)
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      navigationType: metric.navigationType,
      timestamp: new Date(metric.timestamp).toISOString(),
    });

    // TODO: Send to analytics service
    // - Google Analytics 4
    // - Supabase Analytics
    // - Custom dashboard

    // Example: Send to Supabase
    // const { createClient } = await import('@/lib/supabase/server');
    // const supabase = createClient();
    // await supabase.from('web_vitals').insert({
    //   name: metric.name,
    //   value: metric.value,
    //   rating: metric.rating,
    //   url: metric.url,
    //   user_agent: metric.userAgent,
    //   navigation_type: metric.navigationType,
    //   timestamp: new Date(metric.timestamp).toISOString(),
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process web vital:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
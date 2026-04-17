/**
 * Core Web Vitals monitoring for real user metrics (RUM)
 *
 * Tracks LCP, FID, CLS, FCP, and TTFB for performance analysis
 */

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender';
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface WebVitalThresholds {
  good: number;
  needsImprovement: number;
}

// Core Web Vitals thresholds (ms for timing metrics, score for CLS)
export const WEB_VITAL_THRESHOLDS: Record<WebVitalMetric['name'], WebVitalThresholds> = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

/**
 * Get rating based on value and thresholds
 */
function getRating(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
  const thresholds = WEB_VITAL_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Get navigation type for context
 */
function getNavigationType(): WebVitalMetric['navigationType'] {
  if (typeof window === 'undefined' || !window.performance) {
    return 'navigate';
  }

  const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return 'navigate';

  return navigation.type as WebVitalMetric['navigationType'];
}

/**
 * Send metric to analytics endpoint
 */
async function sendMetric(metric: WebVitalMetric) {
  try {
    // プロダクション環境でのみ送信
    if (process.env.NODE_ENV !== 'production') {
      console.log('Web Vital:', metric);
      return;
    }

    // Analytics endpoint (将来的にSupabaseやGoogle Analytics 4に送信)
    const response = await fetch('/api/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
      keepalive: true, // ページ離脱時も送信を継続
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    // 静かに失敗（分析データ収集は重要だが、UXを妨げてはいけない）
    console.warn('Failed to send web vital metric:', error);
  }
}

/**
 * Create and send web vital metric
 */
function createMetric(
  name: WebVitalMetric['name'],
  value: number,
  id: string,
  delta?: number
): WebVitalMetric {
  const metric: WebVitalMetric = {
    name,
    value: Math.round(value),
    rating: getRating(name, value),
    delta: Math.round(delta || value),
    id,
    navigationType: getNavigationType(),
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  sendMetric(metric);
  return metric;
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(onMetric?: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined') return;

  // Dynamically import web-vitals library
  import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB }) => {
    // Cumulative Layout Shift
    onCLS((metric) => {
      const webVital = createMetric('CLS', metric.value, metric.id, metric.delta);
      onMetric?.(webVital);
    });

    // First Contentful Paint
    onFCP((metric) => {
      const webVital = createMetric('FCP', metric.value, metric.id, metric.delta);
      onMetric?.(webVital);
    });

    // First Input Delay
    onFID((metric) => {
      const webVital = createMetric('FID', metric.value, metric.id, metric.delta);
      onMetric?.(webVital);
    });

    // Largest Contentful Paint
    onLCP((metric) => {
      const webVital = createMetric('LCP', metric.value, metric.id, metric.delta);
      onMetric?.(webVital);
    });

    // Time to First Byte
    onTTFB((metric) => {
      const webVital = createMetric('TTFB', metric.value, metric.id, metric.delta);
      onMetric?.(webVital);
    });
  }).catch((error) => {
    console.warn('Failed to load web-vitals library:', error);
  });
}
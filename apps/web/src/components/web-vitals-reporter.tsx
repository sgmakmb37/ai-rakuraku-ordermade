'use client';

import { useEffect } from 'react';
import { initWebVitals, type WebVitalMetric } from '@/lib/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;

    initWebVitals((metric: WebVitalMetric) => {
      // Optional: Add custom handling for each metric
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vital] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          url: metric.url,
        });
      }

      // Optional: Send to additional analytics services
      // if (window.gtag) {
      //   window.gtag('event', metric.name, {
      //     custom_map: { metric_id: 'dimension1' },
      //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      //     metric_id: metric.id,
      //   });
      // }
    });
  }, []);

  // This component doesn't render anything visible
  return null;
}
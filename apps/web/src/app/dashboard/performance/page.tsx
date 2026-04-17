'use client';

import { useState, useEffect } from 'react';
import { WEB_VITAL_THRESHOLDS, type WebVitalMetric } from '@/lib/web-vitals';

interface PerformanceStats {
  lcp: { value: number; rating: string; samples: number };
  fid: { value: number; rating: string; samples: number };
  cls: { value: number; rating: string; samples: number };
  fcp: { value: number; rating: string; samples: number };
  ttfb: { value: number; rating: string; samples: number };
}

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    // In production, fetch from analytics API
    setTimeout(() => {
      setStats({
        lcp: { value: 2100, rating: 'good', samples: 156 },
        fid: { value: 85, rating: 'good', samples: 134 },
        cls: { value: 0.08, rating: 'good', samples: 178 },
        fcp: { value: 1650, rating: 'good', samples: 156 },
        ttfb: { value: 720, rating: 'good', samples: 156 },
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getThresholds = (name: string) => {
    const key = name.toUpperCase() as keyof typeof WEB_VITAL_THRESHOLDS;
    return WEB_VITAL_THRESHOLDS[key];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-500">パフォーマンス データを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            パフォーマンス監視
          </h1>
          <p className="text-gray-600 mt-1">
            Core Web Vitals とページパフォーマンス指標
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Core Web Vitals */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Core Web Vitals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Largest Contentful Paint */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">LCP</h3>
                  <p className="text-sm text-gray-500">Largest Contentful Paint</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(stats?.lcp.rating || '')}`}>
                  {stats?.lcp.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats ? formatValue('LCP', stats.lcp.value) : '---'}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {stats?.lcp.samples || 0} サンプル
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <div>良好: ≤ {getThresholds('LCP').good}ms</div>
                <div>要改善: ≤ {getThresholds('LCP').needsImprovement}ms</div>
              </div>
            </div>

            {/* First Input Delay */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">FID</h3>
                  <p className="text-sm text-gray-500">First Input Delay</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(stats?.fid.rating || '')}`}>
                  {stats?.fid.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats ? formatValue('FID', stats.fid.value) : '---'}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {stats?.fid.samples || 0} サンプル
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <div>良好: ≤ {getThresholds('FID').good}ms</div>
                <div>要改善: ≤ {getThresholds('FID').needsImprovement}ms</div>
              </div>
            </div>

            {/* Cumulative Layout Shift */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">CLS</h3>
                  <p className="text-sm text-gray-500">Cumulative Layout Shift</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(stats?.cls.rating || '')}`}>
                  {stats?.cls.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats ? formatValue('CLS', stats.cls.value) : '---'}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {stats?.cls.samples || 0} サンプル
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <div>良好: ≤ {getThresholds('CLS').good}</div>
                <div>要改善: ≤ {getThresholds('CLS').needsImprovement}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Metrics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            その他の指標
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Contentful Paint */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">FCP</h3>
                  <p className="text-sm text-gray-500">First Contentful Paint</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(stats?.fcp.rating || '')}`}>
                  {stats?.fcp.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats ? formatValue('FCP', stats.fcp.value) : '---'}
              </div>
              <div className="text-sm text-gray-500">
                {stats?.fcp.samples || 0} サンプル
              </div>
            </div>

            {/* Time to First Byte */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">TTFB</h3>
                  <p className="text-sm text-gray-500">Time to First Byte</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(stats?.ttfb.rating || '')}`}>
                  {stats?.ttfb.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats ? formatValue('TTFB', stats.ttfb.value) : '---'}
              </div>
              <div className="text-sm text-gray-500">
                {stats?.ttfb.samples || 0} サンプル
              </div>
            </div>
          </div>
        </section>

        {/* Performance Tips */}
        <section className="mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              パフォーマンス最適化のヒント
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• LCP: 画像最適化、フォント読み込み最適化、サーバーレスポンス時間改善</li>
              <li>• FID: JavaScriptコード分割、非同期処理、Web Workers利用</li>
              <li>• CLS: 画像・動画サイズ指定、フォント表示最適化、動的コンテンツの事前確保</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
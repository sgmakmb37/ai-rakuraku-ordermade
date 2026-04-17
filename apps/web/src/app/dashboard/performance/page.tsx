'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WEB_VITAL_THRESHOLDS } from '@/lib/web-vitals';

interface PerformanceStats {
  lcp: { value: number; rating: string; samples: number };
  fid: { value: number; rating: string; samples: number };
  cls: { value: number; rating: string; samples: number };
  fcp: { value: number; rating: string; samples: number };
  ttfb: { value: number; rating: string; samples: number };
}

export default function PerformancePage() {
  const router = useRouter();
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
      case 'good': return 'bg-emerald-500/10 text-emerald-400';
      case 'needs-improvement': return 'bg-amber-500/10 text-amber-400';
      case 'poor': return 'bg-red-500/10 text-red-400';
      default: return 'bg-white/[0.06] text-zinc-400';
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">パフォーマンス データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="logo-text text-lg font-bold cursor-pointer sm:text-xl">AI Rakuraku</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors"
            >
              ← ダッシュボード
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">パフォーマンス監視</h1>
          <p className="text-sm text-zinc-400 mt-1">Core Web Vitals とページパフォーマンス指標</p>
        </div>

        {/* Core Web Vitals */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Core Web Vitals</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Largest Contentful Paint */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">LCP</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Largest Contentful Paint</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingColor(stats?.lcp.rating || '')}`}>
                  {stats?.lcp.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats ? formatValue('LCP', stats.lcp.value) : '---'}
              </div>
              <div className="text-xs text-zinc-500 mb-4">
                {stats?.lcp.samples || 0} サンプル
              </div>
              <div className="space-y-1 text-xs text-zinc-500">
                <div>良好: ≤ {getThresholds('LCP').good}ms</div>
                <div>要改善: ≤ {getThresholds('LCP').needsImprovement}ms</div>
              </div>
            </div>

            {/* First Input Delay */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">FID</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">First Input Delay</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingColor(stats?.fid.rating || '')}`}>
                  {stats?.fid.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats ? formatValue('FID', stats.fid.value) : '---'}
              </div>
              <div className="text-xs text-zinc-500 mb-4">
                {stats?.fid.samples || 0} サンプル
              </div>
              <div className="space-y-1 text-xs text-zinc-500">
                <div>良好: ≤ {getThresholds('FID').good}ms</div>
                <div>要改善: ≤ {getThresholds('FID').needsImprovement}ms</div>
              </div>
            </div>

            {/* Cumulative Layout Shift */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">CLS</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Cumulative Layout Shift</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingColor(stats?.cls.rating || '')}`}>
                  {stats?.cls.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats ? formatValue('CLS', stats.cls.value) : '---'}
              </div>
              <div className="text-xs text-zinc-500 mb-4">
                {stats?.cls.samples || 0} サンプル
              </div>
              <div className="space-y-1 text-xs text-zinc-500">
                <div>良好: ≤ {getThresholds('CLS').good}</div>
                <div>要改善: ≤ {getThresholds('CLS').needsImprovement}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">その他の指標</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Contentful Paint */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">FCP</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">First Contentful Paint</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingColor(stats?.fcp.rating || '')}`}>
                  {stats?.fcp.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats ? formatValue('FCP', stats.fcp.value) : '---'}
              </div>
              <div className="text-xs text-zinc-500">
                {stats?.fcp.samples || 0} サンプル
              </div>
            </div>

            {/* Time to First Byte */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">TTFB</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Time to First Byte</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingColor(stats?.ttfb.rating || '')}`}>
                  {stats?.ttfb.rating || 'unknown'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats ? formatValue('TTFB', stats.ttfb.value) : '---'}
              </div>
              <div className="text-xs text-zinc-500">
                {stats?.ttfb.samples || 0} サンプル
              </div>
            </div>
          </div>
        </section>

        {/* Performance Tips */}
        <section>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-6">
            <h3 className="text-base font-bold text-white mb-3">
              パフォーマンス最適化のヒント
            </h3>
            <ul className="text-sm text-zinc-400 space-y-2">
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

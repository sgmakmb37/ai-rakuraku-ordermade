'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WEB_VITAL_THRESHOLDS } from '@/lib/web-vitals';
import { useLocale } from "@/lib/i18n";
import { Globe } from "lucide-react";

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
  const { t, locale, setLocale } = useLocale();

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
          <p className="text-sm text-zinc-400">{t("performance.loading")}</p>
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
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 cursor-pointer transition-colors duration-200 hover:border-white/[0.15] hover:text-white"
            >
              <Globe size={13} />
              {locale === "ja" ? "EN" : "JP"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors"
            >
              {"← " + t("detail.backToDashboard")}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{t("performance.title")}</h1>
          <p className="text-sm text-zinc-400 mt-1">{t("performance.subtitle")}</p>
        </div>

        {/* Core Web Vitals */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">{t("performance.coreWebVitals")}</h2>

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
                {t("performance.samples", { n: stats?.lcp.samples || 0 })}
              </div>
              <div className="space-y-1 text-xs text-zinc-500">
                <div>{locale === "ja" ? "良好" : "Good"}: ≤ {getThresholds('LCP').good}ms</div>
                <div>{locale === "ja" ? "要改善" : "Needs improvement"}: ≤ {getThresholds('LCP').needsImprovement}ms</div>
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
                {t("performance.samples", { n: stats?.fid.samples || 0 })}
              </div>
              <div className="space-y-1 text-xs text-zinc-500">
                <div>{locale === "ja" ? "良好" : "Good"}: ≤ {getThresholds('FID').good}ms</div>
                <div>{locale === "ja" ? "要改善" : "Needs improvement"}: ≤ {getThresholds('FID').needsImprovement}ms</div>
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
                {t("performance.samples", { n: stats?.cls.samples || 0 })}
              </div>
              <div className="space-y-1 text-xs text-zinc-500">
                <div>{locale === "ja" ? "良好" : "Good"}: ≤ {getThresholds('CLS').good}</div>
                <div>{locale === "ja" ? "要改善" : "Needs improvement"}: ≤ {getThresholds('CLS').needsImprovement}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">{t("performance.otherMetrics")}</h2>

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
                {t("performance.samples", { n: stats?.fcp.samples || 0 })}
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
                {t("performance.samples", { n: stats?.ttfb.samples || 0 })}
              </div>
            </div>
          </div>
        </section>

        {/* Performance Tips */}
        <section>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-6">
            <h3 className="text-base font-bold text-white mb-3">
              {t("performance.tipsTitle")}
            </h3>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>{"• " + t("performance.tipsLcp")}</li>
              <li>{"• " + t("performance.tipsFid")}</li>
              <li>{"• " + t("performance.tipsCls")}</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

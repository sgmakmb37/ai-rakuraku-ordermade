import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 max-w-md w-full text-center">
        <p className="text-sm font-medium text-zinc-500 mb-2">404</p>
        <h1 className="text-xl font-bold text-white mb-2">ページが見つかりません</h1>
        <p className="text-sm text-zinc-400 mb-6">お探しのページは存在しないか、移動した可能性があります。</p>
        <Link
          href="/dashboard"
          className="inline-block w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110 text-center"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-400">
            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M10 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">エラーが発生しました</h1>
        <p className="text-sm text-zinc-400 mb-6">{error.message || "予期しないエラーが発生しました。"}</p>
        <button
          onClick={reset}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
        >
          再試行
        </button>
      </div>
    </div>
  );
}

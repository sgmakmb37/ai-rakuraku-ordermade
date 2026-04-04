"use client";

import { useRouter } from "next/navigation";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          認証エラー
        </h1>
        <p className="text-gray-600 mb-6">
          ログインリンクが無効または期限切れです。もう一度お試しください。
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          ログイン画面に戻る
        </button>
      </div>
    </div>
  );
}

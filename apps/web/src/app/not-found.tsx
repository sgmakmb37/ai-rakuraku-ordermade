import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ページが見つかりません</h1>
        <p className="text-gray-600 mb-6">お探しのページは存在しないか、移動した可能性があります。</p>
        <Link
          href="/dashboard"
          className="inline-block w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors text-center"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}

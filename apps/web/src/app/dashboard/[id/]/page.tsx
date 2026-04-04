"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

interface ProjectDetail {
  id: string;
  name: string;
  modelName: string;
  genre: string;
  purpose: string;
  status: "learning" | "completed" | "failed";
  createdAt: Date;
  daysUntilDeletion: number;
}

interface HistoryEntry {
  version: string;
  timestamp: Date;
  status: "success" | "in_progress" | "failed";
}

// Mock data
const MOCK_PROJECT: ProjectDetail = {
  id: "1",
  name: "商品画像分類モデル",
  modelName: "Qwen2.5 3B（標準）",
  genre: "プログラミング補助",
  purpose: "ECサイトの商品分類用AIモデル",
  status: "learning",
  createdAt: new Date("2026-04-01"),
  daysUntilDeletion: 29,
};

const MOCK_HISTORY: HistoryEntry[] = [
  {
    version: "v1.0",
    timestamp: new Date("2026-04-01T10:00:00"),
    status: "in_progress",
  },
  {
    version: "v0.2",
    timestamp: new Date("2026-03-25T14:30:00"),
    status: "success",
  },
  {
    version: "v0.1",
    timestamp: new Date("2026-03-20T09:15:00"),
    status: "failed",
  },
];

const getStatusBadgeColor = (
  status: "learning" | "completed" | "failed"
) => {
  switch (status) {
    case "learning":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
  }
};

const getStatusLabel = (status: "learning" | "completed" | "failed") => {
  switch (status) {
    case "learning":
      return "学習中";
    case "completed":
      return "完了";
    case "failed":
      return "失敗";
  }
};

const getHistoryStatusColor = (
  status: "success" | "in_progress" | "failed"
) => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "failed":
      return "bg-red-100 text-red-800";
  }
};

const getHistoryStatusLabel = (
  status: "success" | "in_progress" | "failed"
) => {
  switch (status) {
    case "success":
      return "成功";
    case "in_progress":
      return "進行中";
    case "failed":
      return "失敗";
  }
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  // Mock: 本来はURLパラメータからプロジェクト詳細を取得
  const project = MOCK_PROJECT;
  const history = MOCK_HISTORY;

  const handleAddLearning = () => {
    alert("追加学習は未実装です");
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "現在の学習内容をリセットする。元に戻せないが実行するか？"
    );
    if (confirmed) {
      alert("リセット処理は未実装です");
    }
  };

  const handleDownload = () => {
    alert("ダウンロードは未実装です");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mr-4"
          >
            ← ダッシュボードに戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {project.name}
              </h2>
              <p className="text-gray-600">{project.modelName}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${getStatusBadgeColor(
                project.status
              )}`}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600">ジャンル</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.genre}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">作成日</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.createdAt.toLocaleDateString("ja-JP")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">残り日数</p>
              <p className="text-lg font-semibold text-gray-900">
                あと{project.daysUntilDeletion}日
              </p>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <p className="text-sm text-gray-600 mb-2">用途説明</p>
            <p className="text-gray-900">{project.purpose}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleAddLearning}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            追加学習
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            リセット
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            ダウンロード
          </button>
        </div>

        {/* Learning History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">学習履歴</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    バージョン
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    日時
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-900 font-medium">
                      {entry.version}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {entry.timestamp.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getHistoryStatusColor(
                          entry.status
                        )}`}
                      >
                        {getHistoryStatusLabel(entry.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

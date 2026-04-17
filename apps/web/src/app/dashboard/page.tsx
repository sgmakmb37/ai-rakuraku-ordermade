"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getStatusBadgeColor, getStatusLabel, type ProjectStatus } from "@/lib/status-utils";

interface Project {
  id: string;
  name: string;
  model_type: string;
  status: ProjectStatus;
  created_at: string;
  days_until_deletion: number;
}

interface ApiProject {
  id: string;
  name: string;
  model_type: string;
  status: string;
  created_at: string;
  days_until_deletion: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.listProjects();
        const transformedProjects = (data as ApiProject[]).map((p) => ({
          id: p.id,
          name: p.name,
          model_type: p.model_type,
          status: p.status as ProjectStatus,
          created_at: p.created_at,
          days_until_deletion: p.days_until_deletion,
        }));
        setProjects(transformedProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "プロジェクトの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleNewProject = () => {
    if (projects.length >= 5) {
      return;
    }
    router.push("/dashboard/new");
  };

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  const canCreateNewProject = projects.length < 5;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            AIらくらくオーダーメイド
          </h1>
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLogoutLoading ? "ログアウト中..." : "ログアウト"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section with New Project Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            プロジェクト一覧
          </h2>
          <button
            onClick={handleNewProject}
            disabled={!canCreateNewProject}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              canCreateNewProject
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canCreateNewProject ? "新規作成" : "上限に達しています"}
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              リトライ
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">まだプロジェクトがありません</p>
            <button
              onClick={handleNewProject}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              最初のプロジェクトを作成
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleCardClick(project.id)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-100"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600">{project.model_type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusBadgeColor(
                      project.status
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                {/* Meta Information */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span className="text-gray-600">残り日数：</span>
                    <span className="font-medium">
                      あと{project.days_until_deletion}日で削除
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="text-gray-600">作成日：</span>
                    <span className="font-medium">
                      {new Date(project.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    クリックして詳細を表示
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

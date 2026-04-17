"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getStatusBadgeColor, getStatusLabel, type ProjectStatus } from "@/lib/status-utils";
import { useLocale } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface ProjectDetail {
  id: string;
  name: string;
  model_type: string;
  genre: string;
  description: string;
  status: ProjectStatus;
  created_at: string;
  days_until_deletion: number;
}

interface HistoryEntry {
  version: string;
  timestamp: string;
  status: "success" | "in_progress" | "failed";
}

const getHistoryStatusColor = (
  status: "success" | "in_progress" | "failed"
) => {
  switch (status) {
    case "success":
      return "bg-emerald-500/10 text-emerald-400";
    case "in_progress":
      return "bg-blue-500/10 text-blue-400";
    case "failed":
      return "bg-red-500/10 text-red-400";
  }
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { t, locale, setLocale } = useLocale();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getProject(projectId);
        setProject({
          id: data.id,
          name: data.name,
          model_type: data.model_type,
          genre: data.genre,
          description: data.description,
          status: data.status,
          created_at: data.created_at,
          days_until_deletion: data.days_until_deletion,
        });
        // 学習履歴を取得
        try {
          const historyData = await api.getTrainingHistory(projectId);
          setHistory(
            (historyData.jobs || []).map((j: { id: string; status: string; created_at: string }) => ({
              id: j.id,
              status: j.status,
              created_at: j.created_at,
            }))
          );
        } catch {
          setHistory([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("detail.errorFetch"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleAddLearning = async () => {
    try {
      setIsActionLoading(true);
      const response = await api.createCheckout(projectId);
      // Stripe URLを検証してから遷移
      if (response.checkout_url) {
        const checkoutUrl = new URL(response.checkout_url);
        if (checkoutUrl.hostname.endsWith("stripe.com")) {
          window.location.href = response.checkout_url;
        } else {
          throw new Error("Invalid checkout URL");
        }
      }
    } catch {
      alert(t("detail.errorAddTraining"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      t("detail.resetConfirm")
    );
    if (!confirmed) return;

    try {
      setIsActionLoading(true);
      await api.resetProject(projectId);
      alert(t("detail.resetSuccess"));
      // リセット後、ページをリロードして最新データを取得
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("detail.errorReset"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsActionLoading(true);
      const response = await api.downloadModel(projectId);
      // ダウンロードURLへリダイレクト
      if (response.download_url) {
        window.location.href = response.download_url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t("detail.errorDownload"));
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-400">{error || t("detail.errorNotFound")}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
        >
          {t("detail.backToDashboard")}
        </button>
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
        {/* Project Info Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {project.name}
              </h2>
              <p className="text-sm text-zinc-400">{project.model_type}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(
                project.status
              )}`}
            >
              {t("status." + project.status)}
            </span>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-white/[0.06]">
            <div>
              <p className="text-xs text-zinc-500 mb-1">{t("detail.genre")}</p>
              <p className="text-base font-semibold text-white">
                {project.genre}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">{t("detail.createdDate")}</p>
              <p className="text-base font-semibold text-white">
                {new Date(project.created_at).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US")}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">{t("detail.daysLeft")}</p>
              <p className="text-base font-semibold text-white">
                {t("dashboard.daysLeft", { n: project.days_until_deletion })}
              </p>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">{t("detail.purpose")}</p>
            <p className="text-sm text-zinc-300">{project.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleAddLearning}
            disabled={isActionLoading}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActionLoading ? t("detail.processing") : t("detail.addTraining")}
          </button>
          <button
            onClick={handleReset}
            disabled={isActionLoading}
            className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isActionLoading ? t("detail.processing") : t("detail.reset")}
          </button>
          <button
            onClick={handleDownload}
            disabled={isActionLoading}
            className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-zinc-300 cursor-pointer transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActionLoading ? t("detail.processing") : t("detail.download")}
          </button>
        </div>

        {/* Learning History */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-6">{t("detail.history")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {t("detail.version")}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {t("detail.date")}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {t("detail.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-white font-medium">
                      {entry.version}
                    </td>
                    <td className="py-4 px-4 text-sm text-zinc-400">
                      {new Date(entry.timestamp).toLocaleString(locale === "ja" ? "ja-JP" : "en-US")}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getHistoryStatusColor(
                          entry.status
                        )}`}
                      >
                        {t("status." + entry.status)}
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

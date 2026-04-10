"use client";

import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getStatusBadgeColor, getStatusLabel, type ProjectStatus } from "@/lib/status-utils";
import { Nav } from "@/components/nav";
import { PageSpinner } from "@/components/spinner";
import { ErrorAlert } from "@/components/error-alert";
import { BookOpen, RotateCcw, Download } from "lucide-react";

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
  id: string;
  status: "success" | "in_progress" | "failed";
  created_at: string;
}

const getHistoryStatusColor = (status: "success" | "in_progress" | "failed") => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "failed":
      return "bg-red-100 text-red-800";
  }
};

const getHistoryStatusLabel = (status: "success" | "in_progress" | "failed") => {
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

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

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
        try {
          const historyData = await api.getTrainingHistory(projectId);
          const statusMap: Record<string, "success" | "in_progress" | "failed"> = {
            done: "success",
            queued: "in_progress",
            running: "in_progress",
            failed: "failed",
          };
          setHistory(
            (historyData.jobs || []).map(
              (j: { id: string; status: string; created_at: string }) => ({
                id: j.id,
                status: statusMap[j.status] ?? "failed",
                created_at: j.created_at,
              })
            )
          );
        } catch {
          setHistory([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "プロジェクトの取得に失敗しました");
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
      if (response.checkout_url) {
        const checkoutUrl = new URL(response.checkout_url);
        if (checkoutUrl.hostname.endsWith("stripe.com")) {
          window.location.href = response.checkout_url;
        } else {
          throw new Error("Invalid checkout URL");
        }
      }
    } catch {
      alert("追加学習の開始に失敗しました。もう一度お試しください。");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "現在の学習内容をリセットする。元に戻せないが実行するか？"
    );
    if (!confirmed) return;

    try {
      setIsActionLoading(true);
      await api.resetProject(projectId);
      alert("プロジェクトをリセットしました");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "リセットに失敗しました");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsActionLoading(true);
      const response = await api.downloadModel(projectId);
      if (response.download_url) {
        window.location.href = response.download_url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "ダウンロードに失敗しました");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error || !project) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <p className="text-caption" style={{ color: "var(--color-error)" }}>
          {error || "プロジェクトが見つかりません"}
        </p>
        <button onClick={() => router.push("/dashboard")} className="btn-primary">
          ダッシュボードに戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Nav */}
      <Nav left="back" rightLabel={project.name} />

      {/* Main */}
      <main
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* Project Info Card */}
        <div className="card-apple animate-fade-in" style={{ marginBottom: 24 }}>
          {/* Name + Status */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                className="text-section"
                style={{ color: "var(--color-text)", marginBottom: 6 }}
              >
                {project.name}
              </h1>
              <p className="text-caption" style={{ color: "var(--color-text-tertiary)" }}>
                {project.model_type}
              </p>
            </div>
            <span
              className={getStatusBadgeColor(project.status)}
              style={{
                marginLeft: 16,
                padding: "6px 16px",
                borderRadius: 980,
                fontSize: "0.875rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 24,
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: "1px solid var(--color-border)",
            }}
            className="detail-grid"
          >
            <div>
              <p className="text-micro" style={{ color: "var(--color-text-tertiary)", marginBottom: 4 }}>
                ジャンル
              </p>
              <p className="text-body-emphasis" style={{ color: "var(--color-text)" }}>
                {project.genre}
              </p>
            </div>
            <div>
              <p className="text-micro" style={{ color: "var(--color-text-tertiary)", marginBottom: 4 }}>
                作成日
              </p>
              <p className="text-body-emphasis" style={{ color: "var(--color-text)" }}>
                {new Date(project.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>
            <div>
              <p className="text-micro" style={{ color: "var(--color-text-tertiary)", marginBottom: 4 }}>
                残り日数
              </p>
              <p className="text-body-emphasis" style={{ color: "var(--color-text)" }}>
                あと{project.days_until_deletion}日
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-micro" style={{ color: "var(--color-text-tertiary)", marginBottom: 8 }}>
              用途説明
            </p>
            <p className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
              {project.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleAddLearning}
            disabled={isActionLoading}
            className="btn-primary"
          >
            {isActionLoading ? "処理中..." : <><BookOpen size={18} />追加学習</>}
          </button>
          <button
            onClick={handleReset}
            disabled={isActionLoading}
            className="btn-pill"
            style={{
              borderColor: "var(--color-error)",
              color: "var(--color-error)",
              opacity: isActionLoading ? 0.42 : 1,
              cursor: isActionLoading ? "not-allowed" : "pointer",
            }}
          >
            {isActionLoading ? "処理中..." : <><RotateCcw size={18} />リセット</>}
          </button>
          <button
            onClick={handleDownload}
            disabled={isActionLoading}
            className="btn-secondary"
          >
            {isActionLoading ? "処理中..." : <><Download size={18} />ダウンロード</>}
          </button>
        </div>

        {/* Training History */}
        <div className="card-apple">
          <h2
            className="text-card-title"
            style={{ color: "var(--color-text)", marginBottom: 24 }}
          >
            学習履歴
          </h2>

          {history.length === 0 ? (
            <p className="text-caption" style={{ color: "var(--color-text-tertiary)" }}>
              学習履歴がありません
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th
                      className="text-micro"
                      style={{
                        textAlign: "left",
                        padding: "0 0 12px",
                        color: "var(--color-text-tertiary)",
                        fontWeight: 500,
                      }}
                    >
                      バージョン
                    </th>
                    <th
                      className="text-micro"
                      style={{
                        textAlign: "left",
                        padding: "0 0 12px 16px",
                        color: "var(--color-text-tertiary)",
                        fontWeight: 500,
                      }}
                    >
                      日時
                    </th>
                    <th
                      className="text-micro"
                      style={{
                        textAlign: "left",
                        padding: "0 0 12px 16px",
                        color: "var(--color-text-tertiary)",
                        fontWeight: 500,
                      }}
                    >
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <td
                        className="text-caption"
                        style={{
                          padding: "14px 0",
                          color: "var(--color-text)",
                          fontWeight: 500,
                        }}
                      >
                        v{history.length - idx}
                      </td>
                      <td
                        className="text-caption"
                        style={{
                          padding: "14px 0 14px 16px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {new Date(entry.created_at).toLocaleString("ja-JP")}
                      </td>
                      <td style={{ padding: "14px 0 14px 16px" }}>
                        <span
                          className={getHistoryStatusColor(entry.status)}
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 980,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                          }}
                        >
                          {getHistoryStatusLabel(entry.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          .detail-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

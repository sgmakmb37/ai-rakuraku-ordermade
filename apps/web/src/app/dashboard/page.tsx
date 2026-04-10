"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getStatusBadgeColor, getStatusLabel, type ProjectStatus } from "@/lib/status-utils";
import { Nav } from "@/components/nav";
import { Spinner } from "@/components/spinner";
import { Plus } from "lucide-react";

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
    } catch {
      // signOut failure is non-critical; redirect anyway
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
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Nav */}
      <Nav left="brand" onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />

      {/* Main */}
      <main
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "56px 24px 80px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          <h1 className="text-section" style={{ color: "var(--color-text)", marginBottom: 24 }}>
            プロジェクト
          </h1>
          <button
            onClick={handleNewProject}
            disabled={!canCreateNewProject}
            className="btn-primary"
            style={!canCreateNewProject ? { opacity: 0.42, cursor: "not-allowed" } : undefined}
          >
            {canCreateNewProject ? <><Plus size={18} />新規作成</> : "上限に達しています"}
          </button>
        </div>

        {/* States */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <Spinner size={24} />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p className="text-caption" style={{ color: "var(--color-error)", marginBottom: 20 }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              リトライ
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p
              className="text-caption"
              style={{ color: "var(--color-text-tertiary)", marginBottom: 20 }}
            >
              まだプロジェクトがありません
            </p>
            <button onClick={handleNewProject} className="btn-primary">
              最初のプロジェクトを作成
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)",
              gap: 16,
            }}
            className="project-grid"
          >
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleCardClick(project.id)}
                className="card-apple animate-fade-in"
                style={{
                  cursor: "pointer",
                  transition: "transform 200ms ease-in-out, opacity 200ms ease-in-out",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      className="text-card-title"
                      style={{
                        color: "var(--color-text)",
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {project.name}
                    </h3>
                    <p className="text-caption" style={{ color: "var(--color-text-tertiary)" }}>
                      {project.model_type}
                    </p>
                  </div>
                  <span
                    className={`${getStatusBadgeColor(project.status)}`}
                    style={{
                      marginLeft: 12,
                      padding: "4px 12px",
                      borderRadius: 980,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                {/* Card Meta */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="text-micro" style={{ color: "var(--color-text-tertiary)" }}>
                    作成日 {new Date(project.created_at).toLocaleDateString("ja-JP")}
                  </span>
                  <span className="text-micro" style={{ color: "var(--color-text-tertiary)" }}>
                    あと{project.days_until_deletion}日
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @media (min-width: 768px) {
          .project-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .project-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

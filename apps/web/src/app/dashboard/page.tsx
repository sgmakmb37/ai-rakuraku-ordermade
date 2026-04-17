"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getStatusBadgeColor, type ProjectStatus } from "@/lib/status-utils";
import { useLocale } from "@/lib/i18n";
import { Globe } from "lucide-react";

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
  expires_at: string;
}

function calcDaysLeft(expiresAt: string | undefined): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const { t, locale, setLocale } = useLocale();

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
          days_until_deletion: calcDaysLeft(p.expires_at),
        }));
        setProjects(transformedProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("dashboard.errorFetch"));
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
      console.error("logout error:", error);
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
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors disabled:opacity-50"
            >
              {isLogoutLoading ? t("dashboard.loggingOut") : t("common.logout")}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        {/* Top Section with New Project Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">
            {t("dashboard.projectList")}
          </h2>
          <button
            onClick={handleNewProject}
            disabled={!canCreateNewProject}
            className={
              canCreateNewProject
                ? "rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
                : "rounded-lg border border-white/[0.1] bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-zinc-500 cursor-not-allowed"
            }
          >
            {canCreateNewProject ? t("dashboard.newProject") : t("dashboard.limitReached")}
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-sm text-zinc-400">{t("common.loading")}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
            >
              {t("common.retry")}
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-sm text-zinc-400 mb-4">{t("dashboard.empty")}</p>
            <button
              onClick={handleNewProject}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
            >
              {t("dashboard.createFirst")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleCardClick(project.id)}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 cursor-pointer transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-zinc-400">{project.model_type}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ml-2 ${getStatusBadgeColor(
                      project.status
                    )}`}
                  >
                    {t("status." + project.status)}
                  </span>
                </div>

                {/* Meta Information */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">{t("dashboard.remainingDays")}</span>
                    <span className="text-sm text-zinc-300 font-medium">
                      {t("dashboard.daysUntilDeletion", { n: project.days_until_deletion })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">{t("dashboard.created")}</span>
                    <span className="text-sm text-zinc-300 font-medium">
                      {new Date(project.created_at).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US")}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-zinc-500">
                    {t("dashboard.clickToView")}
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

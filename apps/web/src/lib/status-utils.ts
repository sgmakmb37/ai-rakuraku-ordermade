export type ProjectStatus = "created" | "training" | "completed" | "failed";

export const getStatusBadgeColor = (status: ProjectStatus): string => {
  switch (status) {
    case "training":
      return "bg-blue-500/10 text-blue-400";
    case "completed":
      return "bg-emerald-500/10 text-emerald-400";
    case "failed":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-white/[0.06] text-zinc-400";
  }
};

export const getStatusLabel = (status: ProjectStatus): string => {
  switch (status) {
    case "created":
      return "作成済み";
    case "training":
      return "学習中";
    case "completed":
      return "完了";
    case "failed":
      return "失敗";
    default:
      return status;
  }
};

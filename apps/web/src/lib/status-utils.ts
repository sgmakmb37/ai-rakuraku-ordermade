export type ProjectStatus = "created" | "training" | "completed" | "failed";

export const getStatusBadgeColor = (status: ProjectStatus): string => {
  switch (status) {
    case "training":
      return "bg-[#007aff]/10 text-[#007aff]";
    case "completed":
      return "bg-[#34c759]/10 text-[#34c759]";
    case "failed":
      return "bg-[#ff3b30]/10 text-[#ff3b30]";
    default:
      return "bg-[var(--color-text-tertiary)]/10 text-[var(--color-text-secondary)]";
  }
};

export const getStatusLabel = (status: ProjectStatus, t?: (key: string) => string): string => {
  if (t) {
    const key = `status.${status}`;
    return t(key);
  }
  // fallback to Japanese
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

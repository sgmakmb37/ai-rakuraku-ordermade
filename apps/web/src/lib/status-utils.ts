export type ProjectStatus = "created" | "training" | "completed" | "failed";

export const getStatusBadgeColor = (status: ProjectStatus): string => {
  switch (status) {
    case "training":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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

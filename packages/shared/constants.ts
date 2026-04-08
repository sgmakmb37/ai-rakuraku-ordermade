export const MODEL_OPTIONS = [
  {
    id: "qwen2.5-1.5b",
    name: "Qwen2.5 1.5B",
    label: "高速（軽量）",
  },
  {
    id: "qwen2.5-3b",
    name: "Qwen2.5 3B",
    label: "標準（高品質）",
  },
] as const;

export const GENRE_OPTIONS = [
  {
    id: "customer-support",
    label: "カスタマーサポート",
  },
  {
    id: "internal-knowledge",
    label: "社内ナレッジ",
  },
  {
    id: "writing",
    label: "文章作成・要約",
  },
  {
    id: "programming",
    label: "プログラミング補助",
  },
  {
    id: "education",
    label: "教育・学習支援",
  },
  {
    id: "other",
    label: "その他",
  },
] as const;

export const MAX_PROJECTS_PER_USER = 5;
export const MAX_SOURCES_PER_PROJECT = 5;
export const MAX_TOTAL_CHARS = 500000;
export const MAX_CHARS_PER_SOURCE = 200000;
export const PRICE_PER_TRAINING = 770;
export const DATA_RETENTION_DAYS = 30;
export const MAX_TRAINING_MINUTES = 60;

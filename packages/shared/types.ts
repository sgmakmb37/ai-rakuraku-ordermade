export type ProjectStatus = "created" | "training" | "completed" | "failed";
export type TrainingJobStatus = "queued" | "running" | "done" | "failed";
export type SourceType = "url" | "file";

export interface DataSource {
  id: string;
  projectId: string;
  type: SourceType;
  url?: string;
  fileName?: string;
  fileSize?: number;
  charCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  genre: string;
  status: ProjectStatus;
  modelId: string;
  totalChars: number;
  sourceCount: number;
  trainingJobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingJob {
  id: string;
  projectId: string;
  status: TrainingJobStatus;
  startedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  projectId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

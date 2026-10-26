export const TASK_STATUSES = ["draft", "dispatched", "done", "failed"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Category {
  id: string;
  name: string;
}

export interface Prompt {
  id: string;
  name: string;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  dueDate: string | null;
  prompt: string | null;
  status: TaskStatus;
  resultText: string | null;
  error: string | null;
}

export interface FollowUp {
  title: string;
  due_date?: string | null;
  prompt?: string | null;
}

export interface ReturnData {
  version: number;
  status: "done" | "failed";
  result_text: string;
  follow_ups: FollowUp[];
}

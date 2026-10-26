import type { Category, Prompt, Task } from "@/lib/domain/model";

interface DataResponse<T> {
  data: T;
}

interface ErrorResponse {
  error?: { message?: string };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorResponse;
    throw new Error(body.error?.message ?? `Request failed with HTTP ${response.status}.`);
  }
  if (response.status === 204) return undefined as T;
  return ((await response.json()) as DataResponse<T>).data;
}

export const api = {
  categories: {
    list: () => request<Category[]>("/api/categories"),
    create: (name: string) => request<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
    update: (id: string, name: string) => request<Category>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
    delete: (id: string) => request<void>(`/api/categories/${id}`, { method: "DELETE" }),
  },
  prompts: {
    list: () => request<Prompt[]>("/api/prompts"),
    create: (input: Pick<Prompt, "name" | "text">) => request<Prompt>("/api/prompts", {
      method: "POST",
      body: JSON.stringify(input),
    }),
    update: (id: string, input: Partial<Pick<Prompt, "name" | "text">>) =>
      request<Prompt>(`/api/prompts/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    delete: (id: string) => request<void>(`/api/prompts/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: () => request<Task[]>("/api/tasks"),
    create: (input: Omit<Task, "id" | "status" | "resultText" | "error">) =>
      request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: Partial<Omit<Task, "id" | "status" | "resultText" | "error">>) =>
      request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    delete: (id: string) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
    dispatch: (id: string, model: string) => request(`/api/tasks/${id}/dispatch`, {
      method: "POST",
      body: JSON.stringify({ model }),
    }),
  },
  models: () => request<Array<{ id: string; name: string }>>("/api/models"),
};

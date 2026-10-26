import { z } from "zod";

import type { ReturnData, Task } from "./model";

const followUpSchema = z.object({
  title: z.string(),
  due_date: z.string().nullable().optional(),
  prompt: z.string().nullable().optional(),
});

const returnDataSchema = z.object({
  version: z.number().int().default(1),
  status: z.enum(["done", "failed"]),
  result_text: z.string().default(""),
  follow_ups: z.array(followUpSchema).default([]),
});

export function wrapperPrompt(task: Task, promptText: string): string {
  return `You are an agent. You execute a task. The app reads your reply as data.
Return only valid JSON. Obey this schema exactly:
{"version":1,"status":"done"|"failed","result_text":"...","follow_ups":[{"title":"...","due_date":"YYYY-MM-DD","prompt":"..."}]}
Rules:
- "status" is "done" if you did the task. Else it is "failed".
- "result_text" tells the user what you did.
- "follow_ups" lists follow-up tasks. Omit the field if there are none.
- "due_date" and "prompt" inside a follow-up are optional.
- Do not write any text outside the JSON.

Task: ${task.title}
${task.description}
Prompt: ${promptText}`;
}

export function parseReturnData(raw: string): ReturnData {
  const afterFence = raw.includes("```json")
    ? raw.slice(raw.indexOf("```json") + "```json".length)
    : raw;
  const text = afterFence.includes("```")
    ? afterFence.slice(0, afterFence.indexOf("```"))
    : afterFence;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error("No JSON object found in the agent reply.");
  }

  let candidate: unknown;
  try {
    candidate = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error("The agent reply contains invalid JSON.");
  }

  const parsed = returnDataSchema.safeParse(candidate);
  if (!parsed.success) {
    const statusIssue = parsed.error.issues.find((issue) => issue.path[0] === "status");
    if (statusIssue && typeof candidate === "object" && candidate !== null && "status" in candidate) {
      throw new Error(`status must be done or failed, got '${String(candidate.status)}'.`);
    }
    throw new Error(`The agent reply does not obey the return schema: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
  }

  return parsed.data;
}

import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const taskStatus = pgEnum("task_status", [
  "draft",
  "dispatched",
  "done",
  "failed",
]);

export const jobStatus = pgEnum("job_status", [
  "pending",
  "running",
  "done",
  "failed",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ...timestamps,
});

export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  text: text("text").notNull(),
  ...timestamps,
});

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    dueDate: date("due_date"),
    prompt: text("prompt"),
    status: taskStatus("status").default("draft").notNull(),
    resultText: text("result_text"),
    error: text("error"),
    ...timestamps,
  },
  (table) => [index("tasks_category_id_idx").on(table.categoryId)],
);

export const dispatchJobs = pgTable(
  "dispatch_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    target: text("target").default("openroute").notNull(),
    model: text("model").notNull(),
    status: jobStatus("status").default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [
    index("dispatch_jobs_status_next_attempt_idx").on(table.status, table.nextAttemptAt, table.createdAt),
    uniqueIndex("dispatch_jobs_one_active_per_task_idx")
      .on(table.taskId)
      .where(sql`${table.status} in ('pending', 'running')`),
  ],
);

export type CategoryRow = typeof categories.$inferSelect;
export type PromptRow = typeof prompts.$inferSelect;
export type TaskRow = typeof tasks.$inferSelect;
export type DispatchJobRow = typeof dispatchJobs.$inferSelect;

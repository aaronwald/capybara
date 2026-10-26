import { getPool } from "../db/client";
import { parseReturnData, wrapperPrompt } from "../domain/dispatch";
import type { Task } from "../domain/model";

import { dispatchOpenRouter, ProviderError } from "./openrouter";

interface ClaimedJob {
  id: string;
  task_id: string;
  model: string;
  attempts: number;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string;
  category_id: string;
  due_date: string | null;
  prompt: string | null;
  status: Task["status"];
  result_text: string | null;
  error: string | null;
}

export async function claimJob(): Promise<ClaimedJob | null> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    await client.query(`
      update dispatch_jobs
      set status = 'pending', started_at = null, next_attempt_at = now(),
          last_error = 'Worker stopped before the dispatch completed.'
      where status = 'running' and started_at < now() - interval '3 minutes'
    `);
    const result = await client.query<ClaimedJob>(`
      with next_job as (
        select id
        from dispatch_jobs
        where status = 'pending' and next_attempt_at <= now()
        order by next_attempt_at, created_at
        for update skip locked
        limit 1
      )
      update dispatch_jobs j
      set status = 'running', started_at = now(), attempts = attempts + 1
      from next_job
      where j.id = next_job.id
      returning j.id, j.task_id, j.model, j.attempts
    `);
    await client.query("commit");
    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function processJob(job: ClaimedJob): Promise<void> {
  const pool = getPool();
  const taskResult = await pool.query<TaskRecord>("select * from tasks where id = $1", [job.task_id]);
  const row = taskResult.rows[0];
  if (!row) {
    await failJob(job, "Task not found.", false);
    return;
  }

  const task: Task = {
    id: row.id,
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    dueDate: row.due_date,
    prompt: row.prompt,
    status: row.status,
    resultText: row.result_text,
    error: row.error,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const raw = await dispatchOpenRouter(
      wrapperPrompt(task, task.prompt ?? "Research this task and report the result."),
      job.model,
      { signal: controller.signal },
    );
    const result = parseReturnData(raw);

    const client = await pool.connect();
    try {
      await client.query("begin");
      const active = await client.query(
        `select t.id
         from tasks t
         join dispatch_jobs j on j.task_id = t.id
         where t.id = $1 and j.id = $2 and j.status = 'running' and j.attempts = $3
         for update of t, j`,
        [task.id, job.id, job.attempts],
      );
      if (active.rowCount !== 1) {
        await client.query("rollback");
        return;
      }
      await client.query(
        `update tasks
         set status = $2, result_text = $3, error = null, updated_at = now()
         where id = $1`,
        [task.id, result.status, result.result_text],
      );
      for (const followUp of result.follow_ups) {
        await client.query(
          `insert into tasks (title, description, category_id, due_date, prompt, status)
           values ($1, '', $2, $3, $4, 'draft')`,
          [followUp.title, task.categoryId, followUp.due_date ?? null, followUp.prompt ?? null],
        );
      }
      await client.query(
        "update dispatch_jobs set status = 'done', finished_at = now(), last_error = null where id = $1 and status = 'running' and attempts = $2",
        [job.id, job.attempts],
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    const retryable = error instanceof ProviderError && error.retryable;
    await failJob(job, safeError(error), retryable);
  } finally {
    clearTimeout(timeout);
  }
}

async function failJob(job: ClaimedJob, message: string, retryable: boolean): Promise<void> {
  const shouldRetry = retryable && job.attempts < 3;
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const retryDelaySeconds = 30 * 2 ** Math.max(0, job.attempts - 1);
    const updated = await client.query(
      `update dispatch_jobs
       set status = $2::job_status, last_error = $3,
           next_attempt_at = case when $5 then now() + ($4 * interval '1 second') else next_attempt_at end,
           started_at = case when $5 then null else started_at end,
           finished_at = case when $5 then null else now() end
       where id = $1 and status = 'running' and attempts = $6
       returning task_id`,
      [job.id, shouldRetry ? "pending" : "failed", message, retryDelaySeconds, shouldRetry, job.attempts],
    );
    if (updated.rowCount !== 1) {
      await client.query("rollback");
      return;
    }
    await client.query(
      "update tasks set status = $2, error = $3, updated_at = now() where id = $1",
      [job.task_id, shouldRetry ? "dispatched" : "failed", message],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

function safeError(error: unknown): string {
  if (error instanceof ProviderError) return error.message;
  return "The agent result could not be validated or saved.";
}

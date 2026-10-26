import { createServer, type Server } from "node:http";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { getPool } from "../lib/db/client";
import { claimJob, processJob } from "../lib/dispatch/worker";

type Mode = "done" | "failed-http" | "delayed";
let mode: Mode = "done";
let server: Server;
let baseUrl: string;
let categoryId: string;

beforeAll(async () => {
  server = createServer(async (_request, response) => {
    if (mode === "delayed") await new Promise((resolve) => setTimeout(resolve, 100));
    if (mode === "failed-http") {
      response.writeHead(500, { "content-type": "text/plain" });
      response.end("provider detail that must not be stored");
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        version: 1,
        status: "done",
        result_text: "completed",
        follow_ups: [{ title: "Verify result", due_date: "2026-11-01", prompt: "verify" }],
      }) } }],
    }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Mock provider did not start.");
  baseUrl = `http://127.0.0.1:${address.port}`;
  process.env.OPENROUTER_BASE_URL = baseUrl;
  process.env.OPENROUTER_API_KEY = "integration-test";
});

beforeEach(async () => {
  mode = "done";
  const pool = getPool();
  await pool.query("truncate dispatch_jobs, tasks, categories cascade");
  const result = await pool.query<{ id: string }>("insert into categories (name) values ('General') returning id");
  categoryId = result.rows[0].id;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await getPool().end();
});

async function enqueue(title = "Integration task") {
  const pool = getPool();
  const task = await pool.query<{ id: string }>(
    "insert into tasks (title, description, category_id, prompt, status) values ($1, '', $2, 'research', 'dispatched') returning id",
    [title, categoryId],
  );
  await pool.query(
    "insert into dispatch_jobs (task_id, model, status) values ($1, 'test-model', 'pending')",
    [task.rows[0].id],
  );
  return task.rows[0].id;
}

describe("PostgreSQL dispatch flow", () => {
  it("claims once, completes the task, and creates a follow-up", async () => {
    const taskId = await enqueue();
    const [first, second] = await Promise.all([claimJob(), claimJob()]);
    const job = first ?? second;

    expect(job).not.toBeNull();
    expect([first, second].filter(Boolean)).toHaveLength(1);
    await processJob(job!);

    const task = await getPool().query("select status, result_text from tasks where id = $1", [taskId]);
    const followUp = await getPool().query("select title, due_date, prompt, status from tasks where id <> $1", [taskId]);
    expect(task.rows[0]).toMatchObject({ status: "done", result_text: "completed" });
    expect(followUp.rows[0]).toMatchObject({ title: "Verify result", prompt: "verify", status: "draft" });
    expect(String(followUp.rows[0].due_date)).toContain("2026-11-01");
  });

  it("delays a retry and stores no provider body", async () => {
    mode = "failed-http";
    const taskId = await enqueue();
    const job = await claimJob();
    await processJob(job!);

    const result = await getPool().query(
      "select j.status, j.last_error, j.next_attempt_at > now() as delayed, t.status as task_status from dispatch_jobs j join tasks t on t.id = j.task_id where t.id = $1",
      [taskId],
    );
    expect(result.rows[0]).toMatchObject({ status: "pending", delayed: true, task_status: "dispatched" });
    expect(result.rows[0].last_error).toBe("OpenRouter returned HTTP 500.");
    expect(result.rows[0].last_error).not.toContain("provider detail");
    expect(await claimJob()).toBeNull();
  });

  it("recovers a stale running job", async () => {
    const taskId = await enqueue();
    await getPool().query(
      "update dispatch_jobs set status = 'running', started_at = now() - interval '4 minutes' where task_id = $1",
      [taskId],
    );

    const recovered = await claimJob();
    expect(recovered?.task_id).toBe(taskId);
    expect(recovered?.attempts).toBe(1);
  });

  it("fences an old worker after stale-job recovery", async () => {
    const taskId = await enqueue();
    const oldLease = await claimJob();
    await getPool().query(
      "update dispatch_jobs set started_at = now() - interval '4 minutes' where id = $1",
      [oldLease!.id],
    );
    const newLease = await claimJob();
    expect(newLease?.attempts).toBe(2);

    mode = "failed-http";
    await processJob(oldLease!);
    const active = await getPool().query("select status, attempts from dispatch_jobs where id = $1", [oldLease!.id]);
    expect(active.rows[0]).toMatchObject({ status: "running", attempts: 2 });

    mode = "done";
    await processJob(newLease!);
    const task = await getPool().query("select status from tasks where id = $1", [taskId]);
    expect(task.rows[0].status).toBe("done");
  });

  it("does not create ghost follow-ups after task deletion", async () => {
    mode = "delayed";
    const taskId = await enqueue();
    const job = await claimJob();
    const processing = processJob(job!);
    await new Promise((resolve) => setTimeout(resolve, 20));
    await getPool().query("delete from tasks where id = $1", [taskId]);
    await processing;

    const remaining = await getPool().query("select id from tasks");
    expect(remaining.rowCount).toBe(0);
  });
});

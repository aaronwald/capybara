import { claimJob, processJob } from "@/lib/dispatch/worker";
import { getPool } from "@/lib/db/client";

let stopping = false;
const stop = () => { stopping = true; };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

console.log("Capybara dispatch worker started.");

while (!stopping) {
  const job = await claimJob();
  if (!job) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    continue;
  }
  console.log(JSON.stringify({ event: "dispatch_started", jobId: job.id, taskId: job.task_id }));
  await processJob(job);
  console.log(JSON.stringify({ event: "dispatch_finished", jobId: job.id, taskId: job.task_id }));
}

await getPool().end();
console.log("Capybara dispatch worker stopped.");

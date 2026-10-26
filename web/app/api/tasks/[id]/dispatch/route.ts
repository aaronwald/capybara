import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { ApiError, assertSameOrigin, jsonError, parseBody } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { dispatchJobs, tasks } from "@/lib/db/schema";

const dispatchSchema = z.object({
  model: z.string().trim().min(1).max(200).default("openai/gpt-5.6-sol"),
});

export async function GET(_request: Request, context: RouteContext<"/api/tasks/[id]/dispatch">) {
  try {
    const { id } = await context.params;
    const [job] = await getDb()
      .select()
      .from(dispatchJobs)
      .where(eq(dispatchJobs.taskId, id))
      .orderBy(desc(dispatchJobs.createdAt))
      .limit(1);
    if (!job) throw new ApiError(404, "not_found", "Dispatch job not found.");
    return Response.json({ data: job });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, context: RouteContext<"/api/tasks/[id]/dispatch">) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = await parseBody(request, dispatchSchema);
    const job = await getDb().transaction(async (tx) => {
      const [task] = await tx.select().from(tasks).where(eq(tasks.id, id)).for("update").limit(1);
      if (!task) throw new ApiError(404, "not_found", "Task not found.");
      if (task.status === "dispatched") {
        throw new ApiError(409, "already_dispatched", "The task already has an active dispatch.");
      }
      await tx
        .update(tasks)
        .set({ status: "dispatched", resultText: null, error: null, updatedAt: new Date() })
        .where(eq(tasks.id, id));
      const [created] = await tx
        .insert(dispatchJobs)
        .values({ taskId: id, model: body.model })
        .returning();
      return created;
    });
    return Response.json({ data: job }, { status: 202 });
  } catch (error) {
    return jsonError(error);
  }
}

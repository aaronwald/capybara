import { eq } from "drizzle-orm";

import { ApiError, assertSameOrigin, jsonError, parseBody } from "@/lib/api/http";
import { updateTaskSchema } from "@/lib/api/validation";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";

export async function GET(_request: Request, context: RouteContext<"/api/tasks/[id]">) {
  try {
    const { id } = await context.params;
    const [row] = await getDb().select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!row) throw new ApiError(404, "not_found", "Task not found.");
    return Response.json({ data: row });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = await parseBody(request, updateTaskSchema);
    const [row] = await getDb()
      .update(tasks)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    if (!row) throw new ApiError(404, "not_found", "Task not found.");
    return Response.json({ data: row });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const [row] = await getDb().delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
    if (!row) throw new ApiError(404, "not_found", "Task not found.");
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}

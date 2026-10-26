import { and, asc, eq, type SQL } from "drizzle-orm";

import { assertSameOrigin, jsonError, parseBody } from "@/lib/api/http";
import { createTaskSchema } from "@/lib/api/validation";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { TASK_STATUSES } from "@/lib/domain/model";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const conditions: SQL[] = [];
    const categoryId = params.get("categoryId");
    const status = params.get("status");
    if (categoryId) conditions.push(eq(tasks.categoryId, categoryId));
    if (status && TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
      conditions.push(eq(tasks.status, status as (typeof TASK_STATUSES)[number]));
    }
    const rows = await getDb()
      .select()
      .from(tasks)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(tasks.createdAt));
    return Response.json({ data: rows });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await parseBody(request, createTaskSchema);
    const [row] = await getDb().insert(tasks).values(body).returning();
    return Response.json({ data: row }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

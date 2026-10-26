import { asc } from "drizzle-orm";

import { assertSameOrigin, jsonError, parseBody } from "@/lib/api/http";
import { createCategorySchema } from "@/lib/api/validation";
import { getDb } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";

export async function GET() {
  try {
    const rows = await getDb().select().from(categories).orderBy(asc(categories.name));
    return Response.json({ data: rows });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await parseBody(request, createCategorySchema);
    const [row] = await getDb().insert(categories).values(body).returning();
    return Response.json({ data: row }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

import { eq } from "drizzle-orm";

import { ApiError, assertSameOrigin, jsonError, parseBody } from "@/lib/api/http";
import { updateCategorySchema } from "@/lib/api/validation";
import { getDb } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";

export async function PATCH(request: Request, context: RouteContext<"/api/categories/[id]">) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = await parseBody(request, updateCategorySchema);
    const [row] = await getDb()
      .update(categories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    if (!row) throw new ApiError(404, "not_found", "Category not found.");
    return Response.json({ data: row });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/categories/[id]">) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const [row] = await getDb().delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    if (!row) throw new ApiError(404, "not_found", "Category not found.");
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}

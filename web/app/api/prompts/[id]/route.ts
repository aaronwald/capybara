import { eq } from "drizzle-orm";

import { ApiError, assertSameOrigin, jsonError, parseBody } from "@/lib/api/http";
import { updatePromptSchema } from "@/lib/api/validation";
import { getDb } from "@/lib/db/client";
import { prompts } from "@/lib/db/schema";

export async function PATCH(request: Request, context: RouteContext<"/api/prompts/[id]">) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = await parseBody(request, updatePromptSchema);
    const [row] = await getDb()
      .update(prompts)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(prompts.id, id))
      .returning();
    if (!row) throw new ApiError(404, "not_found", "Prompt not found.");
    return Response.json({ data: row });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/prompts/[id]">) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const [row] = await getDb().delete(prompts).where(eq(prompts.id, id)).returning({ id: prompts.id });
    if (!row) throw new ApiError(404, "not_found", "Prompt not found.");
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}

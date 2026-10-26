import { z } from "zod";

import { jsonError } from "@/lib/api/http";

const responseSchema = z.object({
  data: z.array(z.object({ id: z.string(), name: z.string().optional() })),
});

export async function GET() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 3_600 },
    });
    if (!response.ok) throw new Error(`OpenRouter returned HTTP ${response.status}.`);
    const parsed = responseSchema.parse(await response.json());
    return Response.json({
      data: parsed.data
        .filter((model) => model.id.includes("sol"))
        .map((model) => ({ id: model.id, name: model.name ?? model.id })),
    });
  } catch (error) {
    return jsonError(error);
  }
}

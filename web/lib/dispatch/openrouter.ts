import { z } from "zod";

const chatResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string() }),
    }),
  ).min(1),
});

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

export async function dispatchOpenRouter(
  payload: string,
  model: string,
  options: { apiKey?: string; baseUrl?: string; signal?: AbortSignal } = {},
): Promise<string> {
  const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new ProviderError("OPENROUTER_API_KEY is not configured.", false);

  const baseUrl = (options.baseUrl ?? process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1").replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "http-referer": "https://capybara.varshtat.com",
        "x-title": "Capybara",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: payload }],
      }),
      signal: options.signal,
    });
  } catch (error) {
    throw new ProviderError(
      error instanceof Error ? `OpenRouter request failed: ${error.message}` : "OpenRouter request failed.",
      true,
    );
  }

  if (!response.ok) {
    throw new ProviderError(
      `OpenRouter returned HTTP ${response.status}.`,
      response.status === 429 || response.status >= 500,
    );
  }

  const parsed = chatResponseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    throw new ProviderError("OpenRouter returned an invalid response.", false);
  }
  return parsed.data.choices[0].message.content;
}

import { afterEach, describe, expect, it, vi } from "vitest";

import { dispatchOpenRouter, ProviderError } from "../lib/dispatch/openrouter";

afterEach(() => vi.unstubAllGlobals());

describe("OpenRouter adapter", () => {
  it("returns assistant content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      choices: [{ message: { content: '{"status":"done"}' } }],
    })));

    await expect(dispatchOpenRouter("task", "model", { apiKey: "test" })).resolves.toBe(
      '{"status":"done"}',
    );
  });

  it("caps the reserved output tokens", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      choices: [{ message: { content: "done" } }],
    }));
    vi.stubGlobal("fetch", fetchMock);

    await dispatchOpenRouter("task", "model", { apiKey: "test" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).max_tokens).toBe(8192);
  });

  it("reports insufficient credits without retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no credit", { status: 402 })));

    const error = await dispatchOpenRouter("task", "model", { apiKey: "test" }).catch((value) => value);
    expect(error.message).toContain("insufficient credits");
    expect(error.retryable).toBe(false);
  });

  it("marks rate limits as retryable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("slow down", { status: 429 })));

    const error = await dispatchOpenRouter("task", "model", { apiKey: "test" }).catch((value) => value);
    expect(error).toBeInstanceOf(ProviderError);
    expect(error.retryable).toBe(true);
  });

  it("does not expose provider response bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("sensitive diagnostic", { status: 500 })));

    const error = await dispatchOpenRouter("task", "model", { apiKey: "test" }).catch((value) => value);
    expect(error.message).toBe("OpenRouter returned HTTP 500.");
    expect(error.message).not.toContain("sensitive");
  });

  it("rejects an invalid provider shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ choices: [] })));

    await expect(dispatchOpenRouter("task", "model", { apiKey: "test" })).rejects.toThrow(
      "invalid response",
    );
  });
});

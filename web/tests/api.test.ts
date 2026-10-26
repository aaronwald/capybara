import { describe, expect, it } from "vitest";

import { assertSameOrigin, parseBody } from "../lib/api/http";
import {
  createCategorySchema,
  createTaskSchema,
  updatePromptSchema,
} from "../lib/api/validation";

describe("API request validation", () => {
  it("accepts a valid task", () => {
    const task = createTaskSchema.parse({
      title: "Research queues",
      categoryId: "c2fb985d-2f87-4dd7-9541-4b9886086d88",
      dueDate: "2026-10-30",
    });

    expect(task.description).toBe("");
  });

  it("rejects an empty patch", () => {
    expect(() => updatePromptSchema.parse({})).toThrow();
  });

  it("rejects a cross-origin mutation", () => {
    const request = new Request("https://capybara.varshtat.com/api/tasks", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });

    expect(() => assertSameOrigin(request)).toThrow("origin is not allowed");
  });

  it("accepts the public origin behind a TLS-terminating proxy", () => {
    const request = new Request("http://capybara:3000/api/tasks", {
      method: "POST",
      headers: {
        host: "capybara:3000",
        origin: "https://capybara.varshtat.com",
        "x-forwarded-host": "capybara.varshtat.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it("returns parsed JSON from a request", async () => {
    const request = new Request("https://capybara.varshtat.com/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Work" }),
    });

    await expect(parseBody(request, createCategorySchema)).resolves.toEqual({ name: "Work" });
  });
});

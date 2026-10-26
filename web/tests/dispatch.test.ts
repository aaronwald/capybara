import { describe, expect, it } from "vitest";

import { parseReturnData, wrapperPrompt } from "../lib/domain/dispatch";
import type { Task } from "../lib/domain/model";

const task: Task = {
  id: "task-1",
  title: "Fix the build",
  description: "Find the failing step.",
  categoryId: "general",
  dueDate: null,
  prompt: null,
  status: "draft",
  resultText: null,
  error: null,
};

describe("wrapperPrompt", () => {
  it("contains the task and return schema", () => {
    const prompt = wrapperPrompt(task, "investigate and repair");

    expect(prompt).toContain("Fix the build");
    expect(prompt).toContain('"follow_ups"');
    expect(prompt).toContain('"done"|"failed"');
  });
});

describe("parseReturnData", () => {
  it("parses a plain JSON reply", () => {
    const data = parseReturnData(
      '{"version":1,"status":"done","result_text":"fixed it","follow_ups":[{"title":"Write tests","prompt":"write tests"}]}',
    );

    expect(data.status).toBe("done");
    expect(data.follow_ups).toHaveLength(1);
    expect(data.follow_ups[0]?.title).toBe("Write tests");
  });

  it("parses a fenced JSON reply and supplies optional defaults", () => {
    const data = parseReturnData(
      '```json\n{"version":1,"status":"failed","result_text":"no access"}\n```',
    );

    expect(data.status).toBe("failed");
    expect(data.follow_ups).toEqual([]);
  });

  it("ignores unknown provider fields", () => {
    const data = parseReturnData(
      '{"status":"done","result_text":"ok","provider_meta":{"tokens":42}}',
    );

    expect(data.version).toBe(1);
    expect(data.status).toBe("done");
  });

  it("rejects an invalid status", () => {
    expect(() =>
      parseReturnData('{"version":1,"status":"maybe","result_text":"?"}'),
    ).toThrow("status must be done or failed");
  });

  it("rejects a non-JSON reply", () => {
    expect(() => parseReturnData("I could not do that, sorry.")).toThrow(
      "No JSON object found",
    );
  });

  it("rejects malformed JSON", () => {
    expect(() => parseReturnData('{"status":"done",}')).toThrow(
      "invalid JSON",
    );
  });
});

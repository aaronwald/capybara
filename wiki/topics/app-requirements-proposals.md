---
type: topic
sources: [requirements-app, wrapper-prompt, task, agent-harness, credential-management]
created: 2026-10-04
updated: 2026-10-04
---

# App requirements — proposed amendments

Draft amendments to [[requirements-app]] (2026-10-04): an answer to open question Q4 (return data format) and new requirements for three gaps (task CRUD, task states, failure handling). The specification text is in ASD-STE100 per [[asd-ste100]].

**Status update (2026-10-06): wald approved all items as the working spec** ("go, use defaults"). The accepted text is not yet copied into `raw/requirements-app.md` (the raw layer is human-owned); the build in [[mvp-implementation]] implements it.

## Q4 — return data format (proposal)

New requirements for section A4:

- A4.5 The wrapper prompt asks the agent to return data as JSON. The data obeys the return schema.
- A4.6 The return schema has these fields: `version`, `status`, `result_text`, `follow_ups`.
- A4.7 The `status` field has one of these values: `done`, `failed`.
- A4.8 Each item in `follow_ups` has these fields: `title`, `due_date`, `prompt`. The `due_date` field is optional.

Return schema:

```json
{
  "version": 1,
  "status": "done | failed",
  "result_text": "What the agent did. The app shows this text to the user.",
  "follow_ups": [
    { "title": "…", "due_date": "YYYY-MM-DD (optional)", "prompt": "…" }
  ]
}
```

Rationale: `status` drives the update of the sent task (A4.3); `follow_ups` drives the creation of follow-up tasks (A4.4); `version` lets the schema change later.

## Gap 1 — task and category CRUD (proposal)

A2 says the app shows tasks, but no requirement creates, edits, or deletes them. New requirements for section A2:

- A2.3 The user can add a task to a category.
- A2.4 The user can edit a task.
- A2.5 The user can delete a task.
- A2.6 The user can add, edit, and delete a category.

## Gap 2 — task states (proposal)

A4.3 says the returned data updates the task, but no requirement defines what an update can be. New requirements for section A2:

- A2.7 A task has a status. The status has one of these values: `draft`, `dispatched`, `done`, `failed`.
- A2.8 The app sets the status to `dispatched` when it sends the task out.
- A2.9 The app sets the status from the `status` field of the returned data.
- A2.10 A follow-up task goes into the category of the task that made it.
- A2.11 A follow-up task has no due date, unless the returned data has a `due_date` for it.

## Gap 3 — failure handling (proposal)

No requirement says what happens when dispatch fails. New requirements for a new section A7:

- A7.1 If the app cannot send the task, the app sets the task status to `failed`. The app records the error. The app does not delete the task.
- A7.2 If the returned data does not obey the return schema, the app treats the dispatch as failed.
- A7.3 The app shows the error to the user.

## Still open (not covered by this proposal)

Status 2026-10-06: credential mechanism on Android — resolved (see [[credential-management]]); target selection per dispatch — implemented; local persistence — implemented; follow-up `prompt` semantics — implemented as drafts with a stored prompt, no auto-dispatch. Still open: visibility of raw returns beyond `result_text`.

Per [[adversarial-review]], run a review of the accepted text before it goes into the raw layer.

## Related
- [[requirements-app]], [[wrapper-prompt]], [[task]], [[asd-ste100]], [[adversarial-review]], [[credential-management]], [[wald]]

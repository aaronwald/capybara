---
type: concept
sources: [requirements-app]
created: 2026-10-04
updated: 2026-10-04
---

# Task

The app's core object (A2 in [[requirements-app]]): a task lives in a category, can carry an optional due date, and can be sent to an [[agent-harness]] with a [[prompt]]. What the harness returns through the [[wrapper-prompt]] can update the task or create follow-up tasks. Amendments (CRUD for tasks and categories; statuses `draft`, `dispatched`, `done`, `failed`) were approved by wald 2026-10-06 and are implemented in [[mvp-implementation]] — see [[app-requirements-proposals]].

## Related
- [[prompt]], [[wrapper-prompt]], [[agent-harness]], [[requirements-app]], [[capybara]], [[app-requirements-proposals]]

---
type: concept
sources: [requirements-app, app-requirements-proposals]
created: 2026-10-04
updated: 2026-10-06
---

# Wrapper prompt

The dispatch envelope (A4 in [[requirements-app]]). When the app sends a [[task]] out, it wraps the task and the attached [[prompt]] in a wrapper prompt. The wrapper tells the agent at the [[agent-harness]] to return structured data. The returned data:

1. lets the app update the task that was sent, and
2. can tell the app to create follow-up [[task|tasks]].

Return format (resolved 2026-10-06, per [[app-requirements-proposals]] A4.5–A4.8): the wrapper prompt asks the agent to return JSON — `version`, `status` (`done`/`failed`), `result_text`, `follow_ups`. Implemented in [[mvp-implementation]].

## Related
- [[task]], [[prompt]], [[agent-harness]], [[requirements-app]], [[capybara]], [[app-requirements-proposals]]

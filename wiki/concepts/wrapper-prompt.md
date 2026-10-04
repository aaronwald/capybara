---
type: concept
sources: [requirements-app]
created: 2026-10-04
updated: 2026-10-04
---

# Wrapper prompt

The dispatch envelope (A4 in [[requirements-app]]). When the app sends a [[task]] out, it wraps the task and the attached [[prompt]] in a wrapper prompt. The wrapper tells the agent at the [[agent-harness]] to return structured data. The returned data:

1. lets the app update the task that was sent, and
2. can tell the app to create follow-up [[task|tasks]].

Open question from the source: the exact return format — a JSON schema is the leading option.

## Related
- [[task]], [[prompt]], [[agent-harness]], [[requirements-app]], [[capybara]]

---
type: source
source: raw/requirements-app.md
created: 2026-10-04
updated: 2026-10-04
---

# App requirements — Capybara (Android)

TL;DR: [[capybara]] is an Android [[task]] manager, tested in the [[android-simulator]]. Tasks live in categories with optional due dates. The user sends a task to an [[agent-harness]] with a custom or existing [[prompt]] from a managed prompt library. Dispatch goes through a [[wrapper-prompt]] that makes the agent return structured data — this data updates the task or spawns follow-ups. Targets: [[hermes]], [[openroute]], [[muse]].

## Key claims

- A1 The app runs on Android; testing uses the Android simulator.
- A2 The app shows tasks grouped by category; each task has an optional due date.
- A3 Dispatch uses a custom prompt or an existing prompt; the app manages the prompt library (add, edit, delete).
- A4 The app wraps task + prompt in a wrapper prompt; the agent returns structured data; the data updates the sent task or creates follow-up tasks.
- A5 Dispatch supports multiple targets: hermes, openroute, muse — different agents and harnesses.
- A6 The app obeys the credential rule R3 of [[requirements-repo-rules]].

## Open questions (from the source)

- Is openroute the same as OpenRouter (openrouter.ai)? — Resolved 2026-10-04 (wald): yes, OpenRouter (openrouter.ai).
- Which agent or harness is muse? — Resolved 2026-10-04 (wald): a Meta (Facebook) product; product details still to be gathered.
- Is hermes the Hermes Agent harness (a ponytail-supported host)? — Resolved 2026-10-04: yes, per [[ponytail]]'s host documentation.
- Which data format does the wrapper prompt return? — Open. A JSON schema is one option.

Tags: requirements, app, android, dispatch
## Related
- [[capybara]], [[task]], [[prompt]], [[wrapper-prompt]], [[agent-harness]], [[hermes]], [[openroute]], [[muse]], [[android-simulator]], [[requirements-repo-rules]]

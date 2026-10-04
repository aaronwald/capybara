---
type: entity
sources: [requirements-app, requirements-repo-rules]
created: 2026-10-04
updated: 2026-10-04
---

# Capybara (app)

The Android app this repository builds: a [[task]] manager that dispatches tasks to agent harnesses and files what they send back. Full requirements: [[requirements-app]]. The rules that govern its development: [[requirements-repo-rules]].

Shape (per [[requirements-app]]): tasks in categories with optional due dates, a managed [[prompt]] library, a [[wrapper-prompt]] round-trip that updates tasks and spawns follow-ups, and dispatch to [[hermes]], [[openroute]], and [[muse]]. Testing runs in the [[android-simulator]]. Before each release: an [[adversarial-review]] via [[ponytail]] with [[openai-astra]].

## Related
- [[requirements-app]], [[requirements-repo-rules]], [[task]], [[prompt]], [[wrapper-prompt]], [[agent-harness]], [[android-simulator]], [[adversarial-review]]

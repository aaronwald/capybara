---
type: concept
sources: [requirements-app]
created: 2026-10-04
updated: 2026-10-04
---

# Agent harness

An external agent system that [[capybara]] dispatches [[task|tasks]] to (A5 in [[requirements-app]]). The app must support more than one target. Known targets: [[hermes]], [[openroute]], [[muse]] — three different agents and harnesses. Dispatch goes through the [[wrapper-prompt]] envelope.

**Tension (noted 2026-10-04):** the requirements call all three targets "agents and harnesses", but [[openroute]] is OpenRouter, an LLM API gateway, not an agent harness. "Dispatch target" is the accurate frame; only [[hermes]] and [[muse]] are confirmed harnesses.

## Related
- [[hermes]], [[openroute]], [[muse]], [[wrapper-prompt]], [[task]], [[requirements-app]]

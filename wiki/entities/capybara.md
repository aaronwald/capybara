---
type: entity
sources: [requirements-app, requirements-repo-rules]
created: 2026-10-04
updated: 2026-10-26
---

# Capybara (app)

A [[task]] manager that dispatches tasks to agent harnesses and files what they send back. Full original requirements: [[requirements-app]]. The rules that govern its development: [[requirements-repo-rules]].

**Platform decision 2026-10-26 (wald):** the TypeScript web app replaces Android with no overlap. The final Android revision is preserved at git tag `android-final`; its history remains in [[mvp-implementation]]. The approved delivery sequence is in [[web-port-plan]]. The web foundation now exists in `web/`: Next.js 16.4.3, a responsive API-backed UI, ported domain/wrapper code, PostgreSQL CRUD, a durable dispatch worker, standalone container output, and 16 passing unit tests. The release workflow also gates image publication on PostgreSQL integration and Pixel 7 browser tests. Varlab deployment resources are rendered but inactive pending image publication and sealed secrets.

Shape (per [[requirements-app]]): tasks in categories with optional due dates, a managed [[prompt]] library, a [[wrapper-prompt]] round-trip that updates tasks and spawns follow-ups, and dispatch to [[hermes]], [[openroute]], and [[muse]]. Testing runs in the [[android-simulator]]. Before each release: an [[adversarial-review]] via [[ponytail]] with [[openai-sol]].

## Related
- [[requirements-app]], [[requirements-repo-rules]], [[task]], [[prompt]], [[wrapper-prompt]], [[agent-harness]], [[android-simulator]], [[adversarial-review]], [[web-port-homelab]], [[web-port-plan]], [[mvp-implementation]]

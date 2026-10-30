# Index

Catalog of every wiki page, grouped by category. Updated on every ingest, filed query, and lint pass. Read this first when answering questions.

## Sources (2)

- [[requirements-app]] — Android app requirements: categories, due dates, prompt library, wrapper dispatch, targets hermes/openroute/muse (2026-10-04)
- [[requirements-repo-rules]] — repository rules: ASD-STE100 specs, adversarial review via ponytail + openai/gpt-5.6-sol, never store keys (2026-10-04)

## Entities (9)

- [[capybara]] — TypeScript web task manager under construction; Android implementation retired to git tag `android-final` on 2026-10-26
- [[wald]] — repo owner; resolving authority for open questions
- [[hermes]] — agent harness; dispatch target; app dispatches via its local OpenAI-compatible proxy (port 8645); **backlogged** 2026-10-07 — openroute is the only active target until fully working
- [[muse]] — agent harness; dispatch target; **backlogged** 2026-10-07 — stub until the openroute path is fully working
- [[openai-sol]] — `openai/gpt-5.6-sol`; the review model for adversarial reviews
- [[openai-astra]] — superseded redirect → [[openai-sol]]; name expunged 2026-10-04
- [[openroute]] — dispatch target; OpenRouter (openrouter.ai), the LLM API gateway; **only active target** (live round trip verified 2026-10-07)
- [[ponytail]] — minimal-code skill; provides the review command
- [[pi]] — coding agent harness; hosts the wiki workflows and ponytail

## Concepts (8)

- [[agent-harness]] — external systems tasks dispatch to
- [[adversarial-review]] — pre-release quality gate
- [[android-simulator]] — the app's test environment
- [[asd-ste100]] — the specification language for this repo
- [[credential-management]] — no stored keys; SDK-managed credentials
- [[prompt]] — custom vs existing; managed prompt library
- [[task]] — core object: category, optional due date, dispatch
- [[wrapper-prompt]] — dispatch round-trip envelope



## Topics (5)

- [[repo-rules-implementation-status]] — gap analysis of the repository rules; review loop closed 2026-10-07: model-backed pass under openai/gpt-5.6-sol done, lean
- [[app-requirements-proposals]] — draft amendments to the app requirements: Q4 JSON return schema, task/category CRUD, task states, failure handling; **approved by wald 2026-10-06** (2026-10-04)
- [[web-port-homelab]] — assessment of the TypeScript web replacement hosted on varlab: server-side dispatch, storage, and teamwald-shaped deployment (2026-10-25)
- [[web-port-plan]] — active no-overlap implementation: TypeScript/Next.js + PostgreSQL worker + Authentik + varlab; 0.1.9 published after 0.1.0–0.1.8 CI gates stopped safely; Authentik provider created; ArgoCD activation pending diff review (updated 2026-10-27)
- [[mvp-implementation]] — first working build of the app: stack, verified flows, known ceilings; openroute round trip verified live 2026-10-07, failure handling + persistence verified; **physical-device test passed on a Pixel 6 2026-10-07 — MVP testing done**; openroute is the only active target, hermes/muse backlogged

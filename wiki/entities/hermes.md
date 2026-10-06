---
type: entity
sources: [requirements-app]
created: 2026-10-04
updated: 2026-10-06
---

# Hermes

One of the three [[agent-harness]] dispatch targets for [[capybara]] tasks (per [[requirements-app]]). Confirmed real as a ponytail-supported host: [[ponytail]] installs with `hermes plugins install DietrichGebert/ponytail --enable`, registers skills as `ponytail:<skill>`, and injects rules before each LLM turn.

**Dispatch mechanism for capybara (discovered 2026-10-06, from the local hermes CLI v0.19.0 help and installed source; no raw source ingested yet — wald can drop the hermes docs into `raw/` for formal ingestion):** hermes ships a local OpenAI-compatible HTTP proxy — `hermes proxy start`, default port 8645, forwards `POST /v1/chat/completions` to an OAuth-authenticated upstream (Nous Portal or xAI Grok; `hermes auth add nous`). External clients send any bearer token; hermes attaches the real credentials — so the app stores no hermes key (satisfies [[credential-management]]). The emulator reaches the host proxy at `http://10.0.2.2:8645/v1`. Implemented and verified in [[mvp-implementation]]; the live round trip waits on upstream login (both providers showed "not logged in" as of 2026-10-06).

## Related
- [[requirements-app]], [[ponytail]], [[agent-harness]], [[openroute]], [[muse]]

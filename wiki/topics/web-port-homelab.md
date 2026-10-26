---
type: topic
sources: [requirements-app, requirements-repo-rules]
created: 2026-10-25
updated: 2026-10-26
---

# Web port to varlab (homelab) — what it would take

Assessment (2026-10-25) of moving the [[capybara]] app from Android ([[mvp-implementation]]) to a web app hosted on the **varlab** homelab. Sources: the capybara wiki below; varlab facts are read directly from the `varlab` repo (K3s + Flux/ArgoCD GitOps, Traefik, cert-manager, Authentik, Longhorn, Prometheus/Loki) — **no varlab raw source is ingested here yet**; drop one into `raw/` for formal grounding.

## What exists today (capybara side)

- Single-user Android app, ~830 lines Kotlin, Jetpack Compose; three screens (tasks, prompt library, settings) per [[mvp-implementation]].
- [[task]]/category/prompt CRUD; [[wrapper-prompt]] round trip with JSON return schema; follow-ups created as drafts. Dispatch behind one `OpenAiCompatibleDispatcher` covering [[openroute]] (active) and [[hermes]] (backlogged); [[muse]] stub.
- Persistence: the whole state is one JSON file (`files/state.json`); credentials in Keystore-backed EncryptedSharedPreferences per [[credential-management]].
- Requirements pin the platform to Android (A1.1) — **a web port is a requirements amendment**, not just code: it needs a change to `raw/requirements-app.md`-level intent, wald approval, and an [[adversarial-review]] before release, per [[requirements-repo-rules]].

## What transfers 1:1

- Domain model and wire logic are pure and tiny: `Model.kt`, `wrapperPrompt()`, `parseReturnData()` port straight to TypeScript; the existing JVM unit tests (`DispatchTest`) define the contract to re-implement.
- Status flow `draft → dispatched → done/failed` already models long-running dispatch — the web UI polls instead of awaiting one coroutine.

## What must be re-built

1. **Server + API.** The Android app is UI, store, and dispatcher in one process. On the web, dispatch must move **server-side**: API keys (OpenRouter) become Kubernetes secrets and never reach the browser — strictly stronger than A6/[[credential-management]]. In-cluster the server also reaches the [[hermes]] proxy over LAN/cluster DNS — no `10.0.2.2` emulator alias, no phone cleartext-config change.
2. **Storage.** `state.json` on a Longhorn PVC works only with `replicaCount: 1` (the teamwald chart defaults to 2 — a shared JSON file with two writers corrupts). Either run one replica (fine for a single user) or move to SQLite/Postgres. This is a decision, not a port.
3. **Async dispatch.** Agent calls take seconds to minutes; a plain HTTP await will time out behind Traefik. Cheapest: set `dispatched`, run the call in a worker (varlab already has a `nats-streams` chart if a queue is wanted), poll from the UI. The status model already supports this.
4. **Frontend.** Rewrite the three Compose screens in Next.js — the existing house pattern (`apps/teamwald`, `apps/ssmd-admin`, shadcn/ui components on hand). The 526-line Compose UI maps to a few components.
5. **Auth.** Single-user household: put the app behind the existing Authentik `forwardauth` middleware (as `charts/teamwald/values.yaml` does) instead of building a user system. The dispatch endpoint must sit behind it — it spends API keys.

## Deployment recipe (copy the teamwald pattern)

- `apps/capybara/` — Next.js app + multi-stage Dockerfile (teamwald's is a known-good template); GHCR image, `ghcr-secret` pull.
- `charts/capybara/` — clone `charts/teamwald` (deployment/service/ingress: Traefik, `letsencrypt-production`, Authentik middleware, host `capybara.varshtat.com`); external-dns + Pi-hole picks up the record; cert-manager issues TLS.
- CI renders helm → `rendered/capybara` → `argocd/apps/capybara.yaml` Application (repoURL varlab, automated sync). Pinned image tag per value; bump-tag-commit is the deploy loop.
- Longhorn PVC (or Postgres) for state; Velero schedules already cover backups; ServiceMonitor + Loki logs + ntfy alerts are already wired.

## Effort and open decisions

Hosting is the easy part — the chart/CI/ArgoCD plumbing is copy-paste from teamwald (~a day). The real work is the port itself: domain + wrapper + parse ≈ a couple hundred lines of TypeScript with tests; UI parity a few evenings. A working MVP behind Authentik is a weekend.

**Decision 2026-10-26 (wald):** web replaces Android with no overlap. The active branch removes Android before web implementation. The final Android revision remains at git tag `android-final`. [[web-port-plan]] selects Next.js with TypeScript, PostgreSQL, a separate dispatch worker, Authentik, and OpenRouter-only dispatch for the first release. Serving the wiki itself remains a separate, unscoped question.

## Related
- [[capybara]], [[requirements-app]], [[requirements-repo-rules]], [[mvp-implementation]], [[web-port-plan]], [[wrapper-prompt]], [[credential-management]], [[openroute]], [[hermes]], [[agent-harness]], [[adversarial-review]]
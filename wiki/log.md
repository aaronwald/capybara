# Log

Append-only record of wiki operations. Entries start with `## [2026-10-04] <ingest|query|lint|init> | <title>` so simple tools work over the timeline, e.g.:

    grep "^## \[" wiki/log.md | tail -5

## [2026-10-04] init | wiki bootstrapped
- Created layout per AGENTS.md: `raw/`, `raw/assets/`, `wiki/{sources,entities,concepts,topics}/`
- Created `wiki/index.md` and `wiki/log.md`
## [2026-10-04] init | qmd search enabled
- Installed qmd 2.8.3, project-local index in `.qmd/` (gitignored), collections: `wiki`, `raw` (+ context labels)
- Pulled local models: embeddinggemma-300M (embed), qmd-query-expansion-1.7B (expand), Qwen3-reranker-0.6B (rerank) — ~2.1G in `~/.cache/qmd/`
- Embedded existing docs; hybrid `qmd query` verified end-to-end (expansion → vector+BM25 → rerank)
## [2026-10-04] ingest | Requirements — repository rules
- `raw/requirements-repo-rules.md` → [[requirements-repo-rules]]
- Created: entities [[ponytail]], [[openai-astra]]; concepts [[asd-ste100]], [[adversarial-review]], [[credential-management]]
## [2026-10-04] ingest | App requirements — Capybara (Android)
- `raw/requirements-app.md` → [[requirements-app]]
- Created: entities [[capybara]], [[hermes]], [[openroute]], [[muse]]; concepts [[task]], [[prompt]], [[wrapper-prompt]], [[agent-harness]], [[android-simulator]]
- Cross-linked both sources; 16 wiki pages now exist
## [2026-10-04] init | schema scope set
- Updated the `Scope:` line in `AGENTS.md` to the capybara app (Android task dispatcher)
## [2026-10-04] init | schema: ASD-STE100 binding
- Added "Specification language" section and rule 5 to `AGENTS.md`: all specifications (raw, wiki, LLM-drafted) in ASD-STE100 per R1
- Updated [[asd-ste100]] to record the schema-level binding
## [2026-10-04] lint | first health pass — 6 findings, 0 fixes yet (proposed, pending approval)
- Clean: index synced (16/16 pages, counts match), raw fully ingested (2/2), no orphans, no broken wikilinks
- Stale: 3 index descriptions still say "identity open" for [[muse]], [[openai-astra]], [[openroute]] though all resolved; qmd embeddings stale (12 orphaned chunks, 10 hashes need vectors)
- Missing: no pages for [[pi]] (3 mentions) or [[wald]] (5 mentions); [[capybara]] not wikilinked on first mention in 7 pages
- Tension: [[agent-harness]] frames all 3 targets as harnesses, but [[openroute]] = OpenRouter is an API gateway
## [2026-10-04] query | Repo rules — implementation status
- Created topic [[repo-rules-implementation-status]]: per-rule gap analysis; single open item = configure `openai/gpt-5.6-sol` as review model (verify, scope, dry-run `/ponytail-review`)
- Updated: wiki/index.md
## [2026-10-04] query | Astra expunged — review model is openai/gpt-5.6-sol
- Created entity [[openai-sol]] (`openai/gpt-5.6-sol`); superseded [[openai-astra]] to a redirect stub (page kept per rule 2, never deleted)
- Updated live pages to cite [[openai-sol]]: [[requirements-repo-rules]] (R2.3 correction noted), [[adversarial-review]], [[capybara]], [[ponytail]], [[repo-rules-implementation-status]], wiki/index.md
- Raw source untouched (immutable); it still says "Astra", the wiki records the correction
## [2026-10-04] lint | second pass — fixes applied (findings from first pass)
- Created entities [[wald]], [[pi]]
- Added [[capybara]] wikilinks at first mention: [[requirements-app]], [[requirements-repo-rules]], [[ponytail]], [[hermes]], [[openroute]], [[muse]], [[openai-sol]], [[agent-harness]], [[android-simulator]], [[asd-ste100]]
- Resolved agent-harness/openroute tension: recorded on both pages — openroute is an API gateway, "dispatch target" is the accurate frame
- Added [[pi]] links at first mention in [[requirements-repo-rules]], [[ponytail]]
- wiki/index.md synced (18 pages + 1 superseded stub)
- Fixed 2 stale index descriptions ([[muse]], [[openroute]]) missed in the previous pass
- Verified: no broken wikilinks, 20/20 pages indexed, all raw sources ingested; remaining "Astra" mentions are intentional (naming history on [[openai-sol]], redirect stub)
## [2026-10-04] query | Scoped models configured for reviews
- Created `.pi/settings.json` with `enabledModels`: `~z-ai/glm-latest` (default) + `openai/gpt-5.6-sol` ([[openai-sol]]) — Ctrl+P cycles between them
- [[repo-rules-implementation-status]] open item step 2 of 3 done: verify ✅, scope ✅, dry-run review ⬜
## [2026-10-04] query | App requirements — proposed amendments
- Created topic [[app-requirements-proposals]]: Q4 answer (JSON return schema, A4.5–A4.8) + new requirements for task/category CRUD (A2.3–A2.6), task states (A2.7–A2.11), failure handling (A7.1–A7.3); ASD-STE100, all pending wald's approval
- Updated [[wrapper-prompt]] (Q4 has a proposed schema) and [[task]] (proposed CRUD + statuses)
- Still open: Android credential mechanism, target selection, raw-return visibility, persistence, follow-up auto-dispatch semantics
## [2026-10-06] build | MVP build of the capybara app
- wald approved [[app-requirements-proposals]] as working spec ("go, use defaults"); recorded on that page — raw/ untouched (human-owned)
- Shipped first build in `app/`: Compose app with task/category CRUD + states, prompt library, wrapper-prompt JSON round trip, dispatch to openroute (hermes/muse stubs), Keystore-backed credentials; 5 unit tests green, verified in emulator AVD `capybara`
- Created topic [[mvp-implementation]]; updated [[capybara]], [[task]], [[wrapper-prompt]], [[credential-management]] (Android mechanism resolved), wiki/index.md
- Toolchain: JDK via mise, Gradle 9.6 wrapper, AGP 9.4.1 (built-in Kotlin), compileSdk 37; Android SDK at ~/android-sdk
## [2026-10-06] review | Adversarial review dry run — R2 gate on the MVP diff
- Ran /ponytail-review per [[adversarial-review]] before the first release; findings recorded there: 4 cuts applied (−29 lines), okhttp kept for hermes/muse (ceiling noted)
- Updated [[repo-rules-implementation-status]]: step 3 done as dry run; model-backed pass under openai/gpt-5.6-sol still pending wald
- Rebuilt, 5/5 tests green, smoke-tested in emulator; committed as c045338
## [2026-10-06] build | Hermes target wired — dispatch via local OpenAI-compatible proxy
- Discovered the hermes dispatch mechanism (local `hermes proxy start`, port 8645, /v1/chat/completions, any bearer token, upstream credentials held by hermes — no key in app, satisfies R3); recorded on [[hermes]]
- Generalized dispatch to OpenAiCompatibleDispatcher: openroute + hermes real, muse stub; Settings gained Hermes proxy URL + model fields; cleartext HTTP limited to 10.0.2.2 via network security config
- Verified full hermes round trip in emulator against a wire-shape mock on 8645: task done + follow-up draft with due date and prompt (A2.7–A2.11); live round trip waits on `hermes auth add nous`
- Updated [[mvp-implementation]], [[app-requirements-proposals]] (open items list), wiki/index.md

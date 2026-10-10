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
## [2026-10-06] query | Muse backlogged
- wald: no muse work until openroute and hermes are verified live; recorded on [[muse]], index.md updated
## [2026-10-07] review | Model-backed /ponytail-review — R2 gate pass
- wald switched the session to openai/gpt-5.6-sol and ran /ponytail-review over the full app codebase: lean, 2 findings (Dispatch.kt byName dead fallback, Model.kt encodeDefaults), net −2 lines, not yet applied
- Closed the open work item in [[repo-rules-implementation-status]]; recorded the pass on [[adversarial-review]]; index.md updated
## [2026-10-07] review | Review cuts applied
- Applied the 2 findings from the model-backed pass (byName dead fallback, encodeDefaults); 5/5 tests green, APK rebuilt; committed b731433; [[adversarial-review]] updated
## [2026-10-07] test | OpenRouter live round trip verified
- wald supplied the OpenRouter key (in /tmp, loaded into the app via Settings on the emulator); held in Keystore-backed storage per A6, never written to the repo
- Live dispatch to openai/gpt-5.6-sol: task done with result_text, one follow-up created as draft with due date (A2.7–A2.11); UI-verified in emulator
- Updated [[mvp-implementation]], [[openroute]], index.md. Remaining live target: hermes (waits on `hermes auth add nous`)
## [2026-10-07] query | Hermes live testing backlogged
- wald: hermes live round trip moves to a future phase; wiring stays mock-verified. Recorded on [[hermes]], [[mvp-implementation]], index.md
- With [[muse]] already backlogged, openroute (verified live 2026-10-07) is the only active dispatch target for now
## [2026-10-07] test | Failure handling + persistence verified
- Wire-shape mock on 8645 (four modes: 500, garbage body, prose content, bad status) — every failure path set the task to failed with the error recorded in state.json and shown in the UI (A7.1–A7.3); mock scripts live in /tmp, not the repo
- Persistence: force-stop + cold restart keeps all tasks and statuses (files/state.json round trip)
- Updated [[mvp-implementation]], index.md; all planned emulator-verifiable tests now done

## [2026-10-07] query | Openroute-only path confirmed — hermes/muse backlogged, device test scoped
- wald: proceed with openroute as the only active target; hermes/muse stay backlogged until the openroute path is fully working
- On-device testing follows the split: openroute needs no code change (debug APK + key in Settings); hermes on-device needs the LAN URL + cleartext-config change, backlogged with it; no physical device attached yet
- Updated [[hermes]], [[muse]], [[mvp-implementation]], wiki/index.md
- Next step set (wald): physical-device test via openroute only, picked up in the next session

## [2026-10-07] test | Physical-device test passed — MVP testing done
- Pixel 6 (oriole) via adb: `./gradlew installDebug` + launch + openroute round trip on-device; unit tests green; wald marks MVP testing done
- UI shipped during the session: extended FABs with icons (`material-icons-core` added), live OpenRouter model dropdown (`/api/v1/models`, text-field fallback), default research prompt pre-filled on new tasks, "Hide done" filter chip
- Updated [[mvp-implementation]], wiki/index.md; committed with the matching code changes

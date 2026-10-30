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

## [2026-10-25] query | Web port to varlab (homelab) assessed
- Created topics/web-port-homelab.md: hosting is copy-paste from the teamwald pattern (chart + rendered + ArgoCD); real work is server-side dispatch, storage (1 replica + SQLite vs Postgres), async dispatch, Next.js UI rewrite
- varlab facts (K3s/Flux/ArgoCD, Traefik, cert-manager, Authentik, Longhorn, Velero) read directly from the varlab repo — no raw source ingested yet; drop one into raw/ for formal grounding
- Open decisions for wald: amend A1.1 (web alongside/instead of Android), replace vs complement phone app, storage choice
- Updated wiki/index.md, [[capybara]], [[mvp-implementation]] Related links

## [2026-10-25] query | Sol model check for dispatch
- Checked OpenRouter /api/v1/models: no "5.66" exists; sol family = gpt-5.6-sol(-pro), gpt-6-sol(-pro), gpt-6.1-sol(-pro), all 1.05M ctx, 6.x at half the 5.6 pricing
- Dispatch default in the app stays openai/gpt-5.6-sol per [[openai-sol]]; trivial lookup, no page changes

## [2026-10-26] query | Web-only port plan approved — no Android overlap
- Wald chose the TypeScript web app as the only supported platform; no dual-client period or synchronization
- Created [[web-port-plan]] with Next.js, PostgreSQL durable jobs, Authentik, OpenRouter-only first release, and varlab deployment phases
- Updated [[web-port-homelab]], [[capybara]], [[mvp-implementation]], and wiki/index.md

## [2026-10-26] implementation | TypeScript web replacement started
- Tagged the final Android commit as `android-final`; removed Android and Gradle files from the active tree before web work
- Added `web/`: Next.js 16.4.3 + TypeScript, responsive modern desktop/mobile UI preview, ported domain/wrapper/parser code
- Added PostgreSQL schema + tracked migration runner; category/prompt/task CRUD API; durable dispatch route and worker; server-only OpenRouter adapter; health/model routes
- Verification: 14 Vitest tests, ESLint, TypeScript check, and production build pass; npm audit reports zero findings
- PostgreSQL integration, live OpenRouter dispatch, UI-to-API wiring, Docker, and varlab deployment remain

## [2026-10-26] implementation | Web UI wired and varlab deployment staged
- Replaced typed preview data with live task/category/prompt CRUD, search/filtering, model selection, dispatch, polling, result/error display, and responsive forms
- Added standalone Docker output plus compiled migration/worker entry points and a GHCR image workflow; test/lint/typecheck/build pass, npm audit clean
- Added a varlab Helm chart for web + worker + PostgreSQL 17 + Traefik/Authentik ingress; Helm 3.16.3 checksum verified, chart linted, and 300-line manifest rendered
- Added the ArgoCD Application under `argocd/drafts`, not `argocd/apps`; no cluster resources were applied. Activation waits on image publication and SealedSecrets
- Updated [[web-port-plan]], [[capybara]], wiki/index.md, and both repositories' implementation notes

## [2026-10-26] review | TypeScript web release adversarial gate passed
- Installed ponytail project-locally and ran six reviews with `openai/gpt-5.6-sol` across capybara and the varlab deployment
- Fixed worker packaging, retries/recovery/fencing, delete race, forwarded Origin, mobile CRUD, safe errors, least-privilege database roles, secret exclusion, GCS logical backup, NetworkPolicy scope, and Argo deletion guards
- Final verdict: "Looks good. Ship." Unit tests: 16; lint/typecheck/build/audit and Helm lint/render pass
- Live PostgreSQL/browser workflow, image, Authentik, dispatch, policy, backup, and restore remain explicit activation gates
- Updated [[adversarial-review]], [[web-port-plan]], [[capybara]], and wiki/index.md

## [2026-10-26] test | 0.1.0 release gate blocked clean-checkout typecheck
- GitHub run 40355673639 stopped before migration, browser tests, or image publication because Next.js generated `LayoutProps`/`RouteContext` types did not exist on a clean checkout
- Fixed `npm run typecheck` to run `next typegen` first; verified after deleting `.next`
- Bumped the release and varlab image target to 0.1.1; no 0.1.0 image was published
- Updated [[web-port-plan]], wiki/index.md, and the varlab implementation note

## [2026-10-26] test | 0.1.1 release gate blocked migration executable
- GitHub run 40356043025 passed clean-checkout unit checks, then stopped before data changes or image publication because `tsx` compiled top-level await as CommonJS
- Wrapped migration and worker executables in async `main()` functions; smoke test reaches database connection without a transform error
- Bumped the release and varlab target to 0.1.2; updated [[web-port-plan]] and wiki/index.md

## [2026-10-26] test | 0.1.2 release gate blocked worker test alias
- GitHub run 40356402931 passed unit checks and all database migrations, then stopped before integration execution or image publication because standalone Vitest did not resolve worker `@/` imports
- Replaced worker executable aliases with relative imports; an isolated integration load now reaches the database connection
- Bumped the release and varlab target to 0.1.3; updated [[web-port-plan]] and wiki/index.md

## [2026-10-26] test | 0.1.3 release gate exposed PostgreSQL worker bugs
- GitHub run 40356712833 passed unit checks and migrations, then PostgreSQL integration found stale recovery was invisible inside one data-changing CTE and a retry parameter had conflicting enum/text inference
- Split stale recovery and claim into one transaction; used explicit job-status typing and a separate retry boolean; corrected a date assertion
- No image was published. Bumped the release and varlab target to 0.1.4; updated [[web-port-plan]] and wiki/index.md

## [2026-10-26] test | 0.1.4 passed PostgreSQL integration; browser gate caught hydration
- GitHub run 40357085572 passed units, three migrations, and all PostgreSQL worker integration tests, then the Pixel 7 test found Next dev HMR blocked its own 127.0.0.1 origin so UI hydration did not complete
- Changed Playwright to build and run the production server; made the mobile Categories selector exact
- No image was published. Bumped the release and varlab target to 0.1.5; updated [[web-port-plan]] and wiki/index.md

## [2026-10-26] test | 0.1.5 passed PostgreSQL; mobile gate found ambiguous assertion
- GitHub run 40357591789 passed units, migrations, and PostgreSQL integration; the mobile browser created a category successfully, then strict mode found that its name appeared in both modal and tab
- Scoped category actions/assertions to the Categories dialog and switched Playwright to the standalone production server
- No image was published. Bumped the release and varlab target to 0.1.6; updated [[web-port-plan]] and wiki/index.md

## [2026-10-26] test | 0.1.6 browser gate found mobile New selector ambiguity
- GitHub run 40359789150 passed units, migrations, PostgreSQL integration, and category CRUD in the production browser; strict mode then matched both New task and mobile New
- Scoped New to `.mobile-nav`; no image was published. Bumped release and varlab target to 0.1.7
- Updated [[web-port-plan]] and wiki/index.md

## [2026-10-26] test | 0.1.7 browser gate found Category selector ambiguity
- GitHub run 40360242536 passed units, migrations, PostgreSQL integration, category creation, and task-form opening; strict mode then matched the page category group and form field
- Scoped new/edit task interactions to their dialogs; no image was published. Bumped release and varlab target to 0.1.8
- Updated [[web-port-plan]] and wiki/index.md

## [2026-10-26] test | 0.1.8 browser gate exposed Category select label shape
- GitHub run 40362577184 passed units, migrations, PostgreSQL integration, category CRUD, and task title input; the wrapped select label included option text and exact lookup timed out
- Added an explicit accessible Category label and targeted the dialog select; no image was published. Bumped release and varlab target to 0.1.9
- Updated [[web-port-plan]] and wiki/index.md

## [2026-10-27] test | 0.1.9 passed release gate and published image
- GitHub run 40365345682 passed units, migrations, PostgreSQL dispatch flow, and mobile CRUD; pushed `ghcr.io/aaronwald/capybara:0.1.9`
- Checked varlab: chart targets 0.1.9, render workflow 40365317508 passed, both SealedSecrets are excluded from backup
- Created Authentik `capybara-proxy` (forward_single, `https://capybara.varshtat.com`, TeamWald flows) and `Capybara` application on the embedded outpost; verified in blueprint export. ArgoCD activation remains
- Updated [[web-port-plan]] and wiki/index.md

---
type: topic
sources: [requirements-app, app-requirements-proposals, credential-management, agent-harness]
created: 2026-10-06
updated: 2026-10-06
---

# MVP implementation — capybara app

First working build of [[capybara]] (2026-10-06), shipped in `app/` at the repo root. wald approved the [[app-requirements-proposals]] as the working spec the same day ("go, use defaults").

## What shipped

- Single-activity Jetpack Compose app (`dev.wald.capybara`), three screens: tasks, prompt library, settings.
- Tasks grouped by category with optional due dates; task/category CRUD (A2.3–A2.6); task states `draft`/`dispatched`/`done`/`failed` (A2.7–A2.11).
- [[prompt]] library CRUD (A3); each dispatch uses a custom prompt or a saved one.
- [[wrapper-prompt]] envelope with the JSON return schema (A4.5–A4.8); parses plain and fenced JSON; a reply that breaks the schema counts as failure (A7.2).
- Dispatch behind one `OpenAiCompatibleDispatcher` (A5): [[openroute]] fully wired (OpenRouter chat completions; model configurable in settings, default `openai/gpt-5.6-sol` per [[openai-sol]]); [[hermes]] fully wired to the local `hermes proxy start` OpenAI-compatible endpoint (default `http://10.0.2.2:8645/v1` from the emulator; any bearer token — credentials live in hermes, not the app); [[muse]] is a selectable stub until its endpoint is known (backlogged 2026-10-06 — no work until hermes/openroute are verified live).
- Failure handling (A7.1–A7.3): a failed dispatch sets the task to `failed`, records the error on the task, and shows it to the user.
- Credentials: the OpenRouter key is pasted in Settings and held in Android Keystore-backed EncryptedSharedPreferences — this resolves the open Android credential question; see [[credential-management]].
- Persistence: the whole app state is one JSON file (`files/state.json`) — `ponytail:` minimalism, Room deferred until queries outgrow a linear scan.
- Toolchain: JDK via mise, Gradle 9.6 wrapper, AGP 9.4.1 (built-in Kotlin), compileSdk 37; [[android-simulator]] AVD `capybara` (API 36 system image, pixel_7 profile) for testing per A1.2.
- Tests: 5 JVM unit tests for the wrapper prompt and return-data parse (`app/src/test/.../DispatchTest.kt`).

## Verified in the emulator (2026-10-06)

Task list by category; task create/edit; dispatch to the hermes stub (status `failed`, error recorded and shown); prompt add; saved prompt selectable in the dispatch dropdown. Later the same day: **full hermes round trip verified against a local mock of the proxy's wire shape** on port 8645 — task went `done` with result text, one follow-up created as a draft in the parent's category with its due date and prompt (A2.10/A2.11). The live round trip through the real proxy waits on `hermes auth add nous` (both upstreams showed "not logged in").

2026-10-07: **OpenRouter round trip verified live** — wald supplied the key (loaded into Settings via the emulator; held in Keystore storage per A6, never in the repo), dispatch to `openai/gpt-5.6-sol` returned `done` with result text, and one follow-up was created as a draft with its due date (A2.7–A2.11). Verified in the UI: parent task `done` + result, follow-up `draft` with due 2026-10-14.

## Deliberately skipped (ponytail: ceilings named)

- No Room, no ViewModel/DI, no navigation library — revisit if state grows.
- Follow-ups are created as drafts; the app never auto-dispatches them (open question in [[app-requirements-proposals]]).
- The raw agent reply is not shown beyond `result_text`.
- No release signing or minification; debug APK only.
- [[hermes]]/[[muse]] endpoints: hermes is wired (see [[hermes]]); [[muse]] product details still to be gathered.
- Cleartext HTTP is permitted only to `10.0.2.2` (the emulator's host alias) via a network security config; everything else stays https-only.
- The hermes proxy URL default assumes the emulator; a real phone needs a LAN URL in Settings.

## Related
- [[capybara]], [[requirements-app]], [[app-requirements-proposals]], [[wrapper-prompt]], [[prompt]], [[task]], [[credential-management]], [[android-simulator]], [[openroute]], [[hermes]], [[muse]], [[openai-sol]], [[ponytail]]
---
type: concept
sources: [requirements-repo-rules, app-requirements-proposals]
created: 2026-10-04
updated: 2026-10-07
---

# Adversarial review

The pre-release quality gate (R2 in [[requirements-repo-rules]]): before each release, review the current diff adversarially — hunt for over-engineering. No release skips it.

Tooling: the [[ponytail]] skill's `/ponytail-review` command, which hands back a delete-list. Review model: `openai/gpt-5.6-sol` — see [[openai-sol]] (confirmed 2026-10-04; the "Astra" name from the requirements is expunged).

**First dry run (2026-10-06):** ran against the MVP diff before the first release ([[mvp-implementation]]). Findings: 4 cuts applied (dispatch() re-signatured to 3 params, merged duplicate store lookups, Store commit() refactor, dead NameDialog param) for −29 lines; okhttp kept for the coming hermes/muse endpoints (swap ceiling noted). The dry run used the session's default model; a pass under `openai/gpt-5.6-sol` (Ctrl+P in pi) is still the model-backed confirmation.

**Model-backed pass (2026-10-07):** wald switched the session to `openai/gpt-5.6-sol` via openrouter and ran `/ponytail-review` over the full `app/` codebase. Findings: 2 — dead fallback in `Targets.byName` (Dispatch.kt) and the unnecessary `encodeDefaults = true` in the shared Json config (Model.kt), net −2 lines. Applied 2026-10-07 (commit b731433); 5/5 tests green, debug APK rebuilt. Verdict: lean, gate passed. This closes the open work item in [[repo-rules-implementation-status]].

## Related
- [[ponytail]], [[openai-sol]], [[requirements-repo-rules]], [[capybara]]

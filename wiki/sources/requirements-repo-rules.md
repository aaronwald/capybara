---
type: source
source: raw/requirements-repo-rules.md
created: 2026-10-04
updated: 2026-10-04
---

# Requirements — repository rules

TL;DR: three binding rules for all [[capybara]] work: (R1) write specifications in [[asd-ste100]] Simplified Technical English; (R2) always run an [[adversarial-review]] before release, using the [[ponytail]] skill with [[openai-sol]] (`openai/gpt-5.6-sol`) as the review model; (R3) never store keys or passwords — manage them with the latest SDKs ([[credential-management]]).

## Key claims

- R1 All specifications use ASD-STE100 Simplified Technical English: short sentences, active voice, one instruction per sentence.
- R2.1 An adversarial review runs before each release. No release skips it.
- R2.2 The review uses the ponytail skill: `pi install git:github.com/DietrichGebert/ponytail` in [[pi]], review command `/ponytail-review` (reviews the current diff for over-engineering, returns a delete-list).
- R2.3 The review model is OpenAI Astra. — **Corrected 2026-10-04 (wald): the "Astra" name is expunged; the review model is `openai/gpt-5.6-sol` ([[openai-sol]]).**
- R3.1 Never store keys or passwords — not in the repository, code, or configuration files.
- R3.2 Always use the latest SDKs to manage keys and passwords.

## Open questions (from the source)

- OpenAI Astra: which product is "Astra"? — Resolved and renamed 2026-10-04 (wald): the name is dropped; reviews use the model `openai/gpt-5.6-sol` — see [[openai-sol]].

Tags: requirements, rules, release, review, security
## Related
- [[requirements-app]], [[asd-ste100]], [[adversarial-review]], [[ponytail]], [[openai-sol]], [[credential-management]], [[repo-rules-implementation-status]]

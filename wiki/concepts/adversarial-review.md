---
type: concept
sources: [requirements-repo-rules]
created: 2026-10-04
updated: 2026-10-04
---

# Adversarial review

The pre-release quality gate (R2 in [[requirements-repo-rules]]): before each release, review the current diff adversarially — hunt for over-engineering. No release skips it.

Tooling: the [[ponytail]] skill's `/ponytail-review` command, which hands back a delete-list. Review model: `openai/gpt-5.6-sol` — see [[openai-sol]] (confirmed 2026-10-04; the "Astra" name from the requirements is expunged).

## Related
- [[ponytail]], [[openai-sol]], [[requirements-repo-rules]], [[capybara]]

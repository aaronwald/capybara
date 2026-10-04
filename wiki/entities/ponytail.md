---
type: entity
sources: [requirements-repo-rules]
created: 2026-10-04
updated: 2026-10-04
---

# Ponytail

Project by DietrichGebert: <https://github.com/DietrichGebert/ponytail>. A "lazy senior dev" skill for coding agents — it forces the minimum solution the task actually needs, via a decision ladder (does this need to exist? → reuse existing → stdlib → native platform feature → installed dependency → one line → only then the minimum that works). It never cuts validation, security, error handling, or accessibility. Benchmarks report ~54% less code, ~20% cheaper, ~27% faster, 100% safe vs a no-skill baseline.

For capybara, [[adversarial-review]] gates before each release use ponytail's review skill: `/ponytail-review` reviews the current diff for over-engineering and hands back a delete-list. Install in pi: `pi install git:github.com/DietrichGebert/ponytail`.

Ponytail also documents [[hermes]] as a supported host (`hermes plugins install DietrichGebert/ponytail --enable`). First mentioned in [[requirements-repo-rules]].

Installed into pi on 2026-10-04 (`pi install git:github.com/DietrichGebert/ponytail`, v4.10.3, user-level): bundles six skills — `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help` — plus a pi extension. A `/reload` activates them in a running session.

## Related
- [[adversarial-review]], [[requirements-repo-rules]], [[hermes]], [[openai-astra]]

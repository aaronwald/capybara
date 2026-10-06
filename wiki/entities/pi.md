---
type: entity
sources: [requirements-repo-rules, ponytail]
created: 2026-10-04
updated: 2026-10-04
---

# Pi

The coding agent that maintains this wiki: the CLI harness this repository's llm-wiki workflows run in (skills, read/bash/edit/write tools, sessions). [[ponytail]] installs into pi with `pi install git:github.com/DietrichGebert/ponytail`, and pre-release [[adversarial-review]] gates (R2.2 in [[requirements-repo-rules]]) run its `/ponytail-review` command. The review model for those gates is [[openai-sol]].

## Related
- [[ponytail]], [[requirements-repo-rules]], [[adversarial-review]], [[openai-sol]], [[capybara]]

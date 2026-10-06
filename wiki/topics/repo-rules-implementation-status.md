---
type: topic
sources: [requirements-repo-rules, adversarial-review, credential-management, openai-sol]
created: 2026-10-04
updated: 2026-10-04
---

# Repo rules — implementation status

Gap analysis (2026-10-04): what work the repository rules require vs. what is set up. The rules in [[requirements-repo-rules]] are process rules, not product features; only one setup item is outstanding.

## Status per rule

- **R1 (ASD-STE100 specs):** no work. Discipline at write time; the binding already lives in `AGENTS.md` (per [[asd-ste100]]).
- **R2.1 (adversarial review before each release):** no work yet. The gate applies at release time; no release exists so far (per [[adversarial-review]]).
- **R2.2 (ponytail skill):** done. Installed and active; review command `/ponytail-review` (per [[ponytail]]).
- **R2.3 (review model):** **not set up** — the only actionable work item (see below).
- **R3 (no stored keys):** no work, but it constrains R2.3: credentials go through the agent SDK (`/login`), never into the repository (per [[credential-management]]).

## Open work item: configure the review model

The current agent session runs `z-ai/glm-latest` via openrouter; the review model `openai/gpt-5.6-sol` ([[openai-sol]]) is not configured and no `models.json` exists. Steps:

1. Verify `openai/gpt-5.6-sol` exists on the provider. — done 2026-10-04 (in the openrouter catalog)
2. Make it available for reviews: scoped model list or a `models.json` entry. — done 2026-10-04 (`.pi/settings.json` `enabledModels`, Ctrl+P cycle)
3. Run one dry-run `/ponytail-review` with it before the first real release to confirm the review loop works end-to-end.

## Related

- [[requirements-repo-rules]], [[adversarial-review]], [[ponytail]], [[openai-sol]], [[credential-management]], [[asd-ste100]]

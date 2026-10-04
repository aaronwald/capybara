---
name: wiki-lint
description: Health-check the llm-wiki - contradictions between pages, stale claims superseded by newer sources, orphan pages, missing entity and concept pages, broken cross-references, and raw sources that were never ingested. Use when asked to lint, audit, or health-check the wiki, or periodically after several ingests.
---

# wiki-lint

Run a health pass over the whole wiki and report findings as a prioritized checklist. Propose fixes first; apply them after the user approves (or immediately if they asked for a full pass). Follow the schema in `AGENTS.md`.

1. **Index sync.** Every page under `wiki/` appears in `wiki/index.md`, every index link resolves, and counts match. Diff `raw/` against `wiki/sources/` to find sources that were never ingested. If `qmd` is installed, run `qmd update` first so its index reflects disk state, and `qmd cleanup --dry-run` to spot stale indexed docs.
2. **Orphans.** Run `scripts/orphans.sh` from this skill's directory (`scripts/orphans.sh wiki`): it lists pages with no inbound wikilinks except from the index. For each, decide: cross-link it, merge it, or flag it for the user.
3. **Contradictions and staleness.** Read across pages; list claims where pages disagree, or where a newer source supersedes an older one. Record resolutions on both affected pages per the schema, never silently.
4. **Missing pages.** Entities or concepts wikilinked or mentioned 3+ times without a page of their own; important terms mentioned in sources but never linked anywhere.
5. **Cross-references.** Pairs of pages that should link to each other but don't; broken `[[wikilinks]]` whose target page doesn't exist.
6. **Data gaps and next steps.** Suggest 3–5 questions worth investigating next and sources worth seeking out (use web search if the user wants).
7. **Log the pass.** Append `## [YYYY-MM-DD] lint | <one-line summary>` to `wiki/log.md` with counts of findings and fixes; update `wiki/index.md` if pages were added or merged.

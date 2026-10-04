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

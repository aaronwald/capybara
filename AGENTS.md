# Capybara — llm-wiki knowledge base

This repository is a knowledge base run with the [llm-wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): instead of re-deriving answers from raw documents on every question (RAG), the LLM incrementally builds and maintains a persistent wiki of interlinked markdown pages. The human curates sources, directs analysis, and asks questions; the LLM does the summarizing, cross-referencing, filing, and bookkeeping that keeps the wiki alive.

**Scope:** knowledge base for the capybara app — an Android task manager that dispatches tasks to agent harnesses (hermes, openroute, muse). Requirements, decisions, research, and agent capabilities.

## Layers

| Layer | Location | Owner |
|---|---|---|
| Raw sources | `raw/` | Human. Immutable — the LLM reads but never modifies, renames, or deletes. |
| The wiki | `wiki/` | LLM. Creates and maintains every page; human reads. |
| The schema | `AGENTS.md` (this file) | Co-evolved by human and LLM; changes are logged in `wiki/log.md`. |

## Layout

- `raw/` — source documents as clipped/downloaded, never edited. Images live in `raw/assets/`.
- `wiki/sources/<slug>.md` — one summary page per ingested source.
- `wiki/entities/<slug>.md` — people, organizations, projects, products, places.
- `wiki/concepts/<slug>.md` — ideas, methods, technologies, terms.
- `wiki/topics/<slug>.md` — syntheses: comparisons, analyses, answers filed back from queries.
- `wiki/index.md` — catalog of every page, grouped by category; read first when answering questions.
- `wiki/log.md` — append-only chronological record of every operation.

## Conventions

- **Slugs:** lowercase, hyphens, stable over time (`sparse-attention`, `jeff-dean`).
- **Frontmatter** on every page:
  ```yaml
  ---
  type: source        # source | entity | concept | topic
  source: raw/....md  # source pages only: path (and url: if clipped from the web)
  sources: [...]      # non-source pages: slugs of source pages backing each claim
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  ---
  ```
- **Cross-references** use Obsidian wikilinks — `[[jeff-dean]]` or `[[jeff-dean|Jeff Dean]]` — on first mention in each page.
- **Attribution:** claims on entity/concept/topic pages name their source (`per [[2026-transformer-survey]]`).
- **Contradictions:** when a new source disagrees with an existing page, record the tension explicitly on both pages with dates; never silently overwrite the older claim.
- **Every page ends with `## Related`** listing its wikilinks; a single ingest may touch 10–15 pages — that is the point.
- **Log entries:** append at the end of `wiki/log.md` as `## [YYYY-MM-DD] <ingest|query|lint|init> | <title>` plus 1–5 bullets of pages created/updated, so `grep "^## \[" wiki/log.md | tail -5` shows recent activity.

## Specification language

All specifications in this repository are written in **ASD-STE100 Simplified Technical English** (rule R1 in `raw/requirements-repo-rules.md`, wiki page `wiki/concepts/asd-ste100.md`): approved words, short sentences, active voice, one instruction per sentence. This binds every requirement, rule, and specification document — in `raw/`, in the wiki, and in any document the LLM drafts. Wiki summaries and log entries are not specifications; keep them concise but natural.

## Operations

Workflows live as skills in `.agents/skills/`. They are routed automatically by description, or invoked explicitly (`/skill:wiki-ingest raw/article.md`):

- **wiki-init** — bootstrap or repair the structure described here.
- **wiki-ingest** — process a new source: summary page, entity/concept updates, index, log.
- **wiki-query** — answer from the wiki with citations; file good answers back as topic pages.
- **wiki-lint** — health-check: contradictions, stale claims, orphans, missing pages, unprocessed sources.

## Search (optional: qmd)

[qmd](https://github.com/tobi/qmd) gives the wiki proper search as it outgrows the index file. The project-local index lives in `.qmd/` (gitignored — it contains machine-local paths):

- After every ingest, run `qmd update`. BM25 keyword search (`qmd search "<terms>" --files`) works without any model downloads.
- Vector/hybrid search (`qmd vsearch`, `qmd query`) additionally needs `qmd pull` to download local models — opt-in.
- `wiki/index.md` remains the canonical catalog. qmd is an accelerator, not a source of truth: fall back to the index when it is absent or stale.

## Rules

1. Never modify anything under `raw/`.
2. Never delete wiki pages; merge or supersede instead, and log it.
3. `wiki/index.md` and `wiki/log.md` are updated on every operation, no exceptions.
4. When unsure where something belongs, ask — the schema is meant to evolve, and every schema change gets a log entry.
5. Write specifications in ASD-STE100 Simplified Technical English — see "Specification language" above.

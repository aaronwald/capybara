---
name: wiki-init
description: Bootstrap or repair the llm-wiki knowledge base structure in this repository - raw sources directory, wiki page directories, index.md, log.md, and the schema section in AGENTS.md. Use when setting up the wiki for the first time, when wiki directories or index/log files are missing, or when porting the pattern to a new repository.
---

# wiki-init

Bootstrap the llm-wiki pattern in the current repository. Every step is idempotent: never overwrite or delete existing pages.

1. **Check the schema.** Read `AGENTS.md` at the repository root. If it already contains the llm-wiki schema (Layers / Layout / Conventions / Operations), the live file is authoritative — do not rewrite it, only report gaps. If the schema is missing, append the contents of `assets/schema.md` from this skill's directory, adjusting the title and the Scope line to the repository.
2. **Create directories** (with `.gitkeep` so they survive in git):
   - `raw/` and `raw/assets/` — immutable sources and their images
   - `wiki/sources/`, `wiki/entities/`, `wiki/concepts/`, `wiki/topics/`
   - a `.gitignore` containing `.qmd/` if none exists (the qmd index is machine-local)
3. **Create `wiki/index.md`** from `assets/index.md` if it does not exist.
4. **Create `wiki/log.md`** from `assets/log.md` if it does not exist, using today's date in the first entry.
5. **Set up qmd (optional).** If `command -v qmd` succeeds: run `qmd init` when `.qmd/` is absent, `qmd collection add wiki --name wiki` and `qmd collection add raw --name raw`, attach the two context summaries from the Search section of the schema, then `qmd update`. If qmd is not installed, skip silently — `wiki/index.md` is sufficient at moderate scale.
6. **Report** the final layout, what was created vs. already present, and remind the user that `/reload` picks up new skills and context files in a running session.
7. **Seed check.** List any files already sitting in `raw/` and offer to ingest them one at a time with the `wiki-ingest` skill.

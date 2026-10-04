---
name: wiki-ingest
description: Ingest a raw source into the llm-wiki - write a source summary page, create or update entity and concept pages, flag contradictions, update the index, and append a log entry. Use when a file is added to raw/, or the user asks to ingest, file, process, or add a source, article, paper, podcast, video, or note to the wiki.
---

# wiki-ingest

Process one new source into the wiki, following the schema in `AGENTS.md`. A single ingest may touch 10–15 pages — that is the point: keep the whole wiki consistent in one pass. Ingest sources one at a time by default; only batch when the user asks.

1. **Locate the source.** It must live under `raw/` — move it there first if the user provided it elsewhere (never edit its content). For a URL, save a readable markdown copy into `raw/` and record `url:` in its frontmatter.
2. **Read it fully.** For sources with images: read the text first, then view key images from `raw/assets/` for extra context (markdown and inline images can't be read in one pass).
3. **Discuss before writing** (skip in batch mode): give the user 3–5 key takeaways and ask what to emphasize.
4. **Write the source page** `wiki/sources/<slug>.md`: frontmatter (`type: source`, `source:` path, `url:` if any, created/updated), a TL;DR paragraph, key claims with detail, notable quotes, tags, and `## Related` wikilinks.
5. **Create or update entity and concept pages** in `wiki/entities/` and `wiki/concepts/` for everything significant in the source. New pages are honest stubs ("First mentioned in [[<source-slug>]]"). Existing pages get new facts appended with attribution, plus refreshed `## Related` sections. If the source contradicts an existing page, record the tension explicitly on both pages — never silently replace the older claim.
6. **Update `wiki/index.md`:** add every new page under its category with a one-line description; fix the counts.
7. **Append to `wiki/log.md`:** `## [YYYY-MM-DD] ingest | <title>` with bullets for the source path and pages created/updated.
8. **Re-index:** if `qmd` is installed, run `qmd update` so the new and changed pages are searchable (per the Search section of the schema).
9. **Verify:** never modify `raw/`; never delete pages; every wikilink you wrote must point at an existing page — create it or fix the link before finishing.

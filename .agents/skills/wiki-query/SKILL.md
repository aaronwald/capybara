---
name: wiki-query
description: Answer questions from the llm-wiki with citations to wiki pages and raw sources, and file substantial answers back into the wiki as topic pages. Use when the user asks a question about the collected knowledge, wants a comparison, analysis, or synthesis, or wants to explore what the wiki knows so far.
---

# wiki-query

Answer from the accumulated wiki first — the synthesis, cross-references, and flagged contradictions already exist there. Don't re-derive from raw sources unless the wiki is insufficient.

1. **Locate relevant pages.** If `qmd` is installed, search first — `qmd search "<keywords>" --files` (BM25, always available) or `qmd query "..."` when vector models are pulled — and use `wiki/index.md` for structure; otherwise read `wiki/index.md` first. Then read the actual pages either way. Drill into `raw/` sources only when a summary lacks the detail the question needs.
2. **Synthesize the answer with citations:** link the wiki pages used (`[[sparse-attention]]`) and, for key claims, the source pages backing them. Be explicit when an answer rests on a single source.
3. **Mark gaps honestly.** If the wiki doesn't cover something, say so, distinguish "not in any source" from "sources disagree," and suggest what to ingest next.
4. **File good answers back.** If the answer is a substantial synthesis — a comparison, analysis, or newly discovered connection — save it as `wiki/topics/<slug>.md` (frontmatter `type: topic`, `sources:` listing the source slugs it draws on), add inbound links from the related pages' `## Related` sections, update `wiki/index.md`, and append `## [YYYY-MM-DD] query | <title>` to `wiki/log.md`. Trivial lookups can stay in chat.
5. **Note recurring questions** — they usually indicate a missing entity, concept, or topic page worth creating (or an ask to run `wiki-lint`).

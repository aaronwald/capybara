# Log

Append-only record of wiki operations. Entries start with `## [YYYY-MM-DD] <ingest|query|lint|init> | <title>` so simple tools work over the timeline, e.g.:

    grep "^## \[" wiki/log.md | tail -5

## [YYYY-MM-DD] init | wiki bootstrapped
- Created layout per AGENTS.md: `raw/`, `raw/assets/`, `wiki/{sources,entities,concepts,topics}/`
- Created `wiki/index.md` and `wiki/log.md`

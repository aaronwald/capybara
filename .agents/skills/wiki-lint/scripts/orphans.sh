#!/usr/bin/env bash
# List wiki pages with no inbound [[wikilinks]] from any page other than the index.
# Matches both [[slug]] and [[slug|alias]] forms; the page itself is excluded.
# Usage: orphans.sh [wiki-dir]   (default: wiki)

wiki="${1:-wiki}"
[ -d "$wiki" ] || { echo "error: no wiki directory: $wiki" >&2; exit 1; }

find "$wiki" -name '*.md' ! -name 'index.md' ! -name 'log.md' -print0 |
while IFS= read -r -d '' page; do
  slug="$(basename "$page" .md)"
  if ! grep -rqlE --include='*.md' --exclude='index.md' --exclude='log.md' --exclude="$slug.md" "\[\[$slug(\]\]|\|)" "$wiki"; then
    printf 'orphan: %s\n' "$page"
  fi
done

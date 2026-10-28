#!/usr/bin/env bash
# Checks a metrics render for the silent failures of lowlighter/metrics@3.34.
# Writes ok=true|false to $GITHUB_OUTPUT; never fails the step itself.
set -u
svg="$1"
reason=""

if [ ! -s "$svg" ]; then
  reason="missing or empty render"
elif grep -q 'Unexpected error' "$svg"; then
  reason="a plugin reported 'Unexpected error'"
elif grep -qE '^[[:space:]]*0 Stargazers' "$svg"; then
  reason="0 stargazers: repository query failed"
elif grep -qE '^[[:space:]]*0 Languages' "$svg"; then
  reason="0 languages: repository query failed"
fi

if [ -n "$reason" ]; then
  echo "::warning::Bad metrics render: $reason"
  echo "ok=false" >> "${GITHUB_OUTPUT:-/dev/null}"
else
  echo "Metrics render looks valid"
  echo "ok=true" >> "${GITHUB_OUTPUT:-/dev/null}"
fi

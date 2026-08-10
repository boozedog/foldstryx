#!/usr/bin/env bash
# Apply GitHub rulesets from JSON files in this directory.
# Usage: ./apply.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
	OWNER="${BASH_REMATCH[1]}"
	REPO="${BASH_REMATCH[2]}"
else
	echo "error: could not parse GitHub owner/repo from remote" >&2
	exit 1
fi

for RULESET_FILE in "$SCRIPT_DIR"/*.json; do
	[ -f "$RULESET_FILE" ] || continue
	NAME="$(jq -r '.name' "$RULESET_FILE")"
	echo "applying ruleset '$NAME' from $(basename "$RULESET_FILE")..."

	# Check if ruleset already exists
	EXISTING_ID="$(gh api "repos/$OWNER/$REPO/rulesets" --jq ".[] | select(.name == \"$NAME\") | .id" 2>/dev/null || true)"

	if [[ -n "$EXISTING_ID" ]]; then
		gh api --method PUT "repos/$OWNER/$REPO/rulesets/$EXISTING_ID" \
			--input "$RULESET_FILE" --silent
		echo "  updated (id: $EXISTING_ID)"
	else
		gh api --method POST "repos/$OWNER/$REPO/rulesets" \
			--input "$RULESET_FILE" --silent
		echo "  created"
	fi
done

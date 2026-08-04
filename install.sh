#!/usr/bin/env bash
# AgentKit Installer — Unix bootstrap
# Downloads the core installer and runs it with Node. The core script
# auto-installs its TUI deps (@clack/prompts, kleur) if missing.
set -euo pipefail
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo ""
echo "  AgentKit Installer"
echo ""
echo "  [1/2] Downloading installer..."
curl -fsSL "https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install-core.mjs" -o "$TMP/install.mjs"
echo "  [2/2] Starting installer..."
echo ""
# Run from the temp dir so auto-npm-install places node_modules next to the script
cd "$TMP"
exec node "$TMP/install.mjs" < /dev/tty

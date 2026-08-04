#!/usr/bin/env bash
set -e
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT
curl -fsSL "https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install-core.mjs" -o "$TMP/install.mjs"
exec node "$TMP/install.mjs" < /dev/tty

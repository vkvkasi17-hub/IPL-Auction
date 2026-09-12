#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if command -v node >/dev/null 2>&1; then
  paddle_node="$(command -v node)"
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]; then
  paddle_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
else
  echo 'Install Node.js 22.13 or later, reopen your terminal, then run npm ci and npm run setup.' >&2
  exit 1
fi
if [ ! -f node_modules/vinext/dist/cli.js ]; then
  echo 'Dependencies are missing. Run npm ci first.' >&2
  exit 1
fi
export PATH="$(dirname "$paddle_node"):$PATH"
if [ "${1:-dev}" = 'setup' ]; then
  exec "$paddle_node" scripts/setup-local.mjs
fi
exec "$paddle_node" scripts/run-framework.mjs dev

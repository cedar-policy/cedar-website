#!/usr/bin/env bash
# Download the WebAssembly build of CVC5 used by the TPE explorer's
# suggestions into static/cvc5/ (next to worker.js). Pinned and checksummed.
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=1.4.2
SHA256=0366ed6826b97f90528c23e43016af806a0d4dec7df3103ae852ff35731aec30
URL="https://github.com/cvc5/cvc5/releases/download/cvc5-${VERSION}/cvc5-Wasm.zip"
DEST=static/cvc5

if [ -f "$DEST/cvc5.wasm" ] && [ "$(cat "$DEST/.version" 2>/dev/null)" = "$VERSION" ]; then
  echo "cvc5 $VERSION already in $DEST"
  exit 0
fi
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
curl -fsSL "$URL" -o "$tmp/cvc5-Wasm.zip"
echo "$SHA256  $tmp/cvc5-Wasm.zip" | sha256sum -c --quiet
unzip -q "$tmp/cvc5-Wasm.zip" -d "$tmp/x"
cp "$tmp/x/cvc5-Wasm/cvc5.js" "$tmp/x/cvc5-Wasm/cvc5.wasm" "$DEST/"
echo "$VERSION" > "$DEST/.version"
echo "fetched cvc5 $VERSION into $DEST"

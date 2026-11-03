#!/usr/bin/env bash
# Build the TPE explorer's WASM bindings from a cedar checkout (the
# cedar-tpe-explorer crate) into src/routes/tpe-explorer/pkg, where webpack
# picks them up (see the `tpe-explorer-wasm` alias in webpack.config.ts).
#
# CEDAR_DIR defaults to ../cedar. Needs Rust with the wasm32-unknown-unknown
# target and the matching wasm-bindgen CLI.
set -euo pipefail
cd "$(dirname "$0")/.."
CEDAR_DIR="${CEDAR_DIR:-../cedar}"
"$CEDAR_DIR/cedar-tpe-explorer/scripts/build-wasm.sh" "$(pwd)/src/routes/tpe-explorer/pkg"

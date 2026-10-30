#!/usr/bin/env bash
# Build the TPE explorer's WASM bindings from a tpe-tui checkout into
# src/routes/tpe-explorer/pkg, where webpack picks them up (see the
# `tpe-explorer-wasm` alias in webpack.config.ts).
#
# TPE_TUI_DIR defaults to ../tpe-tui. Needs Rust with the
# wasm32-unknown-unknown target and the matching wasm-bindgen CLI.
set -euo pipefail
cd "$(dirname "$0")/.."
TPE_TUI_DIR="${TPE_TUI_DIR:-../tpe-tui}"
"$TPE_TUI_DIR/scripts/build-wasm.sh" "$(pwd)/src/routes/tpe-explorer/pkg"

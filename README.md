# cedarpolicy-website

The [Cedar](https://www.cedarpolicy.com) authorization policy language website. Includes an interactive policy playground, a 10-step tutorial, blog, learning resources, and an AWS Verified Access playground.

## Quick Start

```bash
npm install
npm start
```

Open http://127.0.0.1:3000 in your browser.

## Prerequisites

- Node.js 16+
- npm 8+

No other tooling, accounts, or infrastructure required.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Build workers + start dev server on port 3000 |
| `npm run build` | Production build to `build/public/` (static files) |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | Run ESLint |

## TPE explorer (`/tpe-explorer`)

An interactive explorer for Cedar's type-aware partial evaluation (TPE). It is
built from the tpe-tui Rust workspace (the
`tpe-explorer-wasm` crate) and runs entirely in the browser. Suggestions use
Cedar's symbolic compiler with the WebAssembly build of
[CVC5](https://github.com/cvc5/cvc5/releases), run in a Web Worker
(`static/cvc5/worker.js`).

Both are generated, not committed:

```bash
npm run build:tpe    # needs Rust + wasm32-unknown-unknown + the pinned wasm-bindgen CLI;
                     # set TPE_TUI_DIR if tpe-tui isn't at ../tpe-tui
npm run fetch:cvc5   # downloads the pinned, checksummed CVC5 WASM release into static/cvc5/
```

Without them the site still builds; the explorer page reports that it wasn't
built. In GitHub Actions, `.github/actions/build-tpe-explorer` does both. It reads
the repository variables `TPE_TUI_REPOSITORY` (required, `owner/name`),
`TPE_TUI_REF` (default `main`), and `TPE_CEDAR_REF` (default `symcc-wasm`).

## Deploying

`npm run build` produces a `build/public/` directory containing static HTML, JS, CSS, and WASM files. Deploy these to any static file host (Vercel, Netlify, GitHub Pages, S3, nginx, etc.).

## Stack

- React 18, TypeScript, Webpack 5, SCSS
- [Cloudscape Design System](https://cloudscape.design/) (UI components)
- [@cedar-policy/cedar-wasm](https://www.npmjs.com/package/@cedar-policy/cedar-wasm) (client-side Cedar evaluation via WebAssembly)
- Ace editor with custom Cedar syntax highlighting and LSP-based validation

## Project Structure

```
src/
  cedar-editor/        # Cedar code editor components (Ace + LSP workers)
  grammar/             # Cedar syntax highlighting for PrismJS
  translations/        # i18n translations (react-intl)
  playground-helpers/  # Playground data import/export utilities
  routes/              # Page routes (playground, tutorial, blog, etc.)
  components/          # Shared UI components
  types/               # Local type definitions
static/                # Static assets (HTML, fonts, images)
tests/                 # Unit tests (Vitest + jsdom)
```

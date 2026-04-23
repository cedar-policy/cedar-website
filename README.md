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

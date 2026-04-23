# cedarpolicy.com Migration: AWS-Internal to Standalone Open-Source

## Overview

This document describes the migration of the cedarpolicy.com website from `@amzn/waterford-public-sandbox-assets` -- an Amazon-internal package built with the Brazil build system and consuming private `@amzn/*` dependencies -- to `cedarpolicy-website`, a self-contained open-source project with no Amazon-internal dependencies. The goal was to produce a repository that can be built and developed by anyone with only npm and public packages.

---

## 1. Package Metadata Changes

| Field | Original | New |
|---|---|---|
| `name` | `@amzn/waterford-public-sandbox-assets` | `cedarpolicy-website` |
| `version` | `0.1.0` | `1.0.0` |
| `description` | (empty) | `"The Cedar authorization policy language website -- www.cedarpolicy.com"` |
| `license` | `UNLICENSED` | `Apache-2.0` |
| `private` | (absent) | `true` |
| `repository` | `ssh://git.amazon.com/pkg/WaterfordPublicSandboxAssets` | (removed) |
| `homepage` | `https://code.amazon.com/packages/WaterfordPublicSandboxAssets` | (removed) |
| `browserslist` | `extends @amzn/browserslist-config-aws-console` | `"> 0.5%", "last 2 versions", "not dead"` |

The `npm-pretty-much` block (a Brazil CI system directive) was removed entirely.

### Scripts changes

| Script | Original | New | Notes |
|---|---|---|---|
| `build` | `webpack --mode production ... && rsync -va configuration/ build/ && rm -rf build/public/aws_lambda` | `webpack --mode production ...` | No more rsync of Lambda configs into the build |
| `build:workers` | (absent) | `webpack --mode development --env WORKERS_ONLY` | New: builds Web Worker bundles separately for dev mode |
| `prepare` | `husky install` | (removed) | Husky no longer used |
| `lint-env-path` | (present) | (removed) | Was only used by the pre-commit hook |
| `build+test+package` / `prepublishOnly` | Present | Removed | No longer publishing to an npm registry |
| `forcebuildtobeta` | S3 upload to beta bucket | Removed | Deployment handled externally now |

---

## 2. Removed Files and Directories

These items exist in the original but were dropped from the standalone repo:

| Path | Purpose | Why removed |
|---|---|---|
| `Config` | Brazil package metadata | Amazon build system artifact |
| `configuration/aws_lambda/lambda-transform.yml` | CloudFormation Lambda archive config | Deployment infrastructure is outside this repo |
| `.husky/pre-commit` | Pre-commit hook calling `brazil-build lint-env-path` | Coupled to Brazil CLI; can be re-added with vanilla npm if desired |
| `CLAUDE.md` | Claude Code guidance file for the internal repo | Not needed in standalone repo |
| `MIGRATION_PLAN.md` | Internal planning doc | Not relevant to the standalone repo |
| `tsconfig.test.json` | Separate test TypeScript config | Consolidated (the new repo uses just `tsconfig.json`) |

---

## 3. New Files and Directories

These exist only in the standalone repo:

### `src/cedar-editor/` -- Inlined CedarCodeEditor package

The entire `@amzn/cedar-code-editor` package was copied into the repo as `src/cedar-editor/`. This is a substantial addition (~35 files) containing:

- **`code-editor/`**: The `CedarCodeEditor`, `CedarJsonCodeEditor`, and `CedarSchemaCodeEditor` React components, the `useCedar` hook, error utilities, LSP integration code, and translation strings.
- **`code-editor/lsp/`**: Cedar LSP workers (`cedarWorker.ts`, `cedarJsonWorker.ts`, `cedarSchemaWorker.ts`) and their supporting mode definitions and documentation providers.
- **`cloud-editor-shim/`**: A from-scratch replacement for `@amzn/cloud-editor`, which was an Amazon-internal Ace editor wrapper with LSP support. The shim re-implements the `CloudEditor` React component, `LspClient`, worker connection factory, JSON language server integration, and editor/language definitions using only `ace-code` and `vscode-languageserver*` public packages.
- **`jsonFormatHelpers.ts`**, **`VisualPolicyBuilder.tsx`**, **`types.d.ts`**: Supporting modules previously part of `@amzn/cedar-code-editor`.
- **`ace-code.d.ts`**: TypeScript declarations for the `ace-code` package.

### `src/grammar/` -- Inlined WaterfordGrammarRulesForEditors

- **`index.js`** (242 lines): The `initializeCedarAce` and `initializeCedarPrism` functions that register Cedar syntax highlighting modes with Ace and Prism. Previously came from the `@amzn/waterford-grammar-rules-for-editors` npm package.
- **`index.d.ts`**: TypeScript declarations for the above.
- **`prism-vs.css`**: Theme CSS for Prism code blocks.

### `src/translations/` -- Inlined WaterfordPublicSandboxTranslations

- **`configuration.ts`**: Defines `Locale`, `defaultLocale`, `supportedLocales`, and `languagePath()`. Replaces the module previously exported by `@amzn/waterford-public-sandbox-translations`.
- **`en.json`** (1719 lines): The full English translation file. Previously lived in the `WaterfordPublicSandboxTranslations` package and was loaded at build time via a webpack `file-loader` rule matching `@amzn/waterford-public-sandbox-translations/*.json`.

### `src/util/flattenMessages.ts`

A new utility that recursively flattens nested JSON translation objects into dot-delimited key/value pairs (e.g., `{topNavbar: {cedarTitle: "Cedar"}}` becomes `{"topNavbar.cedarTitle": "Cedar"}`). This was needed because the original `@amzn/waterford-public-sandbox-translations` package pre-flattened its JSON during its own build step; the open-source repo uses raw nested JSON and flattens at runtime.

### `src/playground-helpers/` -- Inlined from AVPUICommon

- **`playgroundExportHelpers.ts`**: URL fragment export/import logic (gzip + base64 encode/decode of playground state). Previously exported from `@amzn/avpui-common`.
- **`index.ts`**: Re-export barrel.

### `src/types/cedar-data-types.ts`

Local type definitions for `EntityIdentifier`, `AttributeValue`, `ContextMap`, and `EntityItem` -- the subset of AWS Verified Permissions SDK types that the playground uses. Replaces the dev dependency on `@amzn/verifiedpermissions`.

---

## 4. Dependency Mapping: `@amzn/*` to Public Replacements

| Original `@amzn/` package | What replaced it |
|---|---|
| `@amzn/awsui-components-react` | `@cloudscape-design/components` |
| `@amzn/awsui-design-tokens` | `@cloudscape-design/design-tokens` |
| `@amzn/awsui-global-styles` | `@cloudscape-design/global-styles` |
| `@amzn/cedar-code-editor` | Inlined into `src/cedar-editor/` |
| `@amzn/waterford-grammar-rules-for-editors` | Inlined into `src/grammar/` |
| `@amzn/waterford-public-sandbox-translations` | Inlined into `src/translations/` |
| `@amzn/avpui-common` | Inlined into `src/playground-helpers/` |
| `@amzn/shortbread` | **Removed entirely** (cookie consent) |
| `@amzn/aws-ui-community-component-easy-flash` | **Removed entirely** (toast notifications) |
| `@amzn/verifiedpermissions` (devDep) | Local type stubs in `src/types/cedar-data-types.ts` |
| `@amzn/browserslist-config-aws-console` (devDep) | Inline browserslist targets: `> 0.5%, last 2 versions, not dead` |
| `@types/awsc` (devDep) | Removed (no longer needed) |

### New public dependencies added

| Package | Why |
|---|---|
| `@cedar-policy/cedar-wasm` (pinned 4.9.0) | Moved from implicit/transitive to explicit direct dependency |
| `ace-code` | Replaces `@amzn/cloud-editor`'s internal Ace bundling |
| `pako` + `@types/pako` | gzip compression for playground URL export (was inside `@amzn/avpui-common`) |
| `vscode-languageserver`, `vscode-languageserver-protocol`, `vscode-languageserver-textdocument`, `vscode-json-languageservice` | LSP infrastructure for the cloud-editor-shim (was inside `@amzn/cloud-editor`) |
| `ts-loader` (devDep) | Used by the new worker webpack build (the original only used `babel-loader`) |

---

## 5. Build System Changes (webpack.config.ts)

The most significant structural change is the addition of a **Web Worker build**. The original config was a single webpack configuration. The new config exports up to two configurations:

### Worker build (new)

A dedicated `webworker`-target config that compiles three entry points into standalone `.worker.js` files:
- `cedarWorker.ts` -- Cedar policy LSP
- `cedarJsonWorker.ts` -- JSON entity/context LSP
- `cedarSchemaWorker.ts` -- Cedar schema LSP

These workers use `ts-loader` instead of `babel-loader` and have `chunkLoading: false` because Web Workers cannot load dynamic chunks. In development, workers are pre-built via the `build:workers` npm script before `webpack serve` starts (because webpack-dev-server only supports single configs).

### CopyWebpackPlugin changes

| Original | New |
|---|---|
| Copies `node_modules/@amzn/cedar-code-editor/dist/cedar*` to build | **Removed** -- workers are now built directly by webpack |
| Copies `node_modules/@amzn/waterford-grammar-rules-for-editors/dist/index.js` | Copies `src/grammar/index.js` instead |
| Copies `configuration/` to build | **Removed** -- no more Lambda config |

### Translation loader rule

The regex for the `file-loader` JSON rule changed from `/@amzn\/waterford-public-sandbox-translations\/.*\.json$/` to `/src\/translations\/.*\.json$/` to match the new local translation files.

---

## 6. Source Code Changes

### `src/App.tsx`

The most visible functional changes are in the root App component:

1. **Shortbread cookie consent removed**: The original initialized `AWSCShortbread` (Amazon's EU cookie consent library) in a `useEffect`, stored it in state, and rendered a "Cookie Preferences" button, a privacy policy link, and a site terms link in the bottom bar. All of this is gone. The `shortbread` state variable, the `useEffect`, and the three bottom-bar links (Privacy, Site Terms, Cookie Preferences) were replaced with empty fragments and TODO comments.

2. **EasyFlash removed**: The `<EasyFlash />` component (Amazon-internal toast notification system) was removed from the render tree. The `showEasyFlash()` call in `PolicyPlayground.tsx` (used to show error toasts) was replaced with `console.error()`.

3. **Copyright statement removed**: The `copyrightStatement` div with the "Amazon Web Services, Inc. or its affiliates. All rights reserved." text was deleted.

4. **Bottom bar simplified**: The bottom bar went from a responsive mobile/desktop layout with links + copyright to a single empty `flex-row` div with TODO comments for adding new privacy/terms links.

### `src/index.tsx`

- Import of `languagePath` and `Locale` changed from `@amzn/waterford-public-sandbox-translations` to `./translations/configuration`.
- Added import of `flattenMessages` from `./util/flattenMessages`.
- Translation loading now calls `flattenMessages(nested)` on the fetched JSON before passing it to `IntlProvider`, because the local translation JSON uses nested keys rather than pre-flattened dot-notation.

### `src/util/intlHelpers.ts`

- Import source for `supportedLocales`, `defaultLocale`, `Locale` changed from `@amzn/waterford-public-sandbox-translations` to `../translations/configuration`.
- The `getShortbreadLocale()` function was removed entirely (it mapped Cedar locales to Shortbread locale codes).

### `src/styles.scss`

- SASS import changed from `~@amzn/awsui-design-tokens/polaris` to `~@cloudscape-design/design-tokens`.
- The `#shortbread-link` CSS rules were removed.

### `static/index.html` (Content Security Policy)

The CSP `<meta>` tag was tightened:
- `connect-src`: removed `https://*.shortbread.aws.dev` (Shortbread telemetry)
- `font-src`: removed `https://a.b.cdn.console.awsstatic.com` (AWS console CDN fonts)
- `upgrade-insecure-requests` directive: removed
- The `<div id="shortbread"></div>` element was removed
- A TODO comment for cookie consent was added

### All other source files (42+ files)

Every `.tsx` and `.ts` file that imported from `@amzn/awsui-components-react` was changed to import from `@cloudscape-design/components`. Every file that imported from `@amzn/cedar-code-editor` was changed to use relative imports from `../../cedar-editor` (or deeper paths like `../../cedar-editor/code-editor/useCedar`). Imports of `@amzn/avpui-common` became `../../playground-helpers`. Imports of `@amzn/verifiedpermissions` became `../../types/cedar-data-types`.

---

## 7. Test Changes

### `tests/setupTests.ts`

Three import lines changed to point at local code instead of `@amzn/` packages:

| Original | New |
|---|---|
| `import initializeCedarAce from '@amzn/waterford-grammar-rules-for-editors'` | `import initializeCedarAce from '../src/grammar'` |
| `import { CedarCodeEditor, CedarJsonCodeEditor } from '@amzn/cedar-code-editor/dist/src/code-editor'` | `import { ... } from '../src/cedar-editor/code-editor'` |
| `import { usePureCedarHookForTests } from '@amzn/cedar-code-editor/dist/src/code-editor/usePureCedarHookForTests'` | `import { ... } from '../src/cedar-editor/code-editor/usePureCedarHookForTests'` |

The `vi.mock('@amzn/cedar-code-editor', ...)` call became `vi.mock('../src/cedar-editor', ...)`.

### `vitest.config.ts`

The `server.deps.inline` entry changed from `@amzn/awsui-components-react` to `@cloudscape-design/components`. This tells Vitest to inline these ESM-only packages so jsdom can process them.

### Test files (`sandbox.test.tsx`, `tutorial.test.tsx`, `util.test.tsx`)

- Translation imports changed from `@amzn/waterford-public-sandbox-translations/dist/en.json` to `../src/translations/en.json`.
- Added `flattenMessages()` call to flatten nested JSON before passing to `IntlProvider`.
- Cloudscape test-utils import changed from `@amzn/awsui-components-react/polaris/test-utils/dom` to `@cloudscape-design/components/test-utils/dom`.
- `useCedar` import changed from `@amzn/cedar-code-editor` to `../src/cedar-editor`.

---

## 8. Summary of Inlined Packages

| Original Package | New Location | Approximate Size | What it provides |
|---|---|---|---|
| `@amzn/cedar-code-editor` | `src/cedar-editor/` | ~35 files | Ace-based code editors for Cedar policies, JSON, and Cedar schema, with LSP integration, the `useCedar` hook, and WASM bindings |
| `@amzn/cloud-editor` (transitive dep of cedar-code-editor) | `src/cedar-editor/cloud-editor-shim/` | ~10 files | React wrapper around Ace with LSP protocol support -- fully reimplemented from scratch using `ace-code` + `vscode-languageserver` |
| `@amzn/waterford-grammar-rules-for-editors` | `src/grammar/` | 3 files (242 lines of JS) | Ace mode/theme registration and Prism language definition for Cedar syntax |
| `@amzn/waterford-public-sandbox-translations` | `src/translations/` | 2 files (1719-line JSON + config module) | i18n translation strings and locale configuration |
| `@amzn/avpui-common` | `src/playground-helpers/` | 2 files (~193 lines) | Playground state gzip/base64 export/import for URL sharing |
| `@amzn/verifiedpermissions` (types only) | `src/types/cedar-data-types.ts` | 1 file (27 lines) | Type definitions for `EntityIdentifier`, `AttributeValue`, `ContextMap`, `EntityItem` |

---

## Key Takeaways for New Maintainers

1. **No Amazon-internal dependencies remain.** Every `@amzn/*` import has been replaced with either a public `@cloudscape-design/*` package, a pinned public `@cedar-policy/cedar-wasm` package, or local source code.

2. **The cloud-editor-shim is the most novel code.** It is a ground-up reimplementation of an internal Amazon editor wrapper. If LSP editor bugs arise, this is where to look (`src/cedar-editor/cloud-editor-shim/`).

3. **Translations are now local.** Adding a new locale means adding a new JSON file in `src/translations/`, adding the locale to the `supportedLocales` array in `configuration.ts`, and ensuring the `flattenMessages` utility handles it.

4. **Workers require a two-step dev build.** Run `npm run build:workers` before `npm run start`, or use `npm run start` which chains them automatically.

5. **Cookie consent, toast notifications, and the Amazon copyright were intentionally stripped.** TODOs are left in the code for re-adding cookie consent and privacy links with an appropriate non-Amazon solution.

6. **The build no longer produces Lambda/CDK deployment artifacts.** The `configuration/` directory and its rsync into the build output are gone. Deployment is handled outside this repository.

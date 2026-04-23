import * as monaco from 'monaco-editor';
import { configureCedarEditors } from '@cedar-policy/cedar-monaco-editor';

// Monaco's built-in editor workers (Webpack 5 native worker syntax)
const editorWorkerFactory = () =>
  new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
        { type: 'module' },
    );
const jsonWorkerFactory = () =>
  new Worker(
        new URL(
            "monaco-editor/esm/vs/language/json/json.worker.js",
            import.meta.url,
        ),
        { type: 'module' },
    );

(
  self as unknown as {
    MonacoEnvironment: { getWorker: (_: unknown, label: string) => Worker };
  }
).MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'json') return jsonWorkerFactory();
    return editorWorkerFactory();
  },
};

// Cedar LSP workers are loaded via the package's `exports` map entry
// `"./workers/*": "./dist/workers/*.js"` — the `.js` suffix is appended
// by the resolver, so the import specifier MUST omit it.
const cedarPolicyWorker = () =>
  new Worker(new URL('@cedar-policy/cedar-monaco-editor/workers/cedar-policy.worker', import.meta.url), { type: 'module' });
const cedarSchemaWorker = () =>
  new Worker(new URL('@cedar-policy/cedar-monaco-editor/workers/cedar-schema.worker', import.meta.url), { type: 'module' });
const cedarJsonWorker = () =>
  new Worker(new URL('@cedar-policy/cedar-monaco-editor/workers/cedar-json.worker', import.meta.url), { type: 'module' });

configureCedarEditors({
  monaco,
  policyWorkerFactory: cedarPolicyWorker,
  schemaWorkerFactory: cedarSchemaWorker,
  jsonWorkerFactory: cedarJsonWorker,
});

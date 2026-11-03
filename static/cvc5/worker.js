/*
 * Runs CVC5 (the WebAssembly build from the cvc5 GitHub release) off the main
 * thread for the TPE explorer's suggestions.
 *
 * Protocol: post `{ id, script, timeoutMs }` where `script` is a complete
 * SMT-LIB script; the reply is `{ id, out }` with CVC5's standard output, or
 * `{ id, error }`. Each script runs in a fresh CVC5 instance (the compiled
 * WebAssembly module is reused), one at a time.
 */
/* eslint-disable */
let glue = null;
let wasmModule = null;
// CVC5 calls abort() while tearing down after main() returns. By then its
// output is complete, so those aborts are expected and swallowed.
let finished = true;
const isTeardownAbort = (e) => finished && /Aborted\(/.test(String((e && e.message) || e));
self.addEventListener('error', (event) => {
    if (isTeardownAbort(event.error || event.message)) event.preventDefault();
});
self.addEventListener('unhandledrejection', (event) => {
    if (isTeardownAbort(event.reason)) event.preventDefault();
});

async function load() {
    if (glue) return;
    const base = new URL('.', self.location.href);
    const js = await fetch(new URL('cvc5.js', base)).then((r) => {
        if (!r.ok) throw new Error('cvc5.js not found (run `npm run fetch:cvc5`)');
        return r.text();
    });
    wasmModule = await WebAssembly.compile(await download(new URL('cvc5.wasm', base)));
    // The release is built for ENVIRONMENT=web only and refuses to start in a
    // worker. Nothing it needs differs between the two, so hide the worker scope.
    if (!js.includes('globalThis.WorkerGlobalScope')) {
        throw new Error('unexpected cvc5.js: environment check not found');
    }
    glue = js.split('globalThis.WorkerGlobalScope').join('undefined');
}

/** Fetch a file, reporting `{ progress: { loaded, total } }` as it arrives. */
async function download(url) {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`could not download ${url.pathname} (${res.status})`);
    const total = Number(res.headers.get('content-length')) || 0;
    const reader = res.body.getReader();
    const chunks = [];
    let loaded = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        self.postMessage({ progress: { loaded, total } });
    }
    const bytes = new Uint8Array(loaded);
    let at = 0;
    for (const c of chunks) {
        bytes.set(c, at);
        at += c.length;
    }
    return bytes;
}

function solve(script, timeoutMs) {
    finished = false;
    return new Promise((resolve, reject) => {
        const out = [];
        const input = new TextEncoder().encode(script);
        let pos = 0;
        self.window = self;
        const Module = {
            arguments: ['--lang', 'smt2', `--tlimit=${timeoutMs}`],
            stdin: () => (pos < input.length ? input[pos++] : null),
            print: (line) => out.push(line),
            printErr: () => {},
            instantiateWasm: (imports, done) => {
                WebAssembly.instantiate(wasmModule, imports).then(done, reject);
                return {};
            },
            // main() runs synchronously right after this hook.
            onRuntimeInitialized: () => setTimeout(() => {
                finished = true;
                resolve(out.join('\n'));
            }, 0),
            onAbort: (e) => {
                if (!finished) reject(new Error(`cvc5 aborted: ${e}`));
            },
        };
        // `var Module = typeof Module != "undefined" ? Module : {}` in the glue
        // picks up this parameter.
        new Function('Module', glue)(Module);
    });
}

let queue = Promise.resolve();
self.onmessage = (event) => {
    const { id, script, timeoutMs = 10000 } = event.data;
    queue = queue.then(async () => {
        try {
            await load();
            self.postMessage({ id, out: await solve(script, timeoutMs) });
        } catch (e) {
            self.postMessage({ id, error: String((e && e.message) || e) });
        }
    });
};

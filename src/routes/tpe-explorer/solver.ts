// Client for static/cvc5/worker.js, which runs the WebAssembly build of CVC5.

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, { resolve: (out: string) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker('/cvc5/worker.js');
        worker.onmessage = (event: MessageEvent<{ id: number; out?: string; error?: string }>) => {
            const { id, out, error } = event.data;
            const p = pending.get(id);
            if (!p) return;
            pending.delete(id);
            if (error !== undefined) p.reject(new Error(error));
            else p.resolve(out ?? '');
        };
        worker.onerror = (event) => {
            const e = new Error(event.message || 'the solver worker failed');
            pending.forEach((p) => p.reject(e));
            pending.clear();
            worker?.terminate();
            worker = null;
        };
    }
    return worker;
}

/** Run one SMT-LIB script in CVC5; resolves to its standard output. */
export function runCvc5(script: string, timeoutMs = 10000): Promise<string> {
    return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        getWorker().postMessage({ id, script, timeoutMs });
    });
}

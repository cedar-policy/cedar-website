// Client for static/cvc5/worker.js, which runs the WebAssembly build of CVC5.

export interface Progress {
    loaded: number;
    total: number;
}

type WorkerReply = { id: number; out?: string; error?: string } | { progress: Progress };

let worker: Worker | null = null;
let nextId = 0;
let ready = false;
const pending = new Map<number, { resolve: (out: string) => void; reject: (e: Error) => void }>();
const progressListeners = new Set<(p: Progress) => void>();

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker('/cvc5/worker.js');
        worker.onmessage = (event: MessageEvent<WorkerReply>) => {
            const msg = event.data;
            if ('progress' in msg) {
                progressListeners.forEach((l) => l(msg.progress));
                return;
            }
            ready = true;
            const p = pending.get(msg.id);
            if (!p) return;
            pending.delete(msg.id);
            if (msg.error !== undefined) p.reject(new Error(msg.error));
            else p.resolve(msg.out ?? '');
        };
        worker.onerror = (event) => {
            const e = new Error(event.message || 'the solver failed');
            pending.forEach((p) => p.reject(e));
            pending.clear();
            worker?.terminate();
            worker = null;
            ready = false;
        };
    }
    return worker;
}

/** Has the solver been downloaded and started? */
export function solverReady(): boolean {
    return ready;
}

/** Listen for download progress of the solver; returns an unsubscribe function. */
export function onSolverProgress(listener: (p: Progress) => void): () => void {
    progressListeners.add(listener);
    return () => progressListeners.delete(listener);
}

/** Run one SMT-LIB script in CVC5; resolves to its standard output. */
export function runCvc5(script: string, timeoutMs = 10000): Promise<string> {
    return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        getWorker().postMessage({ id, script, timeoutMs });
    });
}

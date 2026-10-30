// Types for the WASM bindings built from tpe-tui's `tpe-explorer-wasm` crate.
// Values cross the boundary as JSON strings; see `./types.ts` for their shapes.
declare module 'tpe-explorer-wasm' {
    export type SmtSolver = (script: string) => Promise<string>;
    export class Explorer {
        constructor(schema: string, policies: string, facts?: string | null);
        free(): void;
        view(residualWidth: number): string;
        slot_info(key: string): string;
        policy_needs(id: string): string;
        set_input(key: string, text: string): void;
        set_state(key: string, state: string): void;
        undo(): boolean;
        redo(): boolean;
        export_facts(): string;
        explain(): string;
        suggest_slot(key: string, solver: SmtSolver): Promise<string>;
        suggest_policy(id: string, solver: SmtSolver): Promise<string>;
        apply_suggestion(index: number): string;
    }
}

// Types for the WASM bindings built from tpe-tui's `tpe-explorer-wasm` crate.
// Values cross the boundary as JSON strings; see `./types.ts` for their shapes.
declare module 'tpe-explorer-wasm' {
    export type SmtSolver = (script: string) => Promise<string>;
    export class Explorer {
        constructor(schema: string, policies: string);
        free(): void;
        /** The structured model (`Model` in ./types.ts). */
        model(): string;
        /** Replace the policies, keeping the schema and all known facts. */
        set_policies(policies: string): void;
        set_input(key: string, text: string): void;
        set_state(key: string, state: string): void;
        set_entity_type(key: string, entityType: string): void;
        reset(): void;
        undo(): boolean;
        redo(): boolean;
        explain(): string;
        suggest_slot(key: string, solver: SmtSolver): Promise<string>;
        suggest_policy(id: string, solver: SmtSolver): Promise<string>;
        suggest_decision(want: 'allow' | 'deny', solver: SmtSolver): Promise<string>;
        apply_suggestion(id: number): string;
    }
}

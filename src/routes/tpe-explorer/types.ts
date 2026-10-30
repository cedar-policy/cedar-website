// Shapes of the JSON produced by the `tpe-explorer-wasm` bindings.

export type SpanStyle =
    | 'plain' | 'keyword' | 'type' | 'str' | 'ident' | 'lit'
    | 'comment' | 'unknown-strong' | 'unknown-weak' | 'muted';

export type Gutter = 'none' | 'bare' | 'needed' | 'residual' | 'satisfied' | 'not' | 'error';

export interface Span {
    text: string;
    style: SpanStyle;
    /** Key of the fact this span displays (and edits). */
    slot: string | null;
    /** Keys of facts this span depends on. */
    marks: string[];
}

export interface DocLine {
    gutter: Gutter;
    dim: boolean;
    /** Set on the header line of a policy entry. */
    policy: string | null;
    spans: Span[];
}

export interface Status {
    /** Set when evaluation fails. */
    failure?: string;
    decision?: 'allow' | 'deny' | null;
    decisionLabel?: string | null;
    residual?: number;
    satisfied?: number;
    not?: number;
    error?: number;
    reasons?: string[];
    irrelevant?: number;
    settled?: string | null;
    warnings?: string[];
}

export interface View {
    status: Status;
    facts: DocLine[];
    residuals: DocLine[];
    slotOrder: string[];
    policyOrder: string[];
    policiesSrc: string;
    schemaSrc: string;
    canUndo: boolean;
    canRedo: boolean;
}

export type EditState = 'value' | 'present' | 'absent' | 'unknown';

export interface SlotInfo {
    label: string;
    need: string | null;
    states: { state: EditState; label: string; allowed: boolean }[];
    current: EditState;
    prompt: string;
    text: string;
}

export interface Suggestion {
    assignments: string[];
    slots: string[];
    effects: string[];
}

export interface Explanation {
    decision: string | null;
    reasons?: string[];
    facts?: string[];
    known?: number;
}

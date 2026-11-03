// Shapes of the JSON produced by the `tpe-explorer-wasm` bindings
// (`Explorer.model()`; see tpe_explorer::model in tpe-tui).

export type FactState = 'value' | 'present' | 'absent' | 'unknown';

export type NeedKind = 'id' | 'blocked' | 'value' | 'parents' | 'tags';

export interface Needs {
    kind: NeedKind;
    policies: string[];
    message: string;
}

interface FactBase {
    /** Stable key addressing this fact. */
    key: string;
    label: string;
    state: FactState;
    allowedStates: FactState[];
    /** Current value as editable text ('' if unknown). */
    text: string;
    needs: Needs | null;
}

export type ValueKind = 'bool' | 'long' | 'string' | 'entity' | 'set' | 'record' | 'extension' | 'other';

export interface Field extends FactBase {
    kind: 'value' | 'record';
    name: string;
    required: boolean;
    typeName: string;
    valueKind: ValueKind;
    entityType?: string | null;
    display: string;
    children?: Field[];
}

export interface UidFact extends FactBase {
    kind: 'uid';
    entityType: string;
    typeOptions: string[];
}

export interface ActionFact extends FactBase {
    kind: 'action';
    options: string[];
}

export interface ParentsFact extends FactBase {
    kind: 'parents';
    values: string[];
    allowedTypes: string[];
}

export interface TagsFact extends FactBase {
    kind: 'tags';
    typeName: string;
    values: { key: string; display: string }[];
}

export interface EntityModel {
    uid: string;
    type: string;
    id: string;
    isPrincipal: boolean;
    isResource: boolean;
    parents: ParentsFact | null;
    attrs: Field[];
    tags: TagsFact | null;
}

export interface Token {
    text: string;
    style: string;
    /** Keys of facts this token depends on. */
    marks: string[];
    break?: boolean;
}

export type PolicyStatus = 'residual' | 'satisfied' | 'not-satisfied' | 'error';

export interface PolicyModel {
    id: string;
    effect: 'permit' | 'forbid';
    status: PolicyStatus;
    relevant: boolean;
    isReason: boolean;
    residual: Token[];
    needs: { key: string; label: string; kind: NeedKind }[];
    source: string | null;
}

export interface DecisionModel {
    state: 'allow' | 'deny' | 'undecided' | 'error';
    summary: string;
    reasons?: string[];
    counts?: { residual: number; satisfied: number; notSatisfied: number; error: number; irrelevant: number };
    warnings?: string[];
}

export interface Model {
    decision: DecisionModel;
    request: { principal: UidFact; action: ActionFact; resource: UidFact; context: Field[] };
    entities: EntityModel[];
    policies: PolicyModel[];
    knownIds: Record<string, string[]>;
    canUndo: boolean;
    canRedo: boolean;
}

export interface Suggestion {
    id: number;
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

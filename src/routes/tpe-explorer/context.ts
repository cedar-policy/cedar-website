// Shared state and actions for the explorer's components.
import React from 'react';
import type { FactState, Model, Suggestion } from './types';

export interface ExplorerActions {
    model: Model;
    /** Set a fact from typed text; resolves to an error message, or null. */
    setValue: (key: string, text: string) => string | null;
    setState: (key: string, state: FactState) => string | null;
    setEntityType: (key: string, type: string) => string | null;
    suggestFact: (key: string) => Promise<Suggestion[]>;
    suggestPolicy: (id: string) => Promise<Suggestion[]>;
    apply: (s: Suggestion) => string | null;
    /** Scroll to and briefly highlight a fact. */
    revealFact: (key: string) => void;
    /** The fact currently hovered anywhere on the page. */
    hovered: string | null;
    setHovered: (key: string | null) => void;
    /** Facts changed by the last applied suggestion. */
    changed: string[];
    /** Fact being revealed (scrolled to and highlighted). */
    revealed: string | null;
}

export const ExplorerContext = React.createContext<ExplorerActions | null>(null);

export function useExplorer(): ExplorerActions {
    const ctx = React.useContext(ExplorerContext);
    if (!ctx) throw new Error('useExplorer outside ExplorerContext');
    return ctx;
}

/** Do two fact keys overlap (one is the other, or contains it)? */
export function related(a: string | null, b: string | null): boolean {
    if (!a || !b) return false;
    if (a === b) return true;
    try {
        const x = JSON.parse(a) as unknown[];
        const y = JSON.parse(b) as unknown[];
        const prefix = (p: unknown, q: unknown) =>
            Array.isArray(p) && Array.isArray(q) && p.every((v, i) => q[i] === v);
        if (x[0] === 'context' && y[0] === 'context') return prefix(x[1], y[1]) || prefix(y[1], x[1]);
        if (x[0] === 'attr' && y[0] === 'attr' && x[1] === y[1]) return prefix(x[2], y[2]) || prefix(y[2], x[2]);
        if (x[1] === y[1] && ((x[0] === 'tags' && y[0] === 'tag') || (x[0] === 'tag' && y[0] === 'tags'))) {
            return true;
        }
    } catch {
        // not a fact key
    }
    return false;
}

/** `PhotoApp::User` -> `User`. */
export function basename(type: string): string {
    const i = type.lastIndexOf('::');
    return i < 0 ? type : type.slice(i + 2);
}

/** A short, readable name for an entity uid: `User "alice"`. */
export function shortUid(uid: string): string {
    const m = /^(.*)::("(?:[^"\\]|\\.)*")$/.exec(uid);
    return m ? `${basename(m[1])} ${m[2]}` : uid;
}

export function errorText(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}

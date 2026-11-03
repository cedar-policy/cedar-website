import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, SpaceBetween, Spinner } from '@cloudscape-design/components';
import { errorText, useExplorer } from './context';
import type { Suggestion } from './types';

interface SuggestionsProps {
    /** Computes the suggestions; called when shown, and again on refresh. */
    load: () => Promise<Suggestion[]>;
    /** Shown when nothing is found. */
    emptyText: string;
    onApplied?: () => void;
    onClose?: () => void;
}

function Effects({ s }: { s: Suggestion }) {
    return (
        <ul className="tpe-effects">
            {s.effects.map((e) => (
                <li key={e} className={/^decides/.test(e) ? 'tpe-effect-decides' : undefined}>
                    {e}
                </li>
            ))}
        </ul>
    );
}

/** Solver-backed suggestions, each with what it would do and an Apply button. */
export default function Suggestions(props: SuggestionsProps) {
    const { apply } = useExplorer();
    const [items, setItems] = useState<Suggestion[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let live = true;
        props.load().then(
            (s) => {
                if (!live) return;
                setItems(s);
                // Results can land below the fold; bring them into view.
                requestAnimationFrame(() => root.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
            },
            (e) => live && setError(errorText(e)),
        );
        return () => {
            live = false;
        };
    }, []);

    let body: React.ReactNode;
    if (error) {
        body = <Alert type="error">{error}</Alert>;
    } else if (!items) {
        body = (
            <SpaceBetween size="xs">
                <Box color="text-body-secondary">
                    <Spinner /> Asking the solver… (the first time downloads CVC5, about 28 MB)
                </Box>
                {props.onClose ? (
                    <Button variant="inline-link" onClick={props.onClose}>
                        Cancel
                    </Button>
                ) : null}
            </SpaceBetween>
        );
    } else if (!items.length) {
        body = <Box color="text-body-secondary">{props.emptyText}</Box>;
    } else {
        body = (
            <SpaceBetween size="xs">
                {items.map((s) => (
                    <div className="tpe-suggestion" key={s.id}>
                        <div className="tpe-suggestion-body">
                            <ul className="tpe-assignments">
                                {s.assignments.map((a) => (
                                    <li key={a}>
                                        <code>{a}</code>
                                    </li>
                                ))}
                            </ul>
                            <Effects s={s} />
                        </div>
                        <Button
                            ariaLabel={`Apply: ${s.assignments.join('; ')}`}
                            onClick={() => {
                                const err = apply(s);
                                if (err) setError(err);
                                else props.onApplied?.();
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                ))}
            </SpaceBetween>
        );
    }
    return <div ref={root}>{body}</div>;
}

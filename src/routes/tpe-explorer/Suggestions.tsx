import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, SpaceBetween, Spinner } from '@cloudscape-design/components';
import { errorText, useExplorer } from './context';
import type { Suggestion } from './types';

interface SuggestionsProps {
    /** Computes the suggestions; called once when shown. */
    load: () => Promise<Suggestion[]>;
    /** Shown when nothing is found. */
    emptyText: string;
    onApplied?: () => void;
}

/** Solver-backed suggestions, each with what it would do and an Apply button. */
export default function Suggestions(props: SuggestionsProps) {
    const { apply } = useExplorer();
    const [items, setItems] = useState<Suggestion[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let live = true;
        props.load().then(
            (s) => live && setItems(s),
            (e) => live && setError(errorText(e)),
        );
        return () => {
            live = false;
        };
    }, []);

    if (error) return <Alert type="error">{error}</Alert>;
    if (!items) {
        return (
            <Box color="text-body-secondary">
                <Spinner /> Asking the solver… (the first time downloads CVC5, about 28 MB)
            </Box>
        );
    }
    if (!items.length) return <Box color="text-body-secondary">{props.emptyText}</Box>;
    return (
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
                        <ul className="tpe-effects">
                            {s.effects.map((e) => (
                                <li key={e} className={/^decides/.test(e) ? 'tpe-effect-decides' : undefined}>
                                    {e}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Button
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

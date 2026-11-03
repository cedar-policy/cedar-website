import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Alert,
    Box,
    Button,
    Container,
    ContentLayout,
    Header,
    Modal,
    Select,
    SpaceBetween,
    Spinner,
    Tabs,
} from '@cloudscape-design/components';
import { CedarPolicyEditor, CedarSchemaEditor } from '@cedar-policy/cedar-monaco-editor';
import type { Explorer } from 'tpe-explorer-wasm';
import FactsPanel from './FactsPanel';
import PoliciesPanel, { DecisionBanner } from './PoliciesPanel';
import { ExplorerActions, ExplorerContext, errorText } from './context';
import { TPE_EXAMPLES } from './examples';
import { runCvc5 } from './solver';
import type { Explanation, FactState, Model, Suggestion } from './types';
import './styles.scss';

type WasmModule = typeof import('tpe-explorer-wasm');

const EDITOR_HEIGHT = '480px';

function ExplanationModal({ explanation, onClose }: { explanation: Explanation | null; onClose: () => void }) {
    return (
        <Modal
            visible={explanation !== null}
            onDismiss={onClose}
            header="Why?"
            footer={
                <Box float="right">
                    <Button onClick={onClose}>Close</Button>
                </Box>
            }
        >
            {explanation?.decision ? (
                <SpaceBetween size="s">
                    <div>
                        <b>{explanation.decision === 'ALLOW' ? 'Allowed' : 'Denied'}</b>
                        {explanation.reasons?.length
                            ? `, settled by ${explanation.reasons.join(', ')}.`
                            : ', since no permit can apply.'}
                    </div>
                    <div>
                        These {explanation.facts?.length} of the {explanation.known} known facts are enough.
                        Forgetting any one of them leaves the request undecided.
                    </div>
                    <ul className="tpe-assignments">
                        {explanation.facts?.map((f) => (
                            <li key={f}>
                                <code>{f}</code>
                            </li>
                        ))}
                    </ul>
                </SpaceBetween>
            ) : (
                'The known facts do not decide the request yet.'
            )}
        </Modal>
    );
}

export default function TpeExplorer() {
    const [wasm, setWasm] = useState<WasmModule | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const explorer = useRef<Explorer | null>(null);
    const [model, setModel] = useState<Model | null>(null);
    const [exampleId, setExampleId] = useState(TPE_EXAMPLES[0].id);
    const [schema, setSchema] = useState(TPE_EXAMPLES[0].schema);
    const [policies, setPolicies] = useState(TPE_EXAMPLES[0].policies);
    const [loadedSchema, setLoadedSchema] = useState(TPE_EXAMPLES[0].schema);
    const [sourceError, setSourceError] = useState<string | null>(null);
    const [tab, setTab] = useState('explore');
    const [hovered, setHovered] = useState<string | null>(null);
    const [changed, setChanged] = useState<string[]>([]);
    const [explanation, setExplanation] = useState<Explanation | null>(null);

    useEffect(() => {
        import('tpe-explorer-wasm').then(setWasm, (e) => setLoadError(errorText(e)));
    }, []);

    const refresh = useCallback(() => {
        if (explorer.current) setModel(JSON.parse(explorer.current.model()) as Model);
    }, []);

    /** Start over with a schema and policies. Returns an error message, or null. */
    const load = useCallback(
        (s: string, p: string): string | null => {
            if (!wasm) return 'still loading';
            let next: Explorer;
            try {
                next = new wasm.Explorer(s, p);
            } catch (e) {
                return errorText(e);
            }
            explorer.current?.free();
            explorer.current = next;
            setLoadedSchema(s);
            setChanged([]);
            refresh();
            return null;
        },
        [wasm, refresh],
    );

    useEffect(() => {
        if (wasm && !explorer.current) setSourceError(load(schema, policies));
    }, [wasm]);

    // Policy edits apply as you type and keep everything known.
    useEffect(() => {
        if (!explorer.current || schema !== loadedSchema) return;
        const t = setTimeout(() => {
            try {
                explorer.current?.set_policies(policies);
                setSourceError(null);
                refresh();
            } catch (e) {
                setSourceError(errorText(e));
            }
        }, 400);
        return () => clearTimeout(t);
    }, [policies]);

    /** Run an edit; returns an error message or null. */
    const edit = useCallback(
        (f: (ex: Explorer) => void): string | null => {
            const ex = explorer.current;
            if (!ex) return 'still loading';
            try {
                f(ex);
            } catch (e) {
                return errorText(e);
            }
            setChanged([]);
            refresh();
            return null;
        },
        [refresh],
    );

    const undo = () => {
        if (explorer.current?.undo()) {
            setChanged([]);
            refresh();
        }
    };
    const redo = () => {
        if (explorer.current?.redo()) {
            setChanged([]);
            refresh();
        }
    };

    // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y), outside of text fields.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null;
            if (t && (t.closest('input, textarea, [contenteditable="true"], .monaco-editor'))) return;
            if (!(e.ctrlKey || e.metaKey)) return;
            const key = e.key.toLowerCase();
            if (key === 'z' && !e.shiftKey) undo();
            else if ((key === 'z' && e.shiftKey) || key === 'y') redo();
            else return;
            e.preventDefault();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const revealFact = useCallback((key: string) => {
        const el = document.querySelector(`[data-fact-key="${CSS.escape(key)}"]`);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('tpe-fact-revealed');
        void (el as HTMLElement).offsetWidth; // restart the animation
        el.classList.add('tpe-fact-revealed');
        el.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true });
    }, []);

    const actions: ExplorerActions | null = useMemo(() => {
        if (!model) return null;
        const parse = (json: string) => JSON.parse(json) as Suggestion[];
        return {
            model,
            setValue: (key, text) => edit((ex) => ex.set_input(key, text)),
            setState: (key, state: FactState) => edit((ex) => ex.set_state(key, state)),
            setEntityType: (key, type) => edit((ex) => ex.set_entity_type(key, type)),
            suggestFact: async (key) => parse(await explorer.current!.suggest_slot(key, (s) => runCvc5(s))),
            suggestPolicy: async (id) => parse(await explorer.current!.suggest_policy(id, (s) => runCvc5(s))),
            apply: (s) => {
                let effect = '';
                const err = edit((ex) => {
                    effect = ex.apply_suggestion(s.id);
                });
                if (err) return err;
                setChanged(s.slots);
                toast.success(effect ? `Applied: ${effect}` : 'Applied');
                return null;
            },
            revealFact,
            hovered,
            setHovered,
            changed,
        };
    }, [model, hovered, changed, edit, revealFact]);

    if (loadError) {
        return (
            <ContentLayout header={<Header variant="h1">TPE explorer</Header>}>
                <Alert type="error" header="Could not load the explorer">{loadError}</Alert>
            </ContentLayout>
        );
    }

    const example = TPE_EXAMPLES.find((x) => x.id === exampleId);
    const header = (
        <Header
            variant="h1"
            description={
                <>
                    Fill in what you know about an authorization request, and see how each policy partially
                    evaluates. Cedar&apos;s type-aware partial evaluation shows what is decided and what each policy
                    is still waiting on. Suggestions come from Cedar&apos;s symbolic compiler with the CVC5 solver,
                    running in your browser.
                </>
            }
            actions={
                <SpaceBetween direction="horizontal" size="xs">
                    <Select
                        selectedOption={example ? { value: example.id, label: example.label } : null}
                        options={TPE_EXAMPLES.map((x) => ({ value: x.id, label: x.label }))}
                        onChange={({ detail }) => {
                            const ex = TPE_EXAMPLES.find((x) => x.id === detail.selectedOption.value);
                            if (!ex) return;
                            setExampleId(ex.id);
                            setSchema(ex.schema);
                            setPolicies(ex.policies);
                            setSourceError(load(ex.schema, ex.policies));
                        }}
                        ariaLabel="Example"
                    />
                    <Button iconName="undo" ariaLabel="Undo" disabled={!model?.canUndo} onClick={undo} />
                    <Button iconName="redo" ariaLabel="Redo" disabled={!model?.canRedo} onClick={redo} />
                    <Button onClick={() => edit((ex) => ex.reset())}>Start over</Button>
                </SpaceBetween>
            }
        >
            TPE explorer
        </Header>
    );

    return (
        <ContentLayout header={header}>
            {!model || !actions ? (
                <Box textAlign="center" padding="xxl">
                    <Spinner size="large" />
                </Box>
            ) : (
                <ExplorerContext.Provider value={actions}>
                    <Tabs
                        activeTabId={tab}
                        onChange={({ detail }) => setTab(detail.activeTabId)}
                        tabs={[
                            {
                                id: 'explore',
                                label: 'Explore',
                                content: (
                                    <SpaceBetween size="l">
                                        <DecisionBanner
                                            decision={model.decision}
                                            onExplain={() => {
                                                try {
                                                    setExplanation(
                                                        JSON.parse(explorer.current!.explain()) as Explanation,
                                                    );
                                                } catch (e) {
                                                    toast.error(errorText(e));
                                                }
                                            }}
                                        />
                                        {sourceError ? (
                                            <Alert type="warning" header="The policies don't load">
                                                Showing the last version that did.{' '}
                                                <Button variant="inline-link" onClick={() => setTab('source')}>
                                                    Edit policies
                                                </Button>
                                            </Alert>
                                        ) : null}
                                        <div className="tpe-layout">
                                            <div className="tpe-column">
                                                <FactsPanel />
                                            </div>
                                            <div className="tpe-column tpe-column-sticky">
                                                <PoliciesPanel />
                                            </div>
                                        </div>
                                    </SpaceBetween>
                                ),
                            },
                            {
                                id: 'source',
                                label: 'Schema and policies',
                                content: (
                                    <SpaceBetween size="l">
                                        {sourceError ? (
                                            <Alert type="error" header="Not loaded">
                                                <pre className="tpe-error-text">{sourceError}</pre>
                                            </Alert>
                                        ) : null}
                                        <div className="tpe-layout">
                                            <Container
                                                header={
                                                    <Header
                                                        variant="h2"
                                                        description="Changes apply as you type and keep what is known."
                                                    >
                                                        Policies
                                                    </Header>
                                                }
                                            >
                                                <CedarPolicyEditor
                                                    value={policies}
                                                    onChange={setPolicies}
                                                    schema={{ type: 'cedarFormat', value: loadedSchema }}
                                                    height={EDITOR_HEIGHT}
                                                />
                                            </Container>
                                            <Container
                                                header={
                                                    <Header
                                                        variant="h2"
                                                        description="A new schema starts over with nothing known."
                                                        actions={
                                                            <Button
                                                                disabled={schema === loadedSchema}
                                                                onClick={() => setSourceError(load(schema, policies))}
                                                            >
                                                                Apply schema
                                                            </Button>
                                                        }
                                                    >
                                                        Schema
                                                    </Header>
                                                }
                                            >
                                                <CedarSchemaEditor
                                                    value={schema}
                                                    onChange={setSchema}
                                                    height={EDITOR_HEIGHT}
                                                />
                                            </Container>
                                        </div>
                                    </SpaceBetween>
                                ),
                            },
                        ]}
                    />
                    <ExplanationModal explanation={explanation} onClose={() => setExplanation(null)} />
                </ExplorerContext.Provider>
            )}
        </ContentLayout>
    );
}

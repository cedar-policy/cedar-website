import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    ContentLayout,
    FormField,
    Header,
    Input,
    InputProps,
    Modal,
    RadioGroup,
    SegmentedControl,
    Select,
    SpaceBetween,
    Spinner,
    Tabs,
    Textarea,
} from '@cloudscape-design/components';
import type { Explorer } from 'tpe-explorer-wasm';
import { TPE_EXAMPLES } from './examples';
import { runCvc5 } from './solver';
import type { DocLine, EditState, Explanation, SlotInfo, Span, Suggestion, View } from './types';
import './styles.scss';

type WasmModule = typeof import('tpe-explorer-wasm');
type Focus = 'facts' | 'residuals';
type Tab = 'residuals' | 'policies' | 'schema';

interface SuggestState {
    title: string;
    subtitle: string;
    loading: boolean;
    items: Suggestion[];
    selected: number;
    error?: string;
}

const GUTTER: Record<string, string> = {
    none: '  ',
    bare: '',
    needed: '◀ ',
    residual: '◆ ',
    satisfied: '✓ ',
    not: '× ',
    error: '! ',
};

/** Do two slot keys overlap (one is the other, or contains it)? */
function related(a: string, b: string): boolean {
    if (a === b) return true;
    try {
        const x = JSON.parse(a) as unknown[];
        const y = JSON.parse(b) as unknown[];
        const prefix = (p: unknown, q: unknown) =>
            Array.isArray(p) && Array.isArray(q) && p.every((v, i) => q[i] === v);
        if (x[0] === 'context' && y[0] === 'context') {
            return prefix(x[1], y[1]) || prefix(y[1], x[1]);
        }
        if (x[0] === 'attr' && y[0] === 'attr' && x[1] === y[1]) {
            return prefix(x[2], y[2]) || prefix(y[2], x[2]);
        }
        if (x[1] === y[1] && ((x[0] === 'tags' && y[0] === 'tag') || (x[0] === 'tag' && y[0] === 'tags'))) {
            return true;
        }
    } catch {
        // not a slot key
    }
    return false;
}

function errorText(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}

interface DocViewProps {
    lines: DocLine[];
    selectedSlot?: string | null;
    selectedPolicy?: string | null;
    editing?: boolean;
    changed?: string[];
    /** Underline spans displaying these slots. */
    underlineSlots?: string[];
    /** Underline spans depending on this slot. */
    underlineMarksOf?: string | null;
    onSlot?: (key: string) => void;
    onPolicy?: (id: string) => void;
    preRef?: React.Ref<HTMLPreElement>;
}

function DocView(props: DocViewProps) {
    const { lines, selectedSlot, selectedPolicy, editing, changed = [], underlineSlots = [], underlineMarksOf } = props;
    const renderSpan = (s: Span, i: number) => {
        const classes = [`tpe-s-${s.style}`];
        if (underlineMarksOf && s.marks.some((m) => related(m, underlineMarksOf))) classes.push('tpe-underline');
        if (s.slot) {
            if (underlineSlots.some((u) => related(u, s.slot!))) classes.push('tpe-underline');
            if (changed.includes(s.slot) && !(editing && s.slot === selectedSlot)) classes.push('tpe-changed');
            else if (s.slot === selectedSlot) {
                classes.push(editing ? 'tpe-editing' : 'tpe-selected');
            }
            const key = s.slot;
            return (
                <button
                    key={i}
                    type="button"
                    className={`tpe-slot ${classes.join(' ')}`}
                    onClick={() => props.onSlot?.(key)}
                >
                    {s.text}
                </button>
            );
        }
        return (
            <span key={i} className={classes.join(' ')}>
                {s.text}
            </span>
        );
    };
    return (
        <pre className="tpe-doc" ref={props.preRef}>
            {lines.map((l, i) => {
                const gutter = GUTTER[l.gutter] ?? '  ';
                const policy = l.policy;
                const gutterEl = policy ? (
                    <button
                        type="button"
                        className={`tpe-slot tpe-gutter tpe-g-${l.gutter} ${policy === selectedPolicy ? 'tpe-selected' : ''}`}
                        onClick={() => props.onPolicy?.(policy)}
                        aria-label={`select policy ${policy}`}
                    >
                        {gutter.trimEnd()}
                    </button>
                ) : (
                    <span className={`tpe-gutter tpe-g-${l.gutter}`}>{gutter.trimEnd()}</span>
                );
                return (
                    <div key={i} className={`tpe-line ${l.dim ? 'tpe-dim' : ''}`}>
                        {gutterEl}
                        {gutter.length > 1 ? ' ' : ''}
                        {policy ? (
                            <button type="button" className="tpe-slot tpe-policy-title" onClick={() => props.onPolicy?.(policy)}>
                                {l.spans.map(renderSpan)}
                            </button>
                        ) : (
                            l.spans.map(renderSpan)
                        )}
                        {'\n'}
                    </div>
                );
            })}
        </pre>
    );
}

export default function TpeExplorer() {
    const [wasm, setWasm] = useState<WasmModule | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const explorerRef = useRef<Explorer | null>(null);
    const [example, setExample] = useState(TPE_EXAMPLES[0].id);
    const [schemaText, setSchemaText] = useState(TPE_EXAMPLES[0].schema);
    const [policiesText, setPoliciesText] = useState(TPE_EXAMPLES[0].policies);
    const [projectError, setProjectError] = useState<string | null>(null);
    const [view, setView] = useState<View | null>(null);
    const [focus, setFocus] = useState<Focus>('facts');
    const [tab, setTab] = useState<Tab>('residuals');
    const [selSlot, setSelSlot] = useState<string | null>(null);
    const [selPolicy, setSelPolicy] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const [changed, setChanged] = useState<string[]>([]);
    const [suggest, setSuggest] = useState<SuggestState | null>(null);
    const [explanation, setExplanation] = useState<Explanation | null>(null);
    const [width, setWidth] = useState(70);
    const residualPre = useRef<HTMLPreElement>(null);
    const valueInput = useRef<InputProps.Ref>(null);

    // Load the WASM bindings.
    useEffect(() => {
        import('tpe-explorer-wasm').then(setWasm, (e) => setLoadError(errorText(e)));
    }, []);

    const refresh = useCallback(() => {
        const ex = explorerRef.current;
        if (!ex) return;
        setView(JSON.parse(ex.view(width)) as View);
    }, [width]);

    const loadProject = useCallback(
        (schema: string, policies: string, keepFacts: boolean) => {
            if (!wasm) return;
            const facts = keepFacts ? explorerRef.current?.export_facts() : undefined;
            let next: Explorer;
            try {
                try {
                    next = new wasm.Explorer(schema, policies, facts ?? null);
                } catch (e) {
                    if (!facts) throw e;
                    // The facts no longer fit the schema; start over.
                    next = new wasm.Explorer(schema, policies, null);
                }
            } catch (e) {
                setProjectError(errorText(e));
                return;
            }
            explorerRef.current?.free();
            explorerRef.current = next;
            setProjectError(null);
            setChanged([]);
            setFlash(keepFacts ? 'reloaded' : null);
            const v = JSON.parse(next.view(width)) as View;
            setView(v);
            setSelSlot((s) => (s && v.slotOrder.includes(s) ? s : v.slotOrder[0] ?? null));
            setSelPolicy(v.policyOrder[0] ?? null);
        },
        [wasm, width],
    );

    useEffect(() => {
        if (wasm && !explorerRef.current) loadProject(schemaText, policiesText, false);
    }, [wasm]);

    useEffect(() => refresh(), [width]);

    // Fit residuals to the pane width.
    useEffect(() => {
        const pre = residualPre.current;
        if (!pre) return;
        const probe = document.createElement('span');
        probe.textContent = '0'.repeat(50);
        probe.style.visibility = 'hidden';
        probe.style.position = 'absolute';
        pre.appendChild(probe);
        const charWidth = probe.getBoundingClientRect().width / 50 || 8;
        pre.removeChild(probe);
        const obs = new ResizeObserver(() => {
            const w = Math.max(30, Math.floor(pre.clientWidth / charWidth) - 1);
            setWidth((old) => (old === w ? old : w));
        });
        obs.observe(pre);
        return () => obs.disconnect();
    }, [view !== null, tab]);

    const slotInfo: SlotInfo | null = useMemo(() => {
        const ex = explorerRef.current;
        if (!ex || !selSlot || !view) return null;
        try {
            return JSON.parse(ex.slot_info(selSlot)) as SlotInfo;
        } catch {
            return null;
        }
    }, [selSlot, view]);

    // Reset the editor when the selection (or the facts) change.
    useEffect(() => {
        if (!slotInfo) return;
        setInput(slotInfo.text);
        setInputError(null);
    }, [selSlot, slotInfo?.current, slotInfo?.text]);

    const policyNeeds: string[] = useMemo(() => {
        const ex = explorerRef.current;
        if (!ex || !selPolicy || focus !== 'residuals') return [];
        return JSON.parse(ex.policy_needs(selPolicy)) as string[];
    }, [selPolicy, focus, view]);

    /** After an edit, move to the next fact a relevant policy still needs. */
    const advance = (v: View, from: string) => {
        const needed: string[] = [];
        v.facts.forEach((l) => {
            if (l.gutter === 'needed') l.spans.forEach((s) => s.slot && needed.push(s.slot));
        });
        const start = v.slotOrder.indexOf(from);
        const next = v.slotOrder.slice(start + 1).find((k) => needed.includes(k));
        if (next) setSelSlot(next);
    };

    const commit = (action: (ex: Explorer) => void) => {
        const ex = explorerRef.current;
        if (!ex || !selSlot) return;
        try {
            action(ex);
            setInputError(null);
            setChanged([]);
            setFlash(null);
            const v = JSON.parse(ex.view(width)) as View;
            setView(v);
            advance(v, selSlot);
        } catch (e) {
            setInputError(errorText(e));
        }
    };

    const setValue = () => commit((ex) => ex.set_input(selSlot!, input));
    const setStateOf = (st: EditState) => {
        if (st === 'value') valueInput.current?.focus();
        else commit((ex) => ex.set_state(selSlot!, st));
    };

    const undo = () => {
        if (explorerRef.current?.undo()) {
            setChanged([]);
            setFlash('undo');
            refresh();
        }
    };
    const redo = () => {
        if (explorerRef.current?.redo()) {
            setChanged([]);
            setFlash('redo');
            refresh();
        }
    };

    const runSuggest = async (target: { slot: string } | { policy: string }) => {
        const ex = explorerRef.current;
        if (!ex) return;
        const isSlot = 'slot' in target;
        setSuggest({
            title: isSlot ? `assignments for ${slotInfo?.label ?? ''}` : `bindings that settle «${target.policy}»`,
            subtitle: isSlot ? 'each sets this field alone' : 'fewest fields that settle it',
            loading: true,
            items: [],
            selected: 0,
        });
        try {
            const json = isSlot
                ? await ex.suggest_slot(target.slot, (s) => runCvc5(s))
                : await ex.suggest_policy(target.policy, (s) => runCvc5(s));
            const items = JSON.parse(json) as Suggestion[];
            setSuggest((s) => s && {
                ...s,
                loading: false,
                items,
                error: items.length
                    ? undefined
                    : isSlot
                        ? 'No value for this field changes anything on its own. Try settling a policy instead.'
                        : 'This policy is already settled, or no assignment could be found.',
            });
        } catch (e) {
            setSuggest((s) => s && { ...s, loading: false, error: errorText(e) });
        }
    };

    const applySuggestion = () => {
        const ex = explorerRef.current;
        if (!ex || !suggest) return;
        try {
            const effect = ex.apply_suggestion(suggest.selected);
            setChanged(suggest.items[suggest.selected]?.slots ?? []);
            setFlash(`applied: ${effect}`);
            setSuggest(null);
            setFocus('facts');
            refresh();
        } catch (e) {
            setSuggest((s) => s && { ...s, error: errorText(e) });
        }
    };

    const exportFacts = () => {
        const ex = explorerRef.current;
        if (!ex) return;
        const blob = new Blob([ex.export_facts()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'facts.tpe.json';
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const explain = () => {
        const ex = explorerRef.current;
        if (!ex) return;
        try {
            setExplanation(JSON.parse(ex.explain()) as Explanation);
        } catch (e) {
            setFlash(errorText(e));
        }
    };

    // Keyboard shortcuts, mirroring the terminal UI.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            if (suggest || explanation || !view) return;
            const move = (delta: number) => {
                if (focus === 'facts') {
                    const i = selSlot ? view.slotOrder.indexOf(selSlot) : -1;
                    const j = Math.max(0, Math.min(view.slotOrder.length - 1, i + delta));
                    setSelSlot(view.slotOrder[j] ?? null);
                } else {
                    const i = selPolicy ? view.policyOrder.indexOf(selPolicy) : -1;
                    const j = Math.max(0, Math.min(view.policyOrder.length - 1, i + delta));
                    setSelPolicy(view.policyOrder[j] ?? null);
                }
            };
            const handled = (() => {
                switch (e.key) {
                    case 'ArrowDown': case 'j': move(1); return true;
                    case 'ArrowUp': case 'k': move(-1); return true;
                    case 'ArrowLeft': case 'ArrowRight': case 'h': case 'l':
                        setFocus((f) => (f === 'facts' ? 'residuals' : 'facts'));
                        setTab('residuals');
                        return true;
                    case 'Enter':
                        if (focus === 'facts') {
                            valueInput.current?.focus();
                        } else if (selPolicy) runSuggest({ policy: selPolicy });
                        return true;
                    case 's':
                        if (focus === 'facts' && selSlot) runSuggest({ slot: selSlot });
                        else if (selPolicy) runSuggest({ policy: selPolicy });
                        return true;
                    case 'u': undo(); return true;
                    case 'r': redo(); return true;
                    case 'Escape': setChanged([]); setFlash(null); return true;
                    default: return false;
                }
            })();
            if (handled) e.preventDefault();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    if (loadError) {
        return (
            <ContentLayout header={<Header variant="h1">TPE explorer</Header>}>
                <Alert type="error" header="Could not load the explorer">{loadError}</Alert>
            </ContentLayout>
        );
    }

    const status = view?.status;
    const decision = status?.decision;
    const badge = decision === 'allow' ? 'ALLOW' : decision === 'deny' ? 'DENY' : 'UNKNOWN';
    const statusLine = !status ? null : status.failure ? (
        <span className="tpe-s-error">{status.failure}</span>
    ) : decision ? (
        <>
            <span className={`tpe-reasons tpe-reasons-${decision}`}>
                {status.reasons?.length ? status.reasons.join(', ') : 'no permit applies'}
            </span>
            {status.irrelevant ? (
                <span className="tpe-s-muted">
                    {' '}· {status.irrelevant} {status.irrelevant === 1 ? 'policy' : 'policies'} no longer matter
                </span>
            ) : null}
        </>
    ) : (
        <span>
            {status.residual} residual · {status.satisfied} satisfied · {status.not} not · {status.error ?? 0} error
        </span>
    );

    const bottomMessage = !status
        ? null
        : focus === 'facts' && slotInfo
            ? slotInfo.need
            : status.settled ?? null;
    const messageClass = bottomMessage && /^(needed|blocked)/.test(bottomMessage) ? 'tpe-need' : 'tpe-s-muted';

    return (
        <ContentLayout
            header={
                <Header
                    variant="h1"
                    description={
                        'Build up a partial authorization request on the left and watch the policies partially ' +
                        'evaluate on the right (type-aware partial evaluation). Suggestions use Cedar\'s symbolic ' +
                        'compiler with CVC5, running in your browser.'
                    }
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Select
                                selectedOption={{
                                    value: example,
                                    label: TPE_EXAMPLES.find((x) => x.id === example)?.label,
                                }}
                                options={TPE_EXAMPLES.map((x) => ({ value: x.id, label: x.label }))}
                                onChange={({ detail }) => {
                                    const ex = TPE_EXAMPLES.find((x) => x.id === detail.selectedOption.value);
                                    if (!ex) return;
                                    setExample(ex.id);
                                    setSchemaText(ex.schema);
                                    setPoliciesText(ex.policies);
                                    loadProject(ex.schema, ex.policies, false);
                                }}
                            />
                        </SpaceBetween>
                    }
                >
                    TPE explorer
                </Header>
            }
        >
            <div className="tpe-explorer">
                {!view ? (
                    <Box textAlign="center" padding="xxl">
                        <Spinner size="large" />
                    </Box>
                ) : (
                    <SpaceBetween size="s">
                        <div className="tpe-status">
                            <span className={`tpe-badge tpe-badge-${decision ?? 'unknown'}`}>{badge}</span>
                            {statusLine}
                            {flash ? <span className="tpe-s-muted tpe-flash">{flash}</span> : null}
                            <span className="tpe-status-actions">
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button iconName="undo" disabled={!view.canUndo} onClick={undo}>Undo</Button>
                                    <Button iconName="redo" disabled={!view.canRedo} onClick={redo}>Redo</Button>
                                    <Button disabled={!decision} onClick={explain}>Explain</Button>
                                    <Button iconName="download" onClick={exportFacts}>Export facts</Button>
                                </SpaceBetween>
                            </span>
                        </div>
                        {projectError ? (
                            <Alert type="error" header="Schema or policies don't load">
                                <pre className="tpe-error-text">{projectError}</pre>
                            </Alert>
                        ) : null}
                        {status?.warnings?.map((w) => (
                            <Alert key={w} type="warning">{w}</Alert>
                        ))}
                        <div className="tpe-panes">
                            <div
                                className={`tpe-pane ${focus === 'facts' ? 'tpe-focused' : ''}`}
                                onFocusCapture={() => setFocus('facts')}
                                onMouseDownCapture={() => setFocus('facts')}
                            >
                                <div className="tpe-pane-title">Facts</div>
                                <DocView
                                    lines={view.facts}
                                    selectedSlot={focus === 'facts' ? selSlot : null}
                                    editing={focus === 'facts' && input !== slotInfo?.text}
                                    changed={focus === 'facts' ? changed : []}
                                    underlineSlots={policyNeeds}
                                    onSlot={(k) => {
                                        setSelSlot(k);
                                        setFocus('facts');
                                    }}
                                />
                            </div>
                            <div
                                className={`tpe-pane ${focus === 'residuals' ? 'tpe-focused' : ''}`}
                                onMouseDownCapture={() => setFocus('residuals')}
                            >
                                <Tabs
                                    activeTabId={tab}
                                    onChange={({ detail }) => setTab(detail.activeTabId as Tab)}
                                    tabs={[
                                        {
                                            id: 'residuals',
                                            label: 'Residuals',
                                            content: (
                                                <DocView
                                                    preRef={residualPre}
                                                    lines={view.residuals}
                                                    selectedPolicy={focus === 'residuals' ? selPolicy : null}
                                                    underlineMarksOf={focus === 'facts' ? selSlot : null}
                                                    onPolicy={(id) => {
                                                        setSelPolicy(id);
                                                        setFocus('residuals');
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            id: 'policies',
                                            label: 'Policies',
                                            content: (
                                                <SourceEditor
                                                    value={policiesText}
                                                    onChange={setPoliciesText}
                                                    onApply={() => loadProject(schemaText, policiesText, true)}
                                                />
                                            ),
                                        },
                                        {
                                            id: 'schema',
                                            label: 'Schema',
                                            content: (
                                                <SourceEditor
                                                    value={schemaText}
                                                    onChange={setSchemaText}
                                                    onApply={() => loadProject(schemaText, policiesText, true)}
                                                />
                                            ),
                                        },
                                    ]}
                                />
                                {focus === 'residuals' && selPolicy ? (
                                    <Box padding={{ top: 's' }}>
                                        <Button onClick={() => void runSuggest({ policy: selPolicy })}>
                                            Suggest bindings that settle «{selPolicy}»
                                        </Button>
                                    </Box>
                                ) : null}
                            </div>
                        </div>
                        <Container
                            header={
                                <Header variant="h3">
                                    {focus === 'facts' && slotInfo ? slotInfo.label : 'nothing selected'}
                                </Header>
                            }
                        >
                            {focus === 'facts' && slotInfo ? (
                                <SpaceBetween size="s">
                                    <SegmentedControl
                                        selectedId={slotInfo.current}
                                        onChange={({ detail }) => setStateOf(detail.selectedId as EditState)}
                                        options={slotInfo.states.map((s, i) => ({
                                            id: s.state,
                                            text: `${i + 1}: ${s.label}`,
                                            disabled: !s.allowed,
                                        }))}
                                    />
                                    <FormField errorText={inputError ?? undefined}>
                                        <SpaceBetween direction="horizontal" size="xs">
                                            <span className="tpe-prompt">{slotInfo.prompt}</span>
                                            <Input
                                                ref={valueInput}
                                                value={input}
                                                onChange={({ detail }) => setInput(detail.value)}
                                                onKeyDown={({ detail }) => {
                                                    if (detail.key === 'Enter') setValue();
                                                }}
                                                placeholder="type a value"
                                            />
                                            <Button onClick={setValue}>Set</Button>
                                            <Button onClick={() => void runSuggest({ slot: selSlot! })}>
                                                Suggest values
                                            </Button>
                                        </SpaceBetween>
                                    </FormField>
                                    {bottomMessage ? <div className={messageClass}>{bottomMessage}</div> : null}
                                </SpaceBetween>
                            ) : (
                                <div className={messageClass}>
                                    {bottomMessage ?? 'Select a fact on the left, or a policy on the right.'}
                                </div>
                            )}
                            <Box variant="small" color="text-body-secondary" padding={{ top: 's' }}>
                                Keys: ↑↓ move · ←→ switch pane · ⏎ edit / suggest · s suggest · u undo · r redo ·
                                esc clear highlight. ◀ marks facts a policy still needs.
                            </Box>
                        </Container>
                    </SpaceBetween>
                )}
            </div>
            <Modal
                visible={suggest !== null}
                onDismiss={() => setSuggest(null)}
                header="Suggest"
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setSuggest(null)}>Close</Button>
                            <Button
                                variant="primary"
                                disabled={!suggest || suggest.loading || suggest.items.length === 0}
                                onClick={applySuggestion}
                            >
                                Apply
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                {suggest ? (
                    <SpaceBetween size="s">
                        <div>
                            <div className="tpe-suggest-title">{suggest.title}</div>
                            <Box variant="small" color="text-body-secondary">{suggest.subtitle}</Box>
                        </div>
                        {suggest.loading ? (
                            <Box>
                                <Spinner /> Solving with SymCC + CVC5… (the first use downloads the solver, ~28 MB)
                            </Box>
                        ) : null}
                        {suggest.error ? <Alert type="info">{suggest.error}</Alert> : null}
                        {suggest.items.length ? (
                            <RadioGroup
                                value={String(suggest.selected)}
                                onChange={({ detail }) =>
                                    setSuggest((s) => s && { ...s, selected: Number(detail.value) })
                                }
                                items={suggest.items.map((it, i) => ({
                                    value: String(i),
                                    label: (
                                        <div className="tpe-assignments">
                                            {it.assignments.map((a) => <div key={a}>{a}</div>)}
                                        </div>
                                    ),
                                    description: (
                                        <div className="tpe-effects">
                                            {it.effects.map((e) => <div key={e}>→ {e}</div>)}
                                        </div>
                                    ),
                                }))}
                            />
                        ) : null}
                    </SpaceBetween>
                ) : null}
            </Modal>
            <Modal
                visible={explanation !== null}
                onDismiss={() => setExplanation(null)}
                header="Why?"
                footer={
                    <Box float="right">
                        <Button onClick={() => setExplanation(null)}>Close</Button>
                    </Box>
                }
            >
                {explanation?.decision ? (
                    <SpaceBetween size="s">
                        <div>
                            <b>{explanation.decision}</b>
                            {explanation.reasons?.length
                                ? `, settled by ${explanation.reasons.join(', ')}`
                                : ', since no permit can apply'}
                        </div>
                        <div>
                            These {explanation.facts?.length} of the {explanation.known} known facts suffice;
                            dropping any one leaves the request undecided:
                        </div>
                        <div className="tpe-assignments">
                            {explanation.facts?.map((f) => <div key={f}>{f}</div>)}
                        </div>
                    </SpaceBetween>
                ) : (
                    'The known facts do not decide the request yet.'
                )}
            </Modal>
        </ContentLayout>
    );
}

function SourceEditor(props: { value: string; onChange: (v: string) => void; onApply: () => void }) {
    return (
        <SpaceBetween size="xs">
            <Textarea
                value={props.value}
                onChange={({ detail }) => props.onChange(detail.value)}
                rows={22}
                spellcheck={false}
                className="tpe-source"
            />
            <Button onClick={props.onApply}>Apply changes</Button>
        </SpaceBetween>
    );
}

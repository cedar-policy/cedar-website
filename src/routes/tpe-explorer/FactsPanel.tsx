import React, { useEffect, useState } from 'react';
import {
    Autosuggest,
    Badge,
    Box,
    Button,
    ButtonDropdown,
    Container,
    Header,
    Input,
    Select,
    SpaceBetween,
    TokenGroup,
} from '@cloudscape-design/components';
import Suggestions from './Suggestions';
import { basename, related, shortUid, useExplorer } from './context';
import type { ActionFact, EntityModel, FactState, Field, Needs, ParentsFact, TagsFact, UidFact } from './types';

/** How a non-value state reads in an empty input. */
function stateText(state: FactState, required: boolean): string {
    switch (state) {
        case 'present': return required ? 'unknown' : 'exists, value unknown';
        case 'absent': return 'absent';
        case 'unknown': return required ? 'unknown' : 'unknown (may not exist)';
        default: return '';
    }
}

function NeedBadge({ needs }: { needs: Needs | null }) {
    if (!needs) return null;
    const who = needs.policies.map((p) => `«${p}»`).join(', ');
    const text = needs.kind === 'blocked' ? 'needed first' : 'needed';
    return (
        <span className="tpe-need" title={needs.message}>
            <Badge color="blue">{text}</Badge>
            <span className="tpe-need-who">{who}</span>
        </span>
    );
}

interface RowProps {
    factKey: string;
    needs: Needs | null;
    name: React.ReactNode;
    editor: React.ReactNode;
    error?: string | null;
    /** Offer solver suggestions for this fact. */
    suggest?: boolean;
    depth?: number;
}

/** One fact: name, editor, and whether a policy still needs it. */
function FactRow(props: RowProps) {
    const { hovered, setHovered, changed, suggestFact } = useExplorer();
    const [suggesting, setSuggesting] = useState(false);
    const classes = ['tpe-fact'];
    if (props.needs) classes.push('tpe-fact-needed');
    if (related(hovered, props.factKey)) classes.push('tpe-fact-hovered');
    if (changed.includes(props.factKey)) classes.push('tpe-fact-changed');
    return (
        <div
            className={classes.join(' ')}
            data-fact-key={props.factKey}
            style={{ paddingLeft: `${(props.depth ?? 0) * 20 + 8}px` }}
            onMouseEnter={() => setHovered(props.factKey)}
            onMouseLeave={() => setHovered(null)}
        >
            <div className="tpe-fact-main">
                <div className="tpe-fact-name">{props.name}</div>
                <div className="tpe-fact-editor">{props.editor}</div>
                <div className="tpe-fact-meta">
                    <NeedBadge needs={props.needs} />
                    {props.suggest ? (
                        <Button variant="inline-link" onClick={() => setSuggesting((s) => !s)}>
                            {suggesting ? 'Hide suggestions' : 'Suggest'}
                        </Button>
                    ) : null}
                </div>
            </div>
            {props.error ? <div className="tpe-fact-error">{props.error}</div> : null}
            {suggesting ? (
                <div className="tpe-fact-suggestions">
                    <Suggestions
                        load={() => suggestFact(props.factKey)}
                        emptyText="No value for this fact changes anything on its own. Try settling a policy instead."
                        onApplied={() => setSuggesting(false)}
                    />
                </div>
            ) : null}
        </div>
    );
}

/** Menu for putting a fact into one of its non-value states. */
function StateMenu(props: { factKey: string; allowed: FactState[]; required: boolean; current: FactState }) {
    const { setState } = useExplorer();
    const items = props.allowed
        .filter((s) => s !== 'value')
        .map((s) => ({ id: s, text: `Set to ${stateText(s, props.required)}`, disabled: s === props.current }));
    if (!items.length) return null;
    return (
        <ButtonDropdown
            variant="icon"
            ariaLabel="Change what is known"
            items={items}
            onItemClick={({ detail }) => setState(props.factKey, detail.id as FactState)}
        />
    );
}

/** A text input that commits on Enter or blur. */
function CommitInput(props: {
    value: string;
    placeholder: string;
    onCommit: (text: string) => void;
    options?: string[];
    inputMode?: 'numeric';
    ariaLabel: string;
}) {
    const [text, setText] = useState(props.value);
    useEffect(() => setText(props.value), [props.value]);
    const commit = () => {
        if (text !== props.value) props.onCommit(text);
    };
    if (props.options) {
        return (
            <Autosuggest
                value={text}
                onChange={({ detail }) => setText(detail.value)}
                onSelect={({ detail }) => {
                    setText(detail.value);
                    if (detail.value !== props.value) props.onCommit(detail.value);
                }}
                onBlur={commit}
                onKeyDown={({ detail }) => detail.key === 'Enter' && commit()}
                options={props.options.map((o) => ({ value: o }))}
                placeholder={props.placeholder}
                enteredTextLabel={(v) => `Use "${v}"`}
                ariaLabel={props.ariaLabel}
                empty="Type an id"
            />
        );
    }
    return (
        <Input
            value={text}
            onChange={({ detail }) => setText(detail.value)}
            onBlur={commit}
            onKeyDown={({ detail }) => detail.key === 'Enter' && commit()}
            placeholder={props.placeholder}
            inputMode={props.inputMode}
            ariaLabel={props.ariaLabel}
        />
    );
}

function FieldRows({ field, depth }: { field: Field; depth: number }) {
    const { setValue, setState, model } = useExplorer();
    const [error, setError] = useState<string | null>(null);
    const known = field.state === 'value';
    const placeholder = stateText(field.state, field.required);
    const name = (
        <>
            <code className="tpe-name">{field.name}</code>
            {field.required ? null : <span className="tpe-optional" title="optional">?</span>}
            <span className="tpe-type">{field.typeName}</span>
        </>
    );
    const commit = (text: string) => {
        if (text.trim() === '') {
            // Clearing a known value makes it unknown again.
            setError(known ? setState(field.key, field.required ? 'present' : 'unknown') : null);
        } else {
            setError(setValue(field.key, text));
        }
    };

    if (field.kind === 'record') {
        const open = field.state === 'value' || field.state === 'present';
        return (
            <>
                <FactRow
                    factKey={field.key}
                    needs={field.required ? null : field.needs}
                    depth={depth}
                    name={name}
                    error={error}
                    editor={
                        <SpaceBetween direction="horizontal" size="xxs" alignItems="center">
                            {open ? null : <span className="tpe-state-text">{placeholder}</span>}
                            {!field.required && !open ? (
                                <Button variant="inline-link" onClick={() => setError(setState(field.key, 'present'))}>
                                    It exists
                                </Button>
                            ) : null}
                            <StateMenu
                                factKey={field.key}
                                allowed={field.allowedStates}
                                required={field.required}
                                current={field.state}
                            />
                        </SpaceBetween>
                    }
                />
                {open ? field.children?.map((c) => <FieldRows key={c.key} field={c} depth={depth + 1} />) : null}
            </>
        );
    }

    let editor: React.ReactNode;
    if (field.valueKind === 'bool') {
        const options = [{ value: 'true', label: 'true' }, { value: 'false', label: 'false' }];
        editor = (
            <Select
                selectedOption={known ? { value: field.text, label: field.text } : null}
                options={options}
                placeholder={placeholder}
                onChange={({ detail }) => setError(setValue(field.key, detail.selectedOption.value ?? ''))}
                ariaLabel={field.label}
            />
        );
    } else {
        const ids = field.entityType ? model.knownIds[field.entityType] ?? [] : undefined;
        editor = (
            <CommitInput
                value={field.text}
                placeholder={placeholder}
                onCommit={commit}
                options={ids}
                inputMode={field.valueKind === 'long' ? 'numeric' : undefined}
                ariaLabel={field.label}
            />
        );
    }
    return (
        <FactRow
            factKey={field.key}
            needs={field.needs}
            depth={depth}
            name={name}
            error={error}
            suggest={field.state !== 'value' || field.needs !== null}
            editor={
                <SpaceBetween direction="horizontal" size="xxs" alignItems="center">
                    {editor}
                    <StateMenu
                        factKey={field.key}
                        allowed={field.allowedStates}
                        required={field.required}
                        current={field.state}
                    />
                </SpaceBetween>
            }
        />
    );
}

function UidRow({ name, fact }: { name: string; fact: UidFact }) {
    const { setValue, setState, setEntityType, model } = useExplorer();
    const [error, setError] = useState<string | null>(null);
    const typeSelect =
        fact.typeOptions.length > 1 ? (
            <Select
                selectedOption={{ value: fact.entityType, label: basename(fact.entityType) }}
                options={fact.typeOptions.map((t) => ({ value: t, label: basename(t), description: t }))}
                onChange={({ detail }) => setError(setEntityType(fact.key, detail.selectedOption.value ?? ''))}
                ariaLabel={`${name} type`}
            />
        ) : (
            <span className="tpe-type" title={fact.entityType}>{basename(fact.entityType)}</span>
        );
    return (
        <FactRow
            factKey={fact.key}
            needs={fact.needs}
            name={<code className="tpe-name">{name}</code>}
            error={error}
            suggest={fact.state !== 'value'}
            editor={
                <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                    {typeSelect}
                    <CommitInput
                        value={fact.text}
                        placeholder="unknown id"
                        options={model.knownIds[fact.entityType] ?? []}
                        onCommit={(t) => setError(t.trim() ? setValue(fact.key, t) : setState(fact.key, 'unknown'))}
                        ariaLabel={`${name} id`}
                    />
                </SpaceBetween>
            }
        />
    );
}

function ActionRow({ fact }: { fact: ActionFact }) {
    const { setValue } = useExplorer();
    const [error, setError] = useState<string | null>(null);
    return (
        <FactRow
            factKey={fact.key}
            needs={null}
            name={<code className="tpe-name">action</code>}
            error={error}
            editor={
                <Select
                    selectedOption={{ value: fact.text, label: shortUid(fact.text) }}
                    options={fact.options.map((o) => ({ value: o, label: shortUid(o), description: o }))}
                    onChange={({ detail }) => setError(setValue(fact.key, detail.selectedOption.value ?? ''))}
                    ariaLabel="action"
                />
            }
        />
    );
}

function ParentsRow({ fact }: { fact: ParentsFact }) {
    const { setValue, setState, model } = useExplorer();
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState('');
    const known = fact.state !== 'unknown';
    const setParents = (values: string[]) =>
        setError(values.length ? setValue(fact.key, `[${values.join(', ')}]`) : setState(fact.key, 'absent'));
    const candidates = fact.allowedTypes.flatMap((t) =>
        (model.knownIds[t] ?? []).map((id) => `${t}::${JSON.stringify(id)}`),
    );
    const single = fact.allowedTypes.length === 1 ? fact.allowedTypes[0] : null;
    const add = (text: string) => {
        const t = text.trim();
        if (!t) return;
        // A bare id is fine when there's only one possible parent type.
        const uid = t.includes('::') || !single ? t : `${single}::${JSON.stringify(t)}`;
        setAdding('');
        setParents([...fact.values, uid]);
    };
    return (
        <FactRow
            factKey={fact.key}
            needs={fact.needs}
            name={
                <>
                    <code className="tpe-name">parents</code>
                    <span className="tpe-type">{fact.allowedTypes.map(basename).join(' | ')}</span>
                </>
            }
            error={error}
            suggest
            editor={
                <SpaceBetween size="xxs">
                    {known && fact.values.length ? (
                        <TokenGroup
                            items={fact.values.map((v) => ({ label: shortUid(v), description: v }))}
                            onDismiss={({ detail }) =>
                                setParents(fact.values.filter((_, i) => i !== detail.itemIndex))
                            }
                        />
                    ) : (
                        <span className="tpe-state-text">{known ? 'no parents' : 'unknown'}</span>
                    )}
                    <SpaceBetween direction="horizontal" size="xxs" alignItems="center">
                        <Autosuggest
                            value={adding}
                            onChange={({ detail }) => setAdding(detail.value)}
                            onSelect={({ detail }) => add(detail.value)}
                            onKeyDown={({ detail }) => detail.key === 'Enter' && add(adding)}
                            options={candidates.filter((c) => !fact.values.includes(c)).map((c) => ({ value: c }))}
                            placeholder={single ? `add a ${basename(single)}` : 'add a parent'}
                            enteredTextLabel={(v) => `Add "${v}"`}
                            ariaLabel="add a parent"
                            empty="Type an id"
                        />
                        <StateMenu factKey={fact.key} allowed={['absent', 'unknown']} required current={fact.state} />
                    </SpaceBetween>
                </SpaceBetween>
            }
        />
    );
}

function TagsRow({ fact }: { fact: TagsFact }) {
    const { setValue, setState } = useExplorer();
    const [error, setError] = useState<string | null>(null);
    return (
        <FactRow
            factKey={fact.key}
            needs={fact.needs}
            name={
                <>
                    <code className="tpe-name">tags</code>
                    <span className="tpe-type">{fact.typeName}</span>
                </>
            }
            error={error}
            editor={
                <SpaceBetween direction="horizontal" size="xxs" alignItems="center">
                    <CommitInput
                        value={fact.state === 'value' ? fact.text : ''}
                        placeholder={fact.state === 'unknown' ? 'unknown, e.g. {"team": "core"}' : 'none known'}
                        onCommit={(t) => setError(t.trim() ? setValue(fact.key, t) : setState(fact.key, 'unknown'))}
                        ariaLabel="tags"
                    />
                </SpaceBetween>
            }
        />
    );
}

function EntityCard({ entity }: { entity: EntityModel }) {
    return (
        <Container
            header={
                <Header
                    variant="h3"
                    description={entity.type}
                    actions={
                        <SpaceBetween direction="horizontal" size="xxs">
                            {entity.isPrincipal ? <Badge>principal</Badge> : null}
                            {entity.isResource ? <Badge>resource</Badge> : null}
                        </SpaceBetween>
                    }
                >
                    {basename(entity.type)} <span className="tpe-entity-id">{JSON.stringify(entity.id)}</span>
                </Header>
            }
        >
            <div className="tpe-facts">
                {entity.parents ? <ParentsRow fact={entity.parents} /> : null}
                {entity.attrs.map((f) => <FieldRows key={f.key} field={f} depth={0} />)}
                {entity.tags ? <TagsRow fact={entity.tags} /> : null}
                {!entity.parents && !entity.attrs.length && !entity.tags ? (
                    <Box color="text-body-secondary">No attributes.</Box>
                ) : null}
            </div>
        </Container>
    );
}

/** The request and the entities it touches, as editable forms. */
export default function FactsPanel() {
    const { model } = useExplorer();
    const { principal, action, resource, context } = model.request;
    return (
        <SpaceBetween size="m">
            <Container header={<Header variant="h2" description="What is known about the request.">Request</Header>}>
                <div className="tpe-facts">
                    <UidRow name="principal" fact={principal} />
                    <ActionRow fact={action} />
                    <UidRow name="resource" fact={resource} />
                    {context.length ? <div className="tpe-facts-heading">context</div> : null}
                    {context.map((f) => <FieldRows key={f.key} field={f} depth={0} />)}
                </div>
            </Container>
            {model.entities.length ? (
                <Header variant="h2" description="Entities the request or the remaining policies refer to.">
                    Entities
                </Header>
            ) : (
                <Box color="text-body-secondary">
                    Entities appear here once the request or a remaining policy refers to them.
                </Box>
            )}
            {model.entities.map((e) => <EntityCard key={e.uid} entity={e} />)}
        </SpaceBetween>
    );
}

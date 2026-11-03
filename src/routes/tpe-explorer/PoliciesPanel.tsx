import React, { useState } from 'react';
import {
    Alert,
    Badge,
    Box,
    Button,
    Container,
    ExpandableSection,
    Header,
    SpaceBetween,
    StatusIndicator,
    StatusIndicatorProps,
} from '@cloudscape-design/components';
import Suggestions from './Suggestions';
import { related, useExplorer } from './context';
import type { DecisionModel, PolicyModel, Token } from './types';

const STATUS: Record<PolicyModel['status'], [StatusIndicatorProps.Type, string]> = {
    residual: ['pending', 'Waiting on unknown facts'],
    satisfied: ['success', 'Applies'],
    'not-satisfied': ['stopped', "Doesn't apply"],
    error: ['warning', "Doesn't apply (it would error)"],
};

const STATUS_DETAIL: Partial<Record<PolicyModel['status'], string>> = {
    satisfied: 'Its scope and conditions all hold for what you have filled in.',
    'not-satisfied': 'Its scope or a condition is ruled out by what you have filled in.',
    error: 'Evaluating it would fail (for example, reading an attribute that is absent), so it does not apply.',
};

/** A residual expression; tokens are linked to the facts they depend on. */
function Residual({ tokens }: { tokens: Token[] }) {
    const { hovered, setHovered, revealFact } = useExplorer();
    return (
        <pre className="tpe-code tpe-residual">
            <span className="tpe-t-keyword">when</span> {'{ '}
            {tokens.map((t, i) => {
                const mark = t.marks[t.marks.length - 1];
                const cls = `tpe-t-${t.style}${mark && t.marks.some((m) => related(m, hovered)) ? ' tpe-t-hovered' : ''}`;
                if (!mark) return <span key={i} className={cls}>{t.text}</span>;
                return (
                    <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        className={`tpe-token ${cls}`}
                        onMouseEnter={() => setHovered(mark)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => revealFact(mark)}
                        title="Show this fact"
                    >
                        {t.text}
                    </button>
                );
            })}
            {' }'}
        </pre>
    );
}

function PolicyCard({ policy }: { policy: PolicyModel }) {
    const { suggestPolicy, revealFact, setHovered } = useExplorer();
    const [settleOpen, setSettleOpen] = useState(false);
    const [type, text] = STATUS[policy.status];
    return (
        <Container
            className={policy.relevant ? undefined : 'tpe-policy-irrelevant'}
            header={
                <Header
                    variant="h3"
                    actions={policy.isReason ? <Badge color="green">decides the request</Badge> : undefined}
                    description={<StatusIndicator type={type}>{text}</StatusIndicator>}
                >
                    <span className={`tpe-effect tpe-effect-${policy.effect}`}>{policy.effect}</span>{' '}
                    {policy.id}
                </Header>
            }
        >
            <SpaceBetween size="s">
                {policy.status === 'residual' ? (
                    <Residual tokens={policy.residual} />
                ) : (
                    <Box variant="small" color="text-body-secondary">{STATUS_DETAIL[policy.status]}</Box>
                )}
                {policy.needs.length ? (
                    <div className="tpe-needs">
                        <span className="tpe-needs-label">Waiting on</span>
                        {policy.needs.map((n) => (
                            <button
                                key={n.key}
                                type="button"
                                className="tpe-need-chip"
                                onMouseEnter={() => setHovered(n.key)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => revealFact(n.key)}
                            >
                                {n.label}
                            </button>
                        ))}
                    </div>
                ) : null}
                {policy.status === 'residual' && policy.relevant ? (
                    <ExpandableSection
                        headerText="Ways to settle it"
                        expanded={settleOpen}
                        onChange={({ detail }) => setSettleOpen(detail.expanded)}
                    >
                        {settleOpen ? (
                            <Suggestions
                                load={() => suggestPolicy(policy.id)}
                                emptyText="No assignment of the unknown facts settles this policy."
                                onApplied={() => setSettleOpen(false)}
                                onClose={() => setSettleOpen(false)}
                            />
                        ) : null}
                    </ExpandableSection>
                ) : null}
                {policy.source ? (
                    <ExpandableSection headerText="Original policy">
                        <pre className="tpe-code">{policy.source}</pre>
                    </ExpandableSection>
                ) : null}
            </SpaceBetween>
        </Container>
    );
}

/** The overall decision. */
export function DecisionBanner({ decision, onExplain }: { decision: DecisionModel; onExplain: () => void }) {
    const config = {
        allow: { type: 'success' as const, header: 'Allowed' },
        deny: { type: 'error' as const, header: 'Denied' },
        undecided: { type: 'info' as const, header: 'Not decided yet' },
        error: { type: 'warning' as const, header: 'Could not evaluate' },
    }[decision.state];
    return (
        <Alert
            type={config.type}
            header={config.header}
            action={
                decision.state === 'allow' || decision.state === 'deny' ? (
                    <Button onClick={onExplain}>Why?</Button>
                ) : undefined
            }
        >
            {decision.summary}
            {decision.warnings?.map((w) => (
                <Box key={w} variant="small" color="text-status-warning">{w}</Box>
            ))}
        </Alert>
    );
}

/** The policies, as cards: those that still matter first. */
export default function PoliciesPanel() {
    const { model } = useExplorer();
    const relevant = model.policies.filter((p) => p.relevant);
    const irrelevant = model.policies.filter((p) => !p.relevant);
    return (
        <SpaceBetween size="m">
            <Header variant="h2" description="Each policy, partially evaluated against what is known.">
                Policies
            </Header>
            {relevant.map((p) => <PolicyCard key={p.id} policy={p} />)}
            {irrelevant.length ? (
                <ExpandableSection
                    defaultExpanded
                    headerText={`No longer affect the outcome (${irrelevant.length})`}
                >
                    <SpaceBetween size="m">
                        {irrelevant.map((p) => <PolicyCard key={p.id} policy={p} />)}
                    </SpaceBetween>
                </ExpandableSection>
            ) : null}
        </SpaceBetween>
    );
}

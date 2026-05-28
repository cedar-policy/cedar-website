import { policySetTextToParts, policyToJson } from '@cedar-policy/cedar-wasm';
import type { StaticPolicySet } from '@cedar-policy/cedar-wasm';

/**
 * Parses a policy set string into a record keyed by @id annotations.
 * Policies without @id get a fallback name like "policy0".
 */
export function parsePoliciesWithIds(policyText: string): StaticPolicySet {
    const parts = policySetTextToParts(policyText);
    if (parts.type !== 'success' || parts.policies.length === 0) {
        // Return raw string so downstream cedar-wasm calls handle parse errors
        return policyText;
    }
    const record: Record<string, string> = {};
    for (const p of parts.policies) {
        const parsed = policyToJson(p);
        let id: string;
        if (parsed.type === 'success' && parsed.json.annotations?.id) {
            id = parsed.json.annotations.id;
        } else {
            id = `policy${Object.keys(record).length}`;
        }
        record[id] = p;
    }
    return record;
}

import { describe, it, expect } from 'vitest';
import { parsePoliciesWithIds } from '../src/util/policyHelpers';

describe('parsePoliciesWithIds', () => {
    it('should use @id annotations as policy keys', () => {
        const policies = `@id("my-permit")
permit(principal, action, resource);

@id("my-forbid")
forbid(principal, action, resource);`;

        const result = parsePoliciesWithIds(policies);
        expect(result).toBeTypeOf('object');
        expect(result).toHaveProperty('my-permit');
        expect(result).toHaveProperty('my-forbid');
    });

    it('should fall back to policy0, policy1 for policies without @id', () => {
        const policies = `permit(principal, action, resource);
forbid(principal, action, resource);`;

        const result = parsePoliciesWithIds(policies);
        expect(result).toBeTypeOf('object');
        expect(result).toHaveProperty('policy0');
        expect(result).toHaveProperty('policy1');
    });

    it('should handle a mix of @id and no @id', () => {
        const policies = `@id("named")
permit(principal, action, resource);

forbid(principal, action, resource);`;

        const result = parsePoliciesWithIds(policies);
        expect(result).toBeTypeOf('object');
        expect(result).toHaveProperty('named');
        expect(result).toHaveProperty('policy1');
    });

    it('should return the raw string for unparseable input', () => {
        const result = parsePoliciesWithIds('not valid cedar');
        expect(result).toBe('not valid cedar');
    });
});

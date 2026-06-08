import { describe, it, expect } from 'vitest';
import { importCedarPlaygroundDataFromBase64 } from '../src/playground-helpers/playgroundExportHelpers';

// This base64 payload was generated from the previous version of cedarpolicy.com
// which stored schemas in JSON format. The schema field contains a JSON string like:
// {"PhotoApp":{"commonTypes":{...},"entityTypes":{...},"actions":{...}}}
const LEGACY_BASE64_PAYLOAD = 'H4sIAAAAAAAAA81WW0/bMBT+K5GfNqlCKxe1BPGQXZiQJo1tHS8EIeO41FNie7YDVFX/+46Pk9QNhVG2B/rk+tw+f+ecr10QxgtqzrmxQkmSkv2d4XDnHRkQIR03U8p4ZxsOiC7p/MaoWhYfqaMkXRDKHBoXxM01hwRnM+VUpnWaZsEEqQq4vxX8Dm1kOSBMQfZ7B9eLnNDazbh0glHHi5ykztR8CWH+zgluwesC3GrhjXDwheCUR6V+Wm5yMsgJ+oALJK/hbphDNajgnLEh2N+eBqfx4Whv/2A0PtzdG+0f7o5HY0yh4b1KnsqpMhX1LwiB9MYX3T0AD0kr3pSxXRlfR1MDoH2li8dxfgb+9DrYJsvV1AguC+tBbxGfnU84rSDoEsOe4glP/dqGW1Ubxnd+6ZsHfGkjbqEv8GVKS8u9kTEYABfMV1fYpfmjFbPWe1WTzipaeMZ6lP0d/vPpi97wf6p0JD+Z+tJPu83Oz05weFrSiFalYHMYZBiuSrjkTS4T+AC5kglNy+T4OFkHkHqiIIh7EOgcNm3dM6yY9+3Wq/Nv27oegScMoAynGy9C63P59iiXudwKpHWgEfN/Rgm1c3kHOpAsVsiFTB5MUlwzWR4B4R3AjSrkcbYa1I2K16C2ysaooFRRWLwkPtqyGa9oELA2LEwUU1Wl5AQyNit0hoIyCYMWj9x3zpQpcMr8SInr2rUxQW1i5y9KNtvZyE9s/AHRaMad+hDUdbuKQvd8P907Li3qX6x5QHRRBLE1/HctDGo2zjnuRk/M44zvlSo5lf1Y1PuAPIhJxF0Qdn+yM7rNczqd30jT4zK/0oOoawFcxatrbr5OW3gXAV4jFZfeJfq+NeZQpNmOF7x4TZdXXWzkOW5hrMn9PgxiyX9+8zbTk5XXdYURXUmkqbl/IUVZ/NBt43FGUY8a2iJJQha1LuE/x0R1P39BW3pNx+Rx95GVIBGRa5PYW5u/PD2oa6sa0DHDgf1XBakU1mGcfRWI4APSbGmlSw6y2wr3SUntrDN8q7mZn8qC35P03XL5B9cBYLLpCgAA';

describe('playgroundExportHelpers', () => {
    it('should convert legacy JSON schema to Cedar text format on import', () => {
        const result = importCedarPlaygroundDataFromBase64(LEGACY_BASE64_PAYLOAD);
        expect('result' in result).toBe(true);
        if (!('result' in result)) return;

        const schema = result.result.playgroundData.schema;

        // Should NOT be JSON anymore
        expect(schema.startsWith('{')).toBe(false);

        // Should be Cedar text format — contains namespace keyword
        expect(schema).toContain('namespace PhotoApp');
        expect(schema).toContain('entity User');
        expect(schema).toContain('action "viewPhoto"');
    });
});

import { configDefaults, defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setupTests.ts'],
        // CI checks out cedar here for the TPE explorer build.
        exclude: [...configDefaults.exclude, '.tpe/**'],
        deps: {
            inline: ['@cloudscape-design/components'],
        },
        alias: {
            '@cedar-policy/cedar-wasm': path.resolve(
                __dirname,
                'node_modules/@cedar-policy/cedar-wasm/nodejs/cedar_wasm.js',
            ),
        },
    },
});

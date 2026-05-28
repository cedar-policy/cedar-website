import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import compat from 'eslint-plugin-compat';
import importPlugin from 'eslint-plugin-import';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
    // Global ignores (replaces .eslintignore)
    {
        ignores: ['build/**', 'node_modules/**', 'webpack.config.ts', 'vitest.config.ts', 'eslint.config.mjs', '**/*.test.tsx', '**/*.test.ts', '**/setupTests.ts'],
    },
    // Base configs
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    // React
    react.configs.flat.recommended,
    // React hooks
    reactHooks.configs['recommended-latest'],
    // JSX a11y
    jsxA11y.flatConfigs.recommended,
    // Compat
    compat.configs['flat/recommended'],
    // Import
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    // Project-specific overrides
    {
        plugins: {
            '@stylistic': stylistic,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            polyfills: ['Promise'],
            react: { version: 'detect' },
        },
        rules: {
            // Formatting
            'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
            quotes: ['warn', 'single', { avoidEscape: true }],
            semi: ['warn', 'always'],
            'comma-dangle': ['warn', 'always-multiline'],
            // @stylistic formatting rules
            '@stylistic/indent': ['warn', 4],
            '@stylistic/no-trailing-spaces': 'warn',
            '@stylistic/eol-last': ['warn', 'always'],
            '@stylistic/no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0 }],
            '@stylistic/object-curly-spacing': ['warn', 'always'],
            '@stylistic/arrow-parens': ['warn', 'always'],
            // Disabled checks (from original .eslintrc)
            camelcase: 'off',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'react-hooks/exhaustive-deps': 'off',
            'react/prop-types': 'off',
            'react/display-name': 'off',
        },
    },
);

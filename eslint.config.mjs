import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import compat from 'eslint-plugin-compat';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    // Global ignores (replaces .eslintignore)
    {
        ignores: ['build/**', 'node_modules/**', 'webpack.config.ts', 'eslint.config.mjs', '**/*.test.tsx', '**/*.test.ts', '**/setupTests.ts'],
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
    // Prettier (must be last)
    prettier,
    // Project-specific overrides
    {
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
            indent: ['error', 4, { SwitchCase: 1 }],
            quotes: ['warn', 'single'],
            semi: ['warn', 'always'],
            'comma-dangle': ['warn', 'always-multiline'],
            'space-before-function-paren': ['warn', 'never'],
            // Disabled checks (from original .eslintrc)
            camelcase: 'off',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react/prop-types': 'off',
            'react/display-name': 'off',
        },
    },
);

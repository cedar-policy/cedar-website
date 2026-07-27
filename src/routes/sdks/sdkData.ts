export const LANGUAGE_ICONS = {
    rust: '/img/logos/rust.svg',
    java: '/img/logos/java.svg',
    go: '/img/logos/go.svg',
    wasm: '/img/logos/wasm.svg',
    typescript: '/img/logos/typescript.svg',
    python: '/img/logos/python.svg',
} as const;

export type LanguageIconKey = keyof typeof LANGUAGE_ICONS;

export interface SdkEntry {
    id: string;
    name: string;
    language: string;
    languageIcon: LanguageIconKey;
    repo: string;
    descriptionId: string;
    descriptionDefault: string;
    // Omitted for entries that are cloned rather than published to a registry.
    packageUrl?: string;
    packageRegistry?: string;
}

export const CORE_SDKS: SdkEntry[] = [
    {
        id: 'rust',
        name: 'Cedar (Rust)',
        language: 'Rust',
        languageIcon: 'rust',
        repo: 'https://github.com/cedar-policy/cedar',
        descriptionId: 'sdks.rust.description',
        descriptionDefault:
            'The reference implementation of the Cedar policy language and evaluation engine.',
        packageUrl: 'https://crates.io/crates/cedar-policy',
        packageRegistry: 'crates.io',
    },
    {
        id: 'java',
        name: 'cedar-java',
        language: 'Java',
        languageIcon: 'java',
        repo: 'https://github.com/cedar-policy/cedar-java',
        descriptionId: 'sdks.java.description',
        descriptionDefault:
            'Official Java bindings for the Cedar engine, for authorizing requests from JVM applications and services.',
        packageUrl: 'https://central.sonatype.com/artifact/com.cedarpolicy/cedar-java',
        packageRegistry: 'Maven Central',
    },
    {
        id: 'go',
        name: 'cedar-go',
        language: 'Go',
        languageIcon: 'go',
        repo: 'https://github.com/cedar-policy/cedar-go',
        descriptionId: 'sdks.go.description',
        descriptionDefault:
            'A native Go implementation of the Cedar policy language, with no cgo or WASM dependency.',
        packageUrl: 'https://pkg.go.dev/github.com/cedar-policy/cedar-go',
        packageRegistry: 'pkg.go.dev',
    },
    {
        id: 'wasm',
        name: 'cedar-wasm',
        language: 'JavaScript / TypeScript',
        languageIcon: 'wasm',
        repo: 'https://github.com/cedar-policy/cedar-authorization',
        descriptionId: 'sdks.wasm.description',
        descriptionDefault:
            'WebAssembly build of the Cedar engine for the browser and Node.js. This very site uses it to evaluate policies client-side.',
        packageUrl: 'https://www.npmjs.com/package/@cedar-policy/cedar-wasm',
        packageRegistry: 'npm',
    },
    {
        id: 'python',
        name: 'cedar-py',
        language: 'Python',
        languageIcon: 'python',
        repo: 'https://github.com/k9securityio/cedar-py',
        descriptionId: 'sdks.python.description',
        descriptionDefault:
            'Community-maintained Python bindings for the Rust Cedar engine, for authorizing, validating, and formatting policies from Python.',
        packageUrl: 'https://pypi.org/project/cedarpy/',
        packageRegistry: 'PyPI',
    },
];

export const TOOLING: SdkEntry[] = [
    {
        id: 'expressjs',
        name: 'authorization-for-expressjs',
        language: 'TypeScript',
        languageIcon: 'typescript',
        repo: 'https://github.com/cedar-policy/authorization-for-expressjs',
        descriptionId: 'sdks.expressjs.description',
        descriptionDefault:
            'Middleware that adds Cedar-based authorization to Express.js applications with minimal wiring.',
        packageUrl: 'https://www.npmjs.com/package/@cedar-policy/authorization-for-expressjs',
        packageRegistry: 'npm',
    },
    {
        id: 'vscode',
        name: 'vscode-cedar',
        language: 'TypeScript',
        languageIcon: 'typescript',
        repo: 'https://github.com/cedar-policy/vscode-cedar',
        descriptionId: 'sdks.vscode.description',
        descriptionDefault:
            'The official Visual Studio Code extension: syntax highlighting, validation, and formatting for Cedar policies and schemas.',
        packageUrl: 'https://marketplace.visualstudio.com/items?itemName=cedar-policy.vscode-cedar',
        packageRegistry: 'VS Code Marketplace',
    },
    {
        id: 'examples',
        name: 'cedar-examples',
        language: 'Rust & more',
        languageIcon: 'rust',
        repo: 'https://github.com/cedar-policy/cedar-examples',
        descriptionId: 'sdks.examples.description',
        descriptionDefault:
            'Worked examples of using Cedar to specify and enforce authorization, including the TinyTodo sample application.',
    },
];

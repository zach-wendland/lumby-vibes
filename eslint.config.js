import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    prettier,
    {
        files: ['tests/**/*.js', 'tests/**/*.ts'],
        rules: {
            'no-unused-vars': 'warn', // Allow unused vars in tests
        },
    },
    {
        files: ['**/*.js', '**/*.ts'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                // Node globals
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                // Jest globals
                describe: 'readonly',
                test: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
                // THREE.js global
                THREE: 'readonly',
                // Test setup globals
                global: 'writable',
                Image: 'readonly',
            },
        },
        rules: {
            // Best practices
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': 'off', // Allow console for game logging
            'no-undef': 'error',
            'no-redeclare': 'error',
            'no-var': 'error',
            'prefer-const': 'error',

            // Style (Prettier handles most of this)
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],

            // Modern JS
            'prefer-arrow-callback': 'warn',
            'prefer-template': 'warn',
            'object-shorthand': 'warn',

            // Potential bugs
            'no-prototype-builtins': 'error',
            'no-async-promise-executor': 'error',
            'require-atomic-updates': 'error',
        },
    },
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'coverage/**',
            '*.min.js',
            '**/*.d.ts',
            'package-lock.json',
        ],
    },
];

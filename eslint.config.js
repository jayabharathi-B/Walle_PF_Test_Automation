import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';

export default [
  // Ignore generated folders
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'auth/**',
      '.auth/**'
    ],
  },
{
  files: ['tests/**/*.ts'],
  rules: {
    'no-console': 'off'
  }
},
  // Base JS rules
  js.configs.recommended,

  // TypeScript + Playwright rules
  {
    files: ['**/*.ts'],
    languageOptions: {
  parser: tsParser,
  parserOptions: {
    sourceType: 'module',
  },
  globals: {
    process: 'readonly',
    __dirname: 'readonly',
    console: 'readonly',
    Buffer: 'readonly',
    fetch: 'readonly'
  }
},

    plugins: {
      '@typescript-eslint': tseslint,
      playwright,
    },
    rules: {
      /* 🔴 Playwright hygiene */
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'warn',
      'playwright/no-skipped-test': 'warn',
      'playwright/expect-expect': 'error',

      /* 🧹 Code hygiene */
      'no-console': 'warn',
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'error',

      /* 🧠 Maintainability */
      'complexity': ['warn', 10],
      'max-lines-per-function': ['warn', 60],
    },
  },
];

import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import { importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';
import { configs as typescriptConfigs } from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{ts,tsx,js}'],
    extends: [
      js.configs.recommended,
      typescriptConfigs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat['recommended-latest'],
      jsxA11y.flatConfigs.recommended,
      reactRefresh.configs.vite(),
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-use-before-define': 'error',
      camelcase: ['error', { properties: 'always' }],
      curly: 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'max-len': ['error', { code: 130, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: 'react{,-dom,-dom/**,-router}', group: 'external', position: 'before' },
            { pattern: '*.css', patternOptions: { matchBase: true }, group: 'index', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Safari/VoiceOver drops list semantics from lists styled with `list-style: none` unless role="list" is explicit.
      'jsx-a11y/no-redundant-roles': ['error', { ul: ['list'] }],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/no-array-index-key': 'error',
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/tests/**/*.{ts,tsx}'],
    extends: [vitest.configs.recommended],
    rules: {
      'vitest/valid-expect': ['error', { maxArgs: 2 }],
    },
    languageOptions: {
      globals: { ...vitest.environments.env.globals },
    },
  },
  prettierRecommended
);

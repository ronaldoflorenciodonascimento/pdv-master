import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['out/**', 'installer/**', 'node_modules/**', '.npm-cache/**'] },
  { files: ['**/*.{js,mjs}'], languageOptions: { globals: globals.node } },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsparser, parserOptions: { sourceType: 'module' }, globals: { ...globals.browser, ...globals.node } },
    plugins: { '@typescript-eslint': tseslint },
    rules: { ...tseslint.configs.recommended.rules, '@typescript-eslint/no-explicit-any': 'error' }
  },
  prettier
];

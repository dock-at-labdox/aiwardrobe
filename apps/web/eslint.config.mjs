import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from '@aiwardrobe/shared-config/eslint.base.mjs';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...baseConfig,
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
];

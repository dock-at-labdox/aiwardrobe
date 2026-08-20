import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

export default [
  ...nextCoreWebVitals,
  {
    ignores: ['**/dist/**', '**/generated/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
];

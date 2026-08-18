import baseConfig from './packages/shared-config/eslint.base.mjs';

export default [
  ...baseConfig,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
];

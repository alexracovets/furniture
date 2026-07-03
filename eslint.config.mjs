import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/**']),
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      'object-curly-newline': 'off',

      'import/no-duplicates': ['error', { 'prefer-inline': false }],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@configurator/utils/*'],
              message: 'Use @configurator/utils barrel — not @configurator/utils/loading|print|material|render subpaths.',
            },
          ],
        },
      ],

      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          ignoreCase: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
  {
    files: ['src/types/**/*.ts', 'src/configurator/types/**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['typeAlias', 'interface'],
          format: ['PascalCase'],
          custom: {
            regex: 'Type$',
            match: true,
          },
        },
      ],
    },
  },
  {
    files: ['src/store/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@configurator/utils',
                '@configurator/utils/*',
                '@configurator/scene',
                '@configurator/scene/*',
                '@configurator/runtime',
                '@configurator/runtime/*',
                '@configurator/canvas',
                '@configurator/canvas/*',
                '@configurator/hooks',
                '@configurator/hooks/*',
                '@configurator/gizmo',
                '@configurator/gizmo/*',
                '@configurator/shaders',
                '@configurator/shaders/*',
                '@configurator/providers',
                '@configurator/providers/*',
              ],
              message: 'Use @configurator bootstrap facade, @configurator/mappers, or @configurator/constants from store code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/components/atomic/atoms/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@store', message: 'Atoms are presentational — pass data via props from organisms/molecules.' }],
          patterns: [
            {
              group: ['@configurator', '@configurator/*'],
              message: 'Atoms must not import the 3D configurator module.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/configurator/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@utils', message: 'Configurator module must not depend on @utils — pass data from callers or use relative imports inside utils.' }],
          patterns: [
            {
              group: ['@utils/*'],
              message: 'Configurator module must not depend on @utils.',
            },
            {
              group: ['@configurator/utils/*'],
              message: 'Use @configurator/utils barrel — not domain subpaths (loading|print|material|render).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/components/atomic/molecules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@configurator', message: 'Molecules may only import types from @configurator/types.' }],
          patterns: [
            {
              group: [
                '@configurator/hooks',
                '@configurator/hooks/*',
                '@configurator/utils',
                '@configurator/utils/*',
                '@configurator/scene',
                '@configurator/scene/*',
                '@configurator/runtime',
                '@configurator/runtime/*',
                '@configurator/canvas',
                '@configurator/canvas/*',
                '@configurator/gizmo',
                '@configurator/gizmo/*',
                '@configurator/shaders',
                '@configurator/shaders/*',
                '@configurator/providers',
                '@configurator/providers/*',
                '@configurator/mappers',
                '@configurator/mappers/*',
                '@configurator/constants',
                '@configurator/constants/*',
                '@configurator/bootstrap',
                '@configurator/bootstrap/*',
              ],
              message: 'Molecules may only import types from @configurator/types.',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;

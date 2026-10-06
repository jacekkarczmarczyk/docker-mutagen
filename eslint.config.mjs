// Flat config for eslint 10, meant as the pilot for migrating eslint-config-jkarczm off eslintrc.
//
// It mirrors the rules that podatkipodatki.pl gets today from `jkarczm/vuetify`, minus everything
// Vue- and sonarjs-specific. Mapping notes, since eslintrc names do not survive the move one to one:
// - every core formatting rule was removed from eslint 10 and lives in @stylistic now, so `semi`,
//   `comma-dangle`, `arrow-parens`, `padding-line-between-statements`, `member-delimiter-style` and
//   friends are configured there, including the ones that used to need a `@typescript-eslint/*` twin;
// - `standard-with-typescript` has no flat build; `neostandard` is its successor and brings the
//   standard rule set in flat form;
// - `eslint-plugin-import` is replaced by `eslint-plugin-import-x` (same rules, `import-x/*` names),
//   `eslint-plugin-node` by `eslint-plugin-n`;
// - `newline-after-var` and `@typescript-eslint/indent` are gone for good: the first is covered by
//   padding-line-between-statements below, the second by @stylistic/indent;
// - `@typescript-eslint/no-implicit-any-catch` is gone too, replaced by the compiler's
//   `useUnknownInCatchVariables`, which strict mode in tsconfig.json already turns on.
import eslint from '@eslint/js';
import globals from 'globals';
import importX from 'eslint-plugin-import-x';
import neostandard from 'neostandard';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

const productionOnly = process.env.NODE_ENV === 'production' ? 'error' : 'off';

export default tseslint.config(
  { ignores: ['bin'] },
  eslint.configs.recommended,
  ...neostandard({ noJsx: true, noStyle: true, semi: true, ts: true }),
  tseslint.configs.recommendedTypeChecked,
  stylistic.configs.customize({
    arrowParens: false,
    braceStyle: '1tbs',
    commaDangle: 'always-multiline',
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.es2023 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // neostandard registers n, promise and @typescript-eslint itself, and a flat config may not
    // redefine a plugin name — so only the plugins it does not ship are added here.
    plugins: {
      'import-x': importX,
      'sort-destructure-keys': sortDestructureKeys,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-debugger': productionOnly,
      'object-shorthand': ['error', 'always'],
      'no-empty': 'error',
      'one-var': ['error', 'never'],
      'prefer-destructuring': ['error', {
        VariableDeclarator: { array: false, object: true },
        AssignmentExpression: { array: false, object: false },
      }],
      'arrow-body-style': 'off',
      'sort-imports': ['error', {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      }],
      'no-unused-vars': 'off',
      'no-useless-constructor': 'off',

      // @stylistic — formatting, including what used to be core and @typescript-eslint twins
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/function-call-spacing': 'off',
      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'semi' },
        singleline: { delimiter: 'semi' },
      }],
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/one-var-declaration-per-line': ['error', 'always'],
      '@stylistic/padding-line-between-statements': ['error',
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', 'always'],

      'sort-destructure-keys/sort-destructure-keys': 'error',
      'promise/prefer-await-to-then': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'n/no-callback-literal': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],

      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/prefer-function-type': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      // Numbers in template literals are idiomatic here (counts, exit codes, timeouts).
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
);
